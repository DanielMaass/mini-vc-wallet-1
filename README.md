# mini-vc-wallet Monorepo

Monorepo (pnpm workspaces) mit zwei Apps und zwei Shared-Packages:

- Client: Vite + React + TypeScript + TailwindCSS + shadcn/ui
- Server: NestJS mit tRPC (Express Adapter). REST ist nur für Healthcheck aktiv.
- packages/trpc: tRPC-Helper für Client/Server
- packages/contracts: gemeinsame Zod-Schemas und Typen

## Voraussetzungen

- Node.js >= 22
- pnpm (wird per Corepack aktiviert). Das Repo pinnt pnpm@10.18.0.

## Installation

```bash
pnpm install
```

## Entwicklung

Startet Client und Server parallel mit Hot Reload:

```bash
pnpm dev
```

Oder einzeln:

```bash
pnpm dev:client
pnpm dev:server
```

Erwartete URLs (lokal):

- Client: http://localhost:5173
- API Base: http://localhost:3000/api
- tRPC: http://localhost:3000/api/trpc
- Health: http://localhost:3000/api/health

Hinweis: Der Client liest die Basis-URL aus VITE_API_BASE. Siehe „Umgebungsvariablen“.

## Build

Baue alle Pakete rekursiv:

```bash
pnpm -r run build
```

## Lint & Format

```bash
pnpm lint
pnpm format
```

## API Oberfläche

- Globaler Prefix: /api
- tRPC Endpoint: POST /api/trpc (Batch unterstützt)
  - Wichtige Procedures: createCredential, listCredentials, getCredentialById, deleteCredentialById, verifyCredential, listPublicKeys, listIds
- REST: GET /api/health (einfacher Healthcheck)

## Datenablage

Dateibasierter Storage im Server-Container/Prozessverzeichnis:

- Credentials: data/credentials.json
- Keys: data/keys.json

Eigenschaften:

- Persistenz via JSON-Dateien, kein Locking (ok für Prototyp)
- Verzeichnisse werden bei Bedarf erzeugt

Konfiguration (optional) via Umgebungsvariablen:

- CREDENTIALS_FILE: Pfad zur Credentials-Datei (Default: ./data/credentials.json)

## Umgebungsvariablen

Lokal (Vite): erstelle apps/client/.env.local (optional):

```ini
VITE_API_BASE=http://localhost:3000/api
```

Docker Compose erwartet eine .env im Repo-Root, z. B.:

```ini
NODE_ENV=production
PORT=3000
VITE_API_BASE=http://server:3000/api
```

## Docker

Mit Compose bauen und starten:

```bash
docker compose up --build -d
```

- Client: http://localhost:5173
- Server: http://localhost:3000/api/health

Nur Server-Image:

```bash
docker build -t mini-server ./apps/server
docker run -p 3000:3000 --env-file .env mini-server
```

Nur Client-Image:

```bash
docker build -t mini-client ./apps/client
docker run -p 5173:80 mini-client
```

Cleanup:

```bash
docker compose down --volumes --remove-orphans
```

## Projektstruktur

```
apps/
  client/
  server/
packages/
  trpc/
  contracts/
```

## Tooling-Notizen

- ESLint 8.57.x wird verwendet (React Hooks Plugin kompatibel). Upgrade auf ESLint 9 möglich, sobald Plugins kompatibel sind.
- TypeScript ist auf NodeNext/ESM ausgerichtet. Falls Bibliotheken nur CJS sind, ggf. package-spezifisch auf CommonJS umstellen.
- Prettier formatiert den Code via pnpm format.

## Troubleshooting

- CORS im Dev: Der Server erlaubt http://localhost:5173 für /api/trpc. Stelle sicher, dass VITE_API_BASE korrekt gesetzt ist.
- pnpm/Corepack: Das Repo pinnt pnpm in package.json. Falls es hängt: corepack enable erneut ausführen oder Node >= 22 nutzen.
- Docker Build: Die Dockerfiles bauen zunächst die Workspace-Packages (trpc, contracts) und erst dann Apps. Baue bei Bedarf ohne Cache neu.
