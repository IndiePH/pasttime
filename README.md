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
| `npm run test` | Vitest (unit + hook tests) |
| `npm run format` | Prettier |

## CI

On every push and pull request, [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs the same gates as [Quick verify](./docs/QUALITY-CHECKLIST.md#quick-verify-every-pr): `npm ci`, then `lint`, `typecheck`, `test`, and `build`. Node version comes from [`.nvmrc`](./.nvmrc) (aligned with `package.json` `engines`).

### Merge enforcement (GitHub)

CI always reports status on PRs. **Rulesets / branch protection that block merge when checks fail** depend on repo visibility and plan:

| Repo | Plan | Enforced rules on `main` |
|------|------|---------------------------|
| Public | Free (personal or org) | Yes — add ruleset: require PR + **Quality gates** status check |
| Private | Org Free | **No** — rulesets not enforced until org **Team** |
| Private | Personal Free | **No** — need **Pro** for protected branches |
| Private | Org Team / personal Pro | Yes — same ruleset setup as public |

Until upgrade or a public repo: merge only after **Quality gates** is green (manual discipline). See [Slice Q1](./docs/QUALITY-CHECKLIST.md#slice-q1--ci-pipeline-).

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
├── CARD-ASSETS.md       # Playing card SVG layout and paths
├── DESIGN.md            # Hub visual direction
├── IMPLEMENTATION.md    # Build slices
└── QUALITY-CHECKLIST.md # Maintainability, stability, integrity, safety gates
```

**Phase:** Slice 1 complete — hub catalog at `/`.

## Docs

- [Design direction](./docs/DESIGN.md)
- [Implementation slices](./docs/IMPLEMENTATION.md)
- [Quality checklist](./docs/QUALITY-CHECKLIST.md)
