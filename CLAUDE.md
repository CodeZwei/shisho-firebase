# Shisho Firebase

Personal media metadata manager for tracking links to and metadata about images found on the internet. Single-user system — auth is access control, not multi-tenancy.

## Architecture

```
┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  SvelteKit App  │   │   CLI (Node.js)  │   │ Chrome Extension │
│  /app           │   │  /cli            │   │  /extension      │
└────────┬────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                     │                       │
         └─────────────────────┼───────────────────────┘
                               │ HTTP REST + Bearer token
                      ┌────────▼────────┐
                      │  Backend API    │
                      │  /backend       │
                      │  (Firebase      │
                      │   Functions or  │
                      │   Node/Express) │
                      └────────┬────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
    ┌────────▼──────┐ ┌───────▼──────┐ ┌────────▼──────┐
    │  Firestore    │ │  Firebase    │ │  Firebase     │
    │  (metadata)   │ │  Auth        │ │  Storage      │
    └───────────────┘ └──────────────┘ └───────────────┘
```

The backend API is the single source of truth for all data access. The SvelteKit app, CLI, and Chrome extension all call it — no client touches Firebase directly.

## Repo Structure

npm workspaces monorepo. Single `node_modules` and base `tsconfig.json` at the root.

```
/
├── package.json       # root — defines workspaces
├── tsconfig.json      # base TS config; each package extends this
├── node_modules/
├── app/               # SvelteKit webapp (Vercel)
├── backend/           # REST API (Firebase Functions or Node/Express)
├── cli/               # Node.js CLI
├── extension/         # Chrome extension (optional)
└── shared/            # shared TypeScript types and helpers
    └── src/
        ├── types.ts   # Media type and related interfaces
        └── tags.ts    # tag union helper (builds `tags` from category arrays)
```

Each package has its own `package.json` and extends the root `tsconfig.json`. The `shared` package is the source of truth for the `Media` type — all other packages import from it.

## Tech Stack

- **Frontend** (`app/`): SvelteKit 2 / Svelte 5 (runes syntax), TypeScript, deployed on Vercel
- **Backend** (`backend/`): Firebase Functions (preferred) or standalone Node/Express — not yet built
- **CLI** (`cli/`): Node.js / TypeScript, calls backend REST API with a long-lived token
- **Shared** (`shared/`): TypeScript types and pure helpers, no runtime dependencies
- **Database**: Cloud Firestore
- **Auth**: Firebase Auth (Google OAuth); single authorized user enforced via custom claim `authorized: true`
- **File storage**: Firebase Storage, optional per-entry (some entries are link-only)

## Data Model

See [wiki/DataModel.md](wiki/DataModel.md).

## Development

```bash
npm install            # install all workspace dependencies from root

# per-package commands (run from root with -w flag, or cd into the package)
npm run dev -w app     # SvelteKit dev server at localhost:5173
npm run check -w app   # svelte-kit sync + type check
npm run build -w app   # production build
```

Environment variables go in `app/.env` (never committed). Required:
```
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=   # server-side only, base64-encoded
```

## Known Issues

- Current source is in `client/` — needs to be moved to `app/` and the monorepo root scaffolded
- `app/src/hooks.ts` imports `GetSession`/`getSession` from `@sveltejs/kit` — these were removed in SvelteKit v2. Firebase integration is currently broken because of this.
- Firebase config is **hardcoded** in `app/src/lib/firebase/client.ts` — must be moved to `PUBLIC_FIREBASE_*` env vars before any further work.
- `app/src/routes/todos/` is dead template code — delete it.
- Backend API service does not exist. Current SvelteKit form actions in `media/import` and `media/list` are placeholders that will be replaced by API calls.
- `firebase` package is on v9; latest is v11.

## Code Conventions

- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) — no legacy `writable` stores or `onMount` where a rune works.
- Server-side code (`+page.server.ts`, `+server.ts`) uses `firebase-admin`. Client-side code uses the `firebase` client SDK only for auth token management.
- All Firestore access goes through the backend API — no direct client-side Firestore reads/writes.
- The `Media` type and tag helpers live in `shared/` — never duplicate them in `app/`, `cli/`, or `backend/`.
- TypeScript strict mode. No `any`.
- No comments unless the reason is non-obvious.

## Not Built Yet

- Monorepo root scaffold (`package.json` workspaces, root `tsconfig.json`)
- `client/` renamed to `app/`
- `shared/` package with `Media` type and tag helpers
- Backend API service (`backend/`)
- CLI (`cli/`)
- Chrome extension (`extension/`)
- Tags implementation on the frontend
- File upload to Firebase Storage
