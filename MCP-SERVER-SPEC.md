# MCP Server Specification for Multi-Lingua

## Background & Motivation

Multi-lingua is a perfect candidate for an MCP server. The reasons go deeper than "it has an API." The app manages a personal, curated dictionary — structured, richly annotated data with five languages per entry, alternative proposals, categories, and ownership. That is precisely the kind of knowledge base an AI assistant benefits most from being able to read and write directly, without the user having to switch context to a browser tab.

Concretely, the use cases that become trivial once an MCP server exists are the ones that feel impossibly tedious to do manually today:

- "Add these 20 vocabulary words from the article I just read to the 'travel' category and auto-translate them" — a task that would take ten minutes of copy-pasting becomes a single conversational instruction.
- "Find all my translations that are missing a German proposal" — impossible from the UI today, trivial for an AI with list + filter access.
- "I pasted a paragraph of Spanish — extract all the nouns, look up which ones I don't have yet, and add the new ones" — a genuinely useful compound workflow that only works when the AI has both the ability to reason about text _and_ direct write access to the vocabulary store.
- "Export my 'business' category and summarize what's in it with example sentences" — combining export with synthesis.
- "Resolve this import conflict: the incoming version has a better German translation but I want to keep my French one" — an AI can make this judgment call if you describe it in natural language.

Beyond individual use cases, there is a deeper point: multi-lingua is already the right tool for language learning assistance, and MCP is what makes that assistance feel native rather than bolted on. An AI assistant that can silently check whether a word is already in your vocabulary, add it if not, and reference your own established translations when explaining grammar is qualitatively different from one that can only suggest things you then have to manually type somewhere.

The existing REST API is also an unusually clean foundation for this work. Every operation already exists as a well-typed HTTP endpoint with an OpenAPI spec. Writing MCP tool definitions is almost mechanical — it is mostly a matter of choosing the right granularity and writing the right descriptions so that AI assistants invoke the tools confidently.

---

## Architecture Decision

Three implementation options were considered.

### Option A — Standalone MCP server (chosen)

A separate `mcp-server/` package that wraps the multi-lingua REST API via HTTP. The MCP server is a thin client of the existing application — it does not touch the database directly and does not require any changes to the Next.js app.

```
mcp-server/
  index.ts          ← entry point, transport setup, server wiring
  client.ts         ← typed HTTP client for the multi-lingua REST API
  tools.ts          ← all MCP tool definitions
  resources.ts      ← MCP resource definitions (translations, categories)
  package.json      ← standalone package, independently runnable/publishable
  tsconfig.json
```

**Rationale for choosing Option A:**
- Independently runnable: `npx multi-lingua-mcp` — no need to deploy the full Next.js app to use the MCP server in dev
- Independently publishable: can be distributed separately, e.g., on npm
- No coupling to Next.js internals: the boundary between "app" and "AI interface" is clean and explicit
- Local and remote connectivity via the same binary, just different env vars (see below)
- The existing REST API is already the right abstraction boundary

### Option B — Embedded endpoint in the Next.js app (rejected)

Adding `/api/mcp` to the Next.js app. Simpler operationally, but ties the MCP server lifecycle to the web process, complicates testing, and prevents independent distribution.

### Option C — Direct database access (rejected)

The MCP server connecting directly to the SQLite file. Fast, but bypasses all auth and business logic, cannot work for remote instances, and creates a tight coupling to internal schema that would have to be maintained separately.

---

## Local vs Remote Connectivity

The standalone approach handles both local and remote multi-lingua instances identically via environment variables. This is the key design insight: the MCP server is not tied to any specific deployment — it is a bridge that can point anywhere.

```bash
# Local instance (Claude Desktop on the same machine as the app)
MULTI_LINGUA_URL=http://localhost:3456
MULTI_LINGUA_TOKEN=<jwt-from-login>

# Remote instance (Synology NAS or any deployed instance)
MULTI_LINGUA_URL=https://registry.gertrun.synology.me
MULTI_LINGUA_TOKEN=<jwt-from-login>
```

### Authentication Flow

The app uses OTP-based email authentication (no passwords). For MCP usage, the recommended approach is:

1. **User logs in via the browser UI** on the target multi-lingua instance
2. The JWT token is stored in an HTTP-only cookie, but the `/api/auth/me` response also returns it
3. **User copies the token** to `~/.multi-lingua-mcp.json` (or sets `MULTI_LINGUA_TOKEN` env var)
4. The MCP server reads this token and includes it as a `Bearer` header on every request
5. On 401, the server attempts a token refresh via `POST /api/auth/refresh`; if that fails, it surfaces a clear error asking the user to log in again

