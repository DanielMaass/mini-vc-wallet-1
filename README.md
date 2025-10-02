# mini-vc-wallet Monorepo

pnpm Monorepo mit zwei Apps:

- **Client**: Vite + React + TypeScript + TailwindCSS + shadcn/ui
- **Server**: NestJS REST API (+ tRPC) mit file-basiertem Task Storage (JSON)

## Voraussetzungen

- Node.js LTS
- pnpm installiert (`npm i -g pnpm`)

## Installation

```
pnpm install
```

## Entwicklung starten

Startet alle `dev` Scripte parallel:

```
pnpm dev
```

Oder einzeln:

```
cd apps/client && pnpm dev
cd apps/server && pnpm start:dev
```

## Build

```
pnpm build
```

## Lint & Format

```
pnpm lint
pnpm format
```

### Details Linting / Entscheidung ESLint 8

Wir verwenden ESLint 8.57.0, weil `eslint-plugin-react-hooks` derzeit noch kein volles Kompatibilitäts-Release für ESLint 9 liefert. Ein späteres Upgrade ist einfach möglich, indem:

1. Versionsanhebung in root & packages (`eslint` + zugehörige Plugins)
2. Tests: `pnpm lint` muss ohne Peer-Warnungen laufen

### Prettier

Formatierung über `pnpm format` (writes) und optional `prettier --check` falls gewünscht.

## API / tRPC / Storage

Aktuelle Endpunkte (globaler Prefix `/api`):

- `GET /api/health` – Healthcheck
- `GET /api/tasks` – Liste Tasks (file-basiert)
- `POST /api/tasks` – Task anlegen `{ title, description?, dueDate }`

tRPC Endpoint:

- URL: `POST /api/trpc` (Batch / JSON-RPC ähnlich)
- Procedures: `createTask`, `listTasks`

### File-basierter Storage

Tasks werden in einer JSON Datei gespeichert (Default: `./data/tasks.json`).
Konfiguration über `.env`:

```
TASKS_FILE=./data/tasks.json
```

Eigenschaften:

- Persistenz über Neustarts
- Keine parallele Schreibsicherheit (für Prototyp ok)
- Einfach austauschbar gegen DB-Lösung später (Prisma, Drizzle, etc.)

Wechsel zu In-Memory (temporär) möglich durch Anpassung des Services (derzeit fest file-basiert implementiert). Ein späterer Umbau kann einen `TASKS_STORAGE` Switch hinzufügen.

## Health Endpoint

Server liefert (`GET /api/health`):

```json
{ "status": "ok", "time": "<ISO_TIMESTAMP>" }
```

## Warum Tailwind 3.x?

Tailwind 4 ist noch nicht final; wir setzen daher stabile 3.4.x ein, um Breaking Changes zu vermeiden. Upgrade-Pfad bleibt offen.

## Lint FAQ

Typischer Fehler: "ESLint couldn't find the plugin 'eslint-plugin-react'" -> Stelle sicher, dass Root `pnpm install` ausgeführt wurde und keine lokale Node-Version inkonsistent ist. Falls weiterhin Probleme: `pnpm why eslint-plugin-react` prüfen.

## TypeScript & ESLint Kompatibilität

Aktuell: TypeScript 5.9.x + `@typescript-eslint/*` v8.x (unterstützt TS >=5.5). Falls Downgrade auf TS 5.3/5.2 nötig wäre: entweder `@typescript-eslint` wieder auf 6.x oder TS aktuell lassen. Empfehlung: Aktuelle Kombination beibehalten, solange keine Breaking Changes auftreten.

## moduleResolution Migration

Früher verwendete Einstellung `moduleResolution: "Node"` (entsprach "node10") ist deprecated. Wir haben auf:

```
module: "NodeNext"
moduleResolution: "Node16"
```

umgestellt. Das unterstützt native ESM + CommonJS Interop moderner Node-Versionen. Falls Bibliotheken Probleme machen (ältere CJS only), kann temporär auf `module: "CommonJS"` im betroffenen Package gewechselt werden.

### Alternative: Warnung unterdrücken

Falls du (Übergangsphase) noch nicht migrieren möchtest, könntest du in `compilerOptions` setzen:

```json
"ignoreDeprecations": "6.0"
```

Empfehlung: Nur als kurzfristige Maßnahme nutzen.

## Struktur

```
apps/
  client/
  server/
packages/ (optional für shared libs)
```

## Nächste Schritte / Ideen

- Optional: `TASKS_STORAGE` (memory | file | db)
- Persistenz via echte DB (Postgres + Prisma oder Drizzle) falls benötigt
- Auth (JWT) & Rate Limiting
- Shared Types Package (z.B. `packages/types`)
- Tests (Jest + e2e für tRPC / REST)

## Docker

### Build & Run (compose)

```
docker compose up --build -d
```

Client: http://localhost:5173
Server: http://localhost:3000/api/health

### Nur Server Image

```
docker build -t mini-server ./apps/server
docker run -p 3000:3000 --env-file .env mini-server
```

### Nur Client Image

```
docker build -t mini-client ./apps/client
docker run -p 5173:80 mini-client
```

### Environment Variablen

In `.env.example` dokumentiert. Kopiere nach `.env`:

```
cp .env.example .env
```

### Entwicklung vs Produktion

- Aktuelles Setup baut den Client und servt ihn via Nginx (Production Build)
- Für Hot Reload lokal weiterhin `pnpm dev`

### Cleanup

```
docker compose down --volumes --remove-orphans
```
