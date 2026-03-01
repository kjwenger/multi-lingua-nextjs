# Development Guide

## Running GitHub Actions Locally with `act`

[`act`](https://github.com/nektos/act) lets you run GitHub Actions workflows on your local machine using Docker. Useful for testing workflow changes without pushing to GitHub.

### Install

```bash
brew install act
```

### One-time setup

On first run `act` asks which Docker image size to use. Choose **Medium** (`catthehacker/ubuntu:act-latest`) — the Micro image is too stripped-down for npm builds.

To skip the prompt on future runs, create `~/.actrc`:

```
-P ubuntu-latest=catthehacker/ubuntu:act-latest
```

> Make sure Docker Desktop (or Colima) is running and has at least **4 GB RAM** allocated — the Next.js build alone needs ~3 GB.

### Usage

```bash
# Run all jobs triggered by a push event (mirrors what CI runs on every push)
act push

# Run a single job
act push --job lint
act push --job typecheck
act push --job build-app
act push --job build-mcp

# Simulate a pull_request event
act pull_request

# List available jobs without running them
act push --list

# Dry-run (show what would execute)
act push --dryrun

# Pass secrets (if your workflow needs them)
act push --secret MY_SECRET=value
```

### Workflow jobs in this project

| Job | Command | What it does |
|---|---|---|
| `lint` | `npm run lint` | ESLint across the Next.js app |
| `typecheck` | `npx tsc --noEmit` | TypeScript check (Next.js app only) |
| `build-app` | `npm run build` | Next.js production build |
| `build-mcp` | `npm run mcp:install && npm run mcp:build` | MCP server bundle via tsup |

### Gotchas

- **First run is slow** — `act` pulls the runner Docker image (~1 GB for Medium). Subsequent runs are fast.
- **Node modules are re-installed each run** — `act` does not cache `node_modules` between local runs the same way GitHub caches do. This is expected.
- **MCP server `tsc` is intentionally skipped** — The `typecheck` job only checks the Next.js app. The MCP SDK's large type tree OOMs `tsc` even with `--max-old-space-size=4096`. The `build-mcp` job (tsup/esbuild) catches real build errors instead.
- **Docker must be running** — `act` requires Docker to be up before invoking any `act` command.
- **Colima users** — if you use Colima instead of Docker Desktop, prefix `act` commands with `DOCKER_HOST=unix:///Users/$USER/.colima/docker.sock` or ensure the Colima socket is your default Docker context.

### Tips

```bash
# Verbose output (useful when debugging a failing step)
act push --verbose

# Rebuild the runner image (after Docker image updates)
act push --pull

# Use a specific workflow file
act push -W .github/workflows/ci.yml
```
