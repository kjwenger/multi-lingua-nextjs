# Claude Code Guidelines for Multi-Lingua

## Docker Multi-Platform Builds

Building `linux/amd64 + linux/arm64` images requires **docker-buildx** (standalone binary, not a `docker` plugin) and a `docker-container` builder backed by Colima.

### One-time setup (already done — skip if builder exists)
```bash
# 1. Ensure Colima has enough RAM (≥6 GiB — Next.js needs ~3 GiB per arch)
colima stop && colima start --memory 6

# 2. Create the multiplatform builder against the Colima socket
DOCKER_HOST=unix:///Users/kjwenger/.colima/docker.sock \
  docker-buildx create --name multiplatform --driver docker-container \
    --platform linux/amd64,linux/arm64 --use
```

### Build & push — main app (run from repo root each release)
```bash
DOCKER_HOST=unix:///Users/kjwenger/.colima/docker.sock \
  docker-buildx build \
    --builder multiplatform \
    --platform linux/amd64,linux/arm64 \
    -t registry.gertrun.synology.me/multi-lingua:VERSION \
    -t registry.gertrun.synology.me/multi-lingua:latest \
    --push \
    .
```

### Build & push — MCP server (run from repo root each release)
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
Replace `VERSION` with the current semver (e.g. `0.6.0`) in both commands.

### Gotchas
- **`docker compose` not found**: use `docker-compose` (hyphenated binary) in this environment.
- **`DOCKER_HOST` env var**: if set, it overrides the Colima socket. Prefix commands with `unset DOCKER_HOST &&` when using native docker-compose, or set it explicitly for buildx.
- **Colima in inconsistent state** (`vz driver is running but host agent is not`): `colima stop --force && colima start`.
- **Stale containers on `up`**: `docker rm -f <container-name>` before `docker-compose up -d`.
- **OOM during build**: builder only uses Colima VM RAM. With <4 GiB the Next.js build is killed. 6 GiB is safe for both arches in parallel.
- **`docker buildx ls`** to verify the `multiplatform` builder is still `running` before a build; re-run create command if it's gone.

---

## MCP Server (`mcp-server/`)

The standalone MCP server lives in `mcp-server/` and wraps the app's REST API. It is a separate npm package — install and build it independently of the Next.js app.

### Setup
```bash
npm run mcp:install   # cd mcp-server && npm install
npm run mcp:build     # uses tsup (esbuild) — outputs single bundle to mcp-server/dist/index.js
```

### Running
```bash
# stdio transport — for Claude Desktop (default)
npm run mcp:start

# HTTP / Streamable-HTTP transport — for remote or embedded use
npm run mcp:start:http          # default port 3457
MCP_PORT=4000 npm run mcp:start:http
```

### Key environment variables
| Variable | Default | Purpose |
|---|---|---|
| `MULTI_LINGUA_URL` | `http://localhost:3456` | URL of the multi-lingua instance |
| `MULTI_LINGUA_TOKEN` | _(from config file)_ | JWT session token |
| `MCP_TRANSPORT` | `stdio` | `stdio` or `http` |
| `MCP_PORT` | `3457` | Port for HTTP transport |
| `MCP_CONFIG_FILE` | `~/.multi-lingua-mcp.json` | Persistent token config |

### Claude Desktop config snippet (macOS)
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "multi-lingua": {
      "command": "node",
      "args": ["/absolute/path/to/multi-lingua-nextjs/mcp-server/dist/index.js"],
      "env": {
        "MULTI_LINGUA_URL": "http://localhost:3456",
        "MULTI_LINGUA_TOKEN": "<your-jwt-token>"
      }
    }
  }
}
```

### Getting a token
1. Log in to the multi-lingua web UI with "Remember Me" checked
2. Open DevTools → Application → Cookies → copy the `session` cookie value
3. Set it as `MULTI_LINGUA_TOKEN` in the Claude Desktop config or `~/.multi-lingua-mcp.json`

### Gotchas
- **All logs go to stderr** — stdout is reserved for the stdio MCP protocol stream
- **HTTP transport is stateless** — a new server+transport pair is created per request (correct by design)
- **`category_id` in updates** — the client resolves category names to IDs automatically; never pass raw IDs in tool calls
- **Build outputs to `mcp-server/dist/`** — the `mcp-server/node_modules/` is separate from the root `node_modules/`; run `mcp:install` before `mcp:build`
- **Build uses `tsup` not `tsc`** — `tsc` OOMs on the MCP SDK's large type tree; use `npm run mcp:build` (tsup/esbuild) for the JS bundle and `npm run type-check` (inside `mcp-server/`) for full type validation

See `MCP-SERVER-SPEC.md` for the full specification, architecture rationale, and deployment guide.

---

## Documentation Update Rules

**IMPORTANT: Always keep documentation in sync with code changes.**

### When the REST API changes (new endpoint, changed parameters, new response fields):
- `lib/swagger.ts` — update the OpenAPI/Swagger spec
- `app/api/openapi/route.ts` — if the OpenAPI route has inline spec, update it there too
- `app/help/page.tsx` → `ApiReference` section — update the relevant endpoint description
- Any README or markdown files that mention the affected endpoint

### When MCP tools or resources change (added, removed, renamed, parameter changes):
- `mcp-server/tools.ts` — primary source of truth (tool definitions)
- `MCP-SERVER-SPEC.md` — add/update the tool's section with input schema and which API it calls
- `app/help/page.tsx` → `McpServerSection` "Available Tools" list — add/update the tool entry
- `app/help/page.tsx` → `DeveloperSection` if it references tool names

---

## Translation Provider Architecture

**IMPORTANT: NEVER implement or speak of a "fallback strategy" for translation providers.**

This application uses ONE translation provider at a time. The user selects a single provider via radio buttons in Settings. That provider is used for all translations. Period.

- No fallback order
- No trying multiple providers
- No provider priority lists
- One provider enabled = one provider used
