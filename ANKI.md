# Self-Hosting Anki on a Synology NAS with Portainer

Self-hosted Anki sync server using Docker (Portainer) on a Synology NAS,
with reverse proxy for HTTPS access.

## 1. Understanding the "API"

There are two different "APIs" in the Anki ecosystem:

1. **Syncing API:** The internal protocol that Anki clients (Desktop, AnkiDroid,
   AnkiMobile) use to synchronize collections with a server. By self-hosting the
   Anki Sync Server, you create your own private endpoint for this protocol.
   This is the focus of this guide.

2. **Card Management API (AnkiConnect):** A RESTful API provided by the
   [AnkiConnect](https://github.com/FooSoft/anki-connect) plugin, which runs on
   the **Anki Desktop application**. It allows external applications to create
   cards, manage decks, and more. Self-hosting the sync server does **not**
   replace AnkiConnect. They serve different purposes but can be used together.

See [API & Programmatic Access](#5-api--programmatic-access) for details.

## 2. Service

| Service          | Image                              | Internal Port | Exposed Port | Purpose                      |
|------------------|------------------------------------|---------------|--------------|------------------------------|
| anki-sync-server | jeankhawand/anki-sync-server:25.07 | 8080          | 27701        | Sync server for Anki clients |

The image is from [jeankhawand/anki-sync-server](https://hub.docker.com/r/jeankhawand/anki-sync-server)
on Docker Hub. It wraps the official Anki Rust sync server. There is no `latest`
tag; use an explicit version tag (e.g., `25.07`).

## 3. Deployment via Portainer

### Prerequisites

1. **Docker on Synology:** Ensure the "Docker" package is installed from the Package Center.
2. **Portainer:** Have Portainer installed and running.
3. **Domain and SSL:** Configure your Synology DDNS so that your domain points to
   your NAS. Obtain a valid SSL certificate (e.g., via Let's Encrypt in
   **Control Panel > Security > Certificate**).
4. **Persistent Data Folder:** Create a dedicated folder on your NAS:
   - Example path: `/volume1/docker/anki-server`

### Deploy the Stack

1. In Portainer, go to **Stacks > Add stack**.
2. **Name:** `anki`
3. **Web editor:** Paste the contents of `portainer-stack-anki.yml`:

```yaml
# Anki Sync Server for Synology NAS (Portainer Stack)
# Image: https://hub.docker.com/r/jeankhawand/anki-sync-server

services:
  anki-sync-server:
    image: jeankhawand/anki-sync-server:25.07
    container_name: anki-sync-server
    ports:
      - "27701:8080"
    volumes:
      - /volume1/docker/anki-server:/anki_data
    environment:
      - SYNC_USER1=your_username:your_very_strong_password
    restart: unless-stopped

networks:
  default:
    name: anki-network
```

4. Before deploying, update:
   - The volume path (`/volume1/docker/anki-server`) to match your NAS.
   - The `SYNC_USER1` value to your desired `username:password`.
   - Add `SYNC_USER2`, `SYNC_USER3`, etc. for additional accounts.
5. Click **Deploy the stack**.

## 4. Reverse Proxy Setup (Synology DSM)

In **Control Panel > Login Portal > Advanced > Reverse Proxy**, create one entry:

| Field                | Value                      |
|----------------------|----------------------------|
| Description          | Anki Sync Server           |
| Source Protocol      | HTTPS                      |
| Source Hostname      | `anki.your-domain.me`      |
| Source Port          | 443                        |
| Destination Protocol | HTTP                       |
| Destination Hostname | `localhost`                |
| Destination Port     | 27701                      |

Under the **Custom Header** tab, click **Create > WebSocket** to add the
required headers for the sync protocol.

Enable **HSTS** and **HTTP/2** for security and performance.

### Configuring Anki Clients

All clients connect to the same sync URL.

**Anki Desktop (2.1.57+):**

1. Open Anki, go to **Preferences > Syncing**.
2. Set the **Self-hosted sync server** URL to `https://anki.your-domain.me`
3. Log in with the credentials from `SYNC_USER1`.

**AnkiDroid (Android):**

1. Go to **Settings > Advanced > Custom sync server**.
2. Set **Sync URL** to `https://anki.your-domain.me`
3. Set **Media sync URL** to `https://anki.your-domain.me/msync`

**AnkiMobile (iOS, 2.0.90+):**

1. Go to **Settings > Syncing > Custom Server**.
2. Enter the sync URL: `https://anki.your-domain.me`

## 5. API & Programmatic Access

### Sync Server Has No REST API

The self-hosted sync server only speaks Anki's internal sync protocol.
There are no endpoints to create decks, add/edit cards, or query collections.
It is purely a data store and sync relay for Anki clients.

### Options for Programmatic Card Creation

| Option                                                                            | Type                | Headless/NAS | Description                                                                 |
|-----------------------------------------------------------------------------------|---------------------|--------------|-----------------------------------------------------------------------------|
| [genanki](https://github.com/kerrickstaley/genanki)                               | Python library      | Yes          | Generate `.apkg` files server-side; users import them into Anki, then sync  |
| [AnkiConnect](https://github.com/FooSoft/anki-connect)                            | Anki desktop plugin | No           | JSON API on `localhost:8765` for full CRUD on decks, cards, tags, and notes |
| [anki-api](https://github.com/0xdeadbeer/anki-api)                                | Anki desktop plugin | No           | REST API plugin, similar to AnkiConnect                                     |
| [AnkiConnect MCP](https://mcpservers.org/servers/spacholski1225/anki-connect-mcp) | MCP server          | No           | AI-assisted card creation via AnkiConnect; requires desktop Anki            |

AnkiConnect and anki-api both require a running Anki desktop instance with the
plugin installed, so they cannot run headless on a NAS.

For a NAS-only workflow (e.g., exporting MultiLingua vocabulary as flashcards),
generating `.apkg` files with genanki is the most practical approach.

## 6. Backups

Regularly back up the persistent data folder (`/volume1/docker/anki-server`).
This folder contains your entire Anki collection and user data. Use Synology's
**Hyper Backup** or another backup solution.
