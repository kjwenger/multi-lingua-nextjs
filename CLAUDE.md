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

### Build & push (run from repo root each release)
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
Replace `VERSION` with the current semver (e.g. `0.5.0`).

### Gotchas
- **`docker compose` not found**: use `docker-compose` (hyphenated binary) in this environment.
- **`DOCKER_HOST` env var**: if set, it overrides the Colima socket. Prefix commands with `unset DOCKER_HOST &&` when using native docker-compose, or set it explicitly for buildx.
- **Colima in inconsistent state** (`vz driver is running but host agent is not`): `colima stop --force && colima start`.
- **Stale containers on `up`**: `docker rm -f <container-name>` before `docker-compose up -d`.
- **OOM during build**: builder only uses Colima VM RAM. With <4 GiB the Next.js build is killed. 6 GiB is safe for both arches in parallel.
- **`docker buildx ls`** to verify the `multiplatform` builder is still `running` before a build; re-run create command if it's gone.

---

## Translation Provider Architecture

**IMPORTANT: NEVER implement or speak of a "fallback strategy" for translation providers.**

This application uses ONE translation provider at a time. The user selects a single provider via radio buttons in Settings. That provider is used for all translations. Period.

- No fallback order
- No trying multiple providers
- No provider priority lists
- One provider enabled = one provider used