Token persistence file format (`~/.multi-lingua-mcp.json`):
```json
{
  "token": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresAt": "2026-04-01T00:00:00.000Z",
  "baseUrl": "http://localhost:3456"
}
```

---

## MCP Tools

The following tools are exposed by the MCP server. Each tool maps to one or more REST API calls on the multi-lingua instance. Descriptions are written to be maximally useful for AI assistants — clear enough that a model can choose the right tool without ambiguity.

### Translation Tools

#### `list_translations`
List all translations in the vocabulary store, optionally filtered by category.

**Input:**
```json
{
  "category": { "type": "string", "description": "Optional category name to filter by. Use '__uncategorized__' for translations with no category." }
}
```
**Calls:** `GET /api/translations?category=<name>`

---

#### `get_translation`
Look up a specific translation by its numeric ID or by its English text (exact or case-insensitive match).

**Input:**
```json
{
  "id": { "type": "number", "description": "Numeric translation ID" },
  "english": { "type": "string", "description": "English text to look up (case-insensitive match)" }
}
```
Note: exactly one of `id` or `english` must be provided.

**Calls:** `GET /api/translations` then filters client-side (by english text), or future `GET /api/translations/:id`

---

#### `create_translation`
Add a new entry to the vocabulary store. Can optionally trigger automatic translation via the configured provider.

**Input:**
```json
{
  "english": { "type": "string", "description": "The English text (required)" },
  "german":  { "type": "string" },
  "french":  { "type": "string" },
  "italian": { "type": "string" },
  "spanish": { "type": "string" },
  "category": { "type": "string", "description": "Category name to assign. Created if it does not exist." },
  "auto_translate": { "type": "boolean", "description": "If true, call the active translation provider to fill in missing language fields." }
}
```
**Calls:** optionally `POST /api/translate` first (if `auto_translate: true`), then `POST /api/translations`

---

#### `update_translation`
Update an existing translation entry. Only the fields provided will be changed.

**Input:**
```json
{
  "id": { "type": "number", "description": "ID of the translation to update (required)" },
  "english":  { "type": "string" },
  "german":   { "type": "string" },
  "french":   { "type": "string" },
  "italian":  { "type": "string" },
  "spanish":  { "type": "string" },
  "category": { "type": "string", "description": "New category name, or null to remove category" }
}
```
**Calls:** `PUT /api/translations`

---

#### `delete_translation`
Delete a translation entry by ID.

**Input:**
```json
{
  "id": { "type": "number", "description": "ID of the translation to delete (required)" }
}
```
**Calls:** `DELETE /api/translations?id=<id>`

---

#### `translate_text`
Translate a piece of text using the currently active translation provider, without storing it. Returns translations and alternatives for all five languages.

**Input:**
```json
{
  "text":            { "type": "string", "description": "Text to translate (required)" },
  "sourceLanguage":  { "type": "string", "description": "Source language code (default: 'en'). Options: en, de, fr, it, es" }
}
```
**Calls:** `POST /api/translate`

---

### Category Tools

#### `list_categories`
List all categories with their translation counts.

**Input:** _(none)_

**Calls:** `GET /api/categories`

---

#### `create_category`
Create a new category.

**Input:**
```json
{
  "name": { "type": "string", "description": "Category name (required, must be unique)" }
}
```
**Calls:** `POST /api/categories`

---

#### `delete_category`
Delete a category. Translations in that category will have their category assignment removed but will not be deleted.

**Input:**
```json
{
  "id": { "type": "number", "description": "ID of the category to delete (required)" }
}
```
**Calls:** `DELETE /api/categories?id=<id>`

---

### Export / Import Tools

#### `export_translations`
Export all translations (or a specific category) as a structured JSON payload, in the multi-lingua export format. Useful for backup, inspection, or cross-instance migration.

**Input:**
```json
{
  "category": { "type": "string", "description": "Optional category name to limit the export scope" }
}
```
**Returns:** The decompressed export document (JSON object with `records[]`). The MCP server decompresses the gzip response transparently.

**Calls:** `GET /api/export?category=<name>`

---

#### `import_analyze`
Analyze a set of records against the existing vocabulary to understand what would happen if they were imported. Returns a diff report classifying each record as: `create`, `skip`, `auto_update`, or `conflict`.

**Input:**
```json
{
  "records": {
    "type": "array",
    "description": "Array of translation records in the multi-lingua export format",
    "items": {
      "english": "string",
      "german": "string",
      "french": "string",
      "italian": "string",
      "spanish": "string",
      "proposals": { "english": "string[]", "german": "string[]", ... },
      "category": "string | null"
    }
  }
}
```
**Calls:** `POST /api/import?action=analyze` (wraps records in a valid export document and uploads as multipart)

