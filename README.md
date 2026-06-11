# Pasttime

A games hub — catalog first, individual games as plugins. Available on **web**, **desktop** (Electron), and **mobile** (Expo).

## Prerequisites

- Node.js 20 LTS (`nvm use` reads `.nvmrc`)
- npm 10+

## Quick start (web)

```bash
npm install
cp .env.example apps/web/.env.local   # optional — multiplayer API
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Multiplayer API (optional)

```bash
npm run server:dev    # http://localhost:4000
```

Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `apps/web/.env.local` for live room sync.

## Monorepo layout

```
apps/
├── web/          # Next.js — primary web app (your domain)
├── desktop/      # Electron — loads web URL in a native window
├── mobile/       # Expo / React Native
└── server/       # REST + WebSocket multiplayer API
packages/
├── domain/       # Game catalog, rules (no React)
├── storage/      # Storage adapters (localStorage, AsyncStorage)
└── api-client/   # Typed REST + WebSocket client
docs/
```

Web app layers (`apps/web/src/`):

```
├── app/              # L5 — routes
├── components/       # L3 — shared UI
├── features/         # L4 — hub, games
├── infrastructure/   # L1 — storage provider
├── platform/         # Navigation abstractions
└── lib/              # L0 — utilities
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Web dev server |
| `npm run build` | Web production build |
| `npm run start` | Web production server |
| `npm run lint` | ESLint (web) |
| `npm run typecheck` | TypeScript (all workspaces) |
| `npm run test` | Vitest (all workspaces) |
| `npm run server:dev` | Multiplayer API dev |
| `npm run desktop:dev` | Electron desktop (web on :3000) |
| `npm run mobile:dev` | Expo mobile dev server |

## Environment

Copy [`.env.example`](./.env.example). Key variables:

| Variable | App | Purpose |
|----------|-----|---------|
| `NEXT_PUBLIC_API_URL` | web | REST API base URL |
| `NEXT_PUBLIC_WS_URL` | web | WebSocket URL (optional) |
| `PASTTIME_WEB_URL` | desktop | URL loaded in Electron window |
| `PORT` | server | API port (default 4000) |

Mobile API URL: `apps/mobile/app.json` → `expo.extra.apiUrl`.

## CI

On every push and pull request, [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs: `npm ci`, `lint`, `typecheck`, `test`, `build`.

## Docs

- [Design direction](./docs/DESIGN.md)
- [Implementation slices](./docs/IMPLEMENTATION.md)
- [Quality checklist](./docs/QUALITY-CHECKLIST.md)
