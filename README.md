# Poker Match Clock

A production-ready, mobile-first Texas Hold'em home game tournament clock built with Vite + React + TypeScript + Tailwind and deployable to GitHub Pages.

## Features

- 3 core screens: Setup, Live Clock, Tournament Complete.
- Exact Turbo / Average / Long blind presets (editable before start).
- Player Out and Player Rebuy actions with required confirm modals.
- Rebuy window enforcement (time-based only).
- Live metrics: prize pool, chips in play, players remaining, average stack.
- Accurate timer model based on timestamps (refresh-safe, drift-resistant).
- localStorage persistence for in-progress games and setup state.
- Offline-ready installable PWA.
- GitHub Actions Pages deployment workflow.

## Stack

- Vite
- React + TypeScript
- Tailwind CSS
- vite-plugin-pwa
- GitHub Pages Actions deploy

## Project structure

```text
src/
  components/       # Reusable UI pieces (cards, buttons, modal, stat card)
  config/           # Blind preset configuration
  hooks/            # Tournament engine + app state logic
  lib/              # Estimation, formatting, sound, storage, tournament math
  screens/          # Setup, Live Clock, Completion screens
  styles/           # Tailwind/global styling
  types/            # Strong TypeScript domain types
.github/workflows/  # GitHub Pages CI/CD workflow
public/icons/       # PWA icons
```

## Theme and design tokens

Theme colours are defined in `tailwind.config.ts`:
- Primary background: `#2c2c2e`
- Secondary background: `#222224`
- Main text: `#bdbdbd`
- Accent/success/warning/danger/muted supporting colours

## Blind presets

Preset defaults are in `src/config/blindPresets.ts`.

To update presets later, edit that file only. Presets include:
- Name
- Default rebuy window
- Exact blind levels and durations

## Home-game estimate heuristic

Estimated duration shown on setup uses `src/lib/estimate.ts`.

This is an intentionally simple **home-game heuristic**, not a mathematically exact finish predictor. It starts from a blind-structure pressure point and adjusts slightly for:
- player count,
- rebuy window length,
- expected casual rebuy chip inflation.

## Persistence model

Persistence is in `src/lib/storage.ts` using localStorage key `poker-match-clock-state-v1`.

The app restores after refresh/reopen:
- screen state,
- setup draft,
- full live state (level index, elapsed basis, paused/running, players remaining, rebuys, etc.).

## Rebuy timer logic

Elapsed tournament time is derived from timestamps in `src/lib/tournament.ts`:
- `elapsedMsBeforePause`
- `lastResumedAt`

Rebuy is allowed only while elapsed time is within `rebuyWindowMinutes`.

## Local development

```bash
git clone https://github.com/Matthierry/pokerclock.git
cd pokerclock
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages deployment (Actions)

Workflow file: `.github/workflows/deploy.yml`.

It:
1. Installs dependencies
2. Builds the app
3. Uploads Pages artifact from `dist`
4. Deploys with `actions/deploy-pages`

### Required repository settings

In GitHub repo settings:
1. **Settings → Pages → Build and deployment**
2. Set **Source = GitHub Actions**
3. Ensure default branch is `main` (or update workflow trigger accordingly)

Vite base is configured for repository pages:
- `/pokerclock/`

## Exact commands to commit and push initial version

```bash
git add .
git commit -m "feat: initial Poker Match Clock MVP with PWA and Pages deploy"
git branch -M main
git push -u origin main
```

## Notes

- App is intended for casual single-table home tournaments.
- MVP intentionally supports blinds-only flow (no antes, no add-ons, no player names, no undo).