---

#### `import_execute`
Execute an import with explicit per-record decisions. Typically called after reviewing the output of `import_analyze`.

**Input:**
```json
{
  "decisions": {
    "type": "array",
    "items": {
      "incoming": "object (the translation record)",
      "existingId": "number | null",
      "decision": "create | auto_update | ignore | replace | add_as_new"
    }
  }
}
```
**Calls:** `POST /api/import?action=execute`

---

## MCP Resources

Resources are read-only data exposed for AI assistants to inspect. Unlike tools, they do not perform mutations.

### `multi-lingua://translations`
Live list of all translations visible to the authenticated user.

**URI template:** `multi-lingua://translations{?category}`

Returns the full translation list as a JSON array, optionally filtered by category name.

---

### `multi-lingua://categories`
Live list of all categories with translation counts.

**URI:** `multi-lingua://categories`

Returns all categories as a JSON array: `[{ id, name, translation_count, created_at }]`

---

## Implementation Plan

The work is broken into six incremental tasks, forming a dependency chain:

```
Task 1: mcp-server/ package scaffold
  ├── Task 2: client.ts (HTTP client)
  ├── Task 3: tools.ts (tool definitions)
  ├── Task 4: resources.ts (resource definitions)
  │     └── Task 5: index.ts (entry point + transport wiring)
  │           └── Task 6: root package.json scripts + CLAUDE.md update
  └── Task 7: Configuration & deployment docs appendix (this section)
```

### Task 1 — Package scaffold

Create `mcp-server/` with:
- `package.json` — name: `multi-lingua-mcp`, scripts: `build`, `start`, `start:http`
- `tsconfig.json` — targets Node 20, outputs to `dist/`
- Empty source files: `index.ts`, `client.ts`, `tools.ts`, `resources.ts`
- Dependencies: `@modelcontextprotocol/sdk`, `express` (for HTTP transport)
- Dev dependencies: `typescript`, `@types/node`, `@types/express`, `tsx`

### Task 2 — `client.ts`

Typed HTTP client wrapping all multi-lingua REST endpoints. Token loading from env var or `~/.multi-lingua-mcp.json`. Automatic refresh on 401. Typed return types matching the app's data models.

### Task 3 — `tools.ts`

All tool definitions as described in the "MCP Tools" section above. Each tool registered via `server.tool(name, description, inputSchema, handler)`. Handlers call `client.ts` methods and return results as MCP `TextContent` (JSON-serialised).

### Task 4 — `resources.ts`

Two resource definitions as described in the "MCP Resources" section. Use `ResourceTemplate` for the translations URI to support the optional category query parameter.

### Task 5 — `index.ts`

Server instantiation, tool/resource registration, transport selection:
- `MCP_TRANSPORT=stdio` (default) → `StdioServerTransport`
- `MCP_TRANSPORT=http` → `StreamableHTTPServerTransport` on `MCP_PORT` (default 3457)

### Task 6 — Integration

- Add `mcp:build`, `mcp:start`, `mcp:start:http` scripts to root `package.json`
- Update `CLAUDE.md` with MCP server section

### Task 7 — Configuration docs

Appendix in this file (see section below).

---

## Configuration & Deployment

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MULTI_LINGUA_URL` | `http://localhost:3456` | Base URL of the multi-lingua instance to connect to |
| `MULTI_LINGUA_TOKEN` | _(from config file)_ | JWT session token. Takes precedence over the config file. |
| `MCP_TRANSPORT` | `stdio` | Transport mode: `stdio` for Claude Desktop, `http` for remote/embedded use |
| `MCP_PORT` | `3457` | Port for the HTTP transport (only used when `MCP_TRANSPORT=http`) |
| `MCP_CONFIG_FILE` | `~/.multi-lingua-mcp.json` | Path to the persistent token config file |

### Claude Desktop Configuration (local stdio)

