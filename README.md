# Pasttime

A games hub — catalog first, individual games as plugins.

## Prerequisites

- Node.js 20 LTS (`nvm use` reads `.nvmrc`)
- npm 10+

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run format` | Prettier |

## Project layout

```
src/
├── app/              # L5 — routes
├── components/       # L3 — shared UI (shadcn + composed)
├── domain/           # L2 — types, registry (no React)
├── features/         # L4 — hub, games
├── infrastructure/   # L1 — storage adapters
└── lib/              # L0 — utilities (cn)
docs/
├── DESIGN.md         # Hub visual direction
└── IMPLEMENTATION.md # Build slices
```

**Phase:** Slice 1 complete — hub catalog at `/`.

## Docs

- [Design direction](./docs/DESIGN.md)
- [Implementation slices](./docs/IMPLEMENTATION.md)
