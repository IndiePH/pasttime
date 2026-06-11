## Summary

- Scaffolded Next.js games hub with catalog home and game launch flows
- Added modular game shell with settings and how-to-play registries
- Implemented Word Guess (Wordle-style) with daily completion tracking, row shake animation, and keyboard key contrast fixes
- Implemented fully playable Klondike Solitaire with drag-and-drop and auto-stack
- Added in-play settings panel shared across games
- Adopted npm workspaces monorepo with platform app split (`apps/web`, `apps/mobile`)
- Aligned React versions and Expo install policy for mobile
- Added GitHub Actions quality gates CI workflow

## Test plan

- [x] Browse games hub catalog at `/games`
- [x] Launch and complete a Word Guess daily puzzle; verify play button routes to results on revisit
- [x] Play Klondike Solitaire — drag cards, auto-stack to foundations, verify win state
- [x] Toggle in-play settings panel in both games
- [ ] Verify CI workflow passes on PR checks
- [ ] Confirm mobile app builds without React version conflicts