Add the following to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "multi-lingua": {
      "command": "node",
      "args": ["/path/to/multi-lingua-nextjs/mcp-server/dist/index.js"],
      "env": {
        "MULTI_LINGUA_URL": "http://localhost:3456",
        "MULTI_LINGUA_TOKEN": "your-jwt-token-here"
      }
    }
  }
}
```

Or using `npx` once the package is published:

```json
{
  "mcpServers": {
    "multi-lingua": {
      "command": "npx",
      "args": ["-y", "multi-lingua-mcp"],
      "env": {
        "MULTI_LINGUA_URL": "http://localhost:3456",
        "MULTI_LINGUA_TOKEN": "your-jwt-token-here"
      }
    }
  }
}
```

### Remote Instance (Synology NAS)

Point `MULTI_LINGUA_URL` at the deployed instance. The token is obtained the same way — log in via the browser, copy the JWT from the session. Everything else is identical.

```json
{
  "mcpServers": {
    "multi-lingua-remote": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "MULTI_LINGUA_URL": "https://registry.gertrun.synology.me",
        "MULTI_LINGUA_TOKEN": "your-jwt-token-here"
      }
    }
  }
}
```

### Token Acquisition Workflow

Since multi-lingua uses OTP email authentication, there is no password to store. The recommended workflow for obtaining a long-lived token is:

1. Open the multi-lingua web UI in a browser
2. Log in with "Remember Me" checked (extends session to 30 days)
3. Open DevTools → Application → Cookies → copy the `session` cookie value (it is the JWT)
4. Set `MULTI_LINGUA_TOKEN=<that value>` in your Claude Desktop config or `~/.multi-lingua-mcp.json`
5. The MCP server will automatically attempt to refresh it before it expires

**Future enhancement:** A `login` tool in the MCP server that initiates the OTP flow interactively — Claude asks for your email, the server calls `POST /api/auth/login`, Claude prompts for the code, and the server calls `POST /api/auth/verify-login` and stores the resulting token. This would eliminate the manual DevTools step entirely.

### HTTP Transport Mode (standalone process)

If you want to expose the MCP server itself over HTTP (e.g., to allow a remote Claude.ai instance to connect to your local vocabulary store), start it in HTTP mode:

```bash
MCP_TRANSPORT=http MCP_PORT=3457 MULTI_LINGUA_URL=http://localhost:3456 node mcp-server/dist/index.js
```

This starts a Streamable HTTP server on port 3457 that accepts MCP protocol connections. Note that this does not add any additional authentication on top of the MCP protocol itself — if you expose port 3457 publicly, anyone can use it. For remote exposure, put it behind a reverse proxy that handles TLS and authentication.

### Docker Deployment

The MCP server ships as a minimal three-stage Docker image (`mcp-server/Dockerfile`):

1. **deps** — `npm ci --omit=dev` to install only production dependencies
2. **builder** — full install + `npm run build` (tsup) to produce `dist/index.js`
3. **runner** — `node:20-alpine` with production node_modules + bundle; runs as a non-root `mcpserver` user

The image defaults to `MCP_TRANSPORT=http` and `MCP_PORT=3457`.

Both docker-compose files (`docker-compose.yml`, `docker-compose-multi-lingua.yml`) include a `multi-lingua-mcp` service that connects to the `multi-lingua` service via the internal Docker network:

```yaml
multi-lingua-mcp:
  image: registry.gertrun.synology.me/multi-lingua-mcp:VERSION
  ports:
    - "3457:3457"
  environment:
    - MULTI_LINGUA_URL=http://multi-lingua:3456
    - MULTI_LINGUA_TOKEN=${MULTI_LINGUA_TOKEN:-}
```

Set `MULTI_LINGUA_TOKEN` in your `.env` file (same directory as the compose file). Obtain the token via the browser DevTools workflow described above.

**Multi-platform build & push** (see also `CLAUDE.md`):

```bash
DOCKER_HOST=unix:///Users/kjwenger/.colima/docker.sock \
  docker-buildx build \
    --builder multiplatform \
    --platform linux/amd64,linux/arm64 \
    -t registry.gertrun.synology.me/multi-lingua-mcp:VERSION \
    -t registry.gertrun.synology.me/multi-lingua-mcp:latest \
    --push \
    -f mcp-server/Dockerfile \
    mcp-server/
```

---

## Future Enhancements

These are out of scope for the initial implementation but represent natural next steps:

1. **Interactive OTP login tool** — `login` tool that drives the full email-code flow from within Claude, eliminating the manual token copy step.
2. **Bulk operations** — `bulk_create_translations` accepting an array, batching the REST calls to avoid rate limits.
3. **Search tool** — `search_translations` with fuzzy matching across all five language fields, useful for "do I already have a translation for X?"
4. **Proposals tools** — `get_proposals` and `set_proposals` for managing alternative translation suggestions per entry.
5. **Share/unshare tool** — `share_translation` (admin only) to set `user_id = NULL`, making a translation visible to all users.
6. **Published npm package** — publish `multi-lingua-mcp` to npm so users can install it with `npx` without cloning the repo.
7. ~~**Docker image**~~ — **done.** `mcp-server/Dockerfile` (three-stage, `node:20-alpine`), integrated into all docker-compose files, multi-platform buildx command in `CLAUDE.md`.
8. **Anki integration** — a `create_anki_deck` tool that exports a category as a `.apkg` file using `genanki`, bridging multi-lingua and the Anki flashcard system documented in `ANKI.md`.
