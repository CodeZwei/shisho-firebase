# Shisho Firebase

Personal media metadata manager for tracking links to and metadata about images found on the internet. Single-user system — auth is access control, not multi-tenancy.

## Architecture

```
┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Browser        │   │   CLI (Node.js)  │   │ Chrome Extension │
│  (session       │   │  /cli            │   │  /extension      │
│   cookie)       │   │  (Bearer token)  │   │  (Bearer token)  │
└────────┬────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                     │                       │
         └─────────────────────┼───────────────────────┘
                               │ HTTPS
                      ┌────────▼────────┐
                      │  SvelteKit app  │
                      │  /app (Vercel)  │
                      │                 │
                      │  UI: routes/*   │
                      │  API: api/*     │
                      └────────┬────────┘
                               │ firebase-admin SDK
             ┌─────────────────┼──────────────────┐
             │                 │                  │
    ┌────────▼──────┐ ┌───────▼──────┐ ┌────────▼──────┐
    │  Firestore    │ │  Firebase    │ │  Firebase     │
    │  (metadata)   │ │  Auth        │ │  Storage      │
    └───────────────┘ └──────────────┘ └───────────────┘
```

The SvelteKit app serves the browser UI and hosts the REST API at `/api/*`. The CLI and Chrome extension call those same endpoints with a Bearer token. No client touches Firebase directly — all data access goes through the SvelteKit server using the Admin SDK.

## Repo Structure

npm workspaces monorepo. Single `node_modules` and base `tsconfig.json` at the root.

```
/
├── package.json       # root — defines workspaces
├── tsconfig.json      # base TS config; each package extends this
├── node_modules/
├── app/               # SvelteKit webapp + REST API (Vercel)
├── cli/               # Node.js CLI
├── extension/         # Chrome extension (optional)
└── shared/            # shared TypeScript types and helpers
    └── src/
        ├── types.ts   # Media type and related interfaces
        └── tags.ts    # tag union helper (builds `tags` from category arrays)
```

Each package has its own `package.json` and extends the root `tsconfig.json`. The `shared` package is the source of truth for the `Media` type — all other packages import from it.

## Tech Stack

- **App** (`app/`): SvelteKit 2 / Svelte 5 (runes syntax), TypeScript, deployed on Vercel. Serves the browser UI and the REST API at `/api/*`.
- **CLI** (`cli/`): Node.js / TypeScript, calls `/api/*` endpoints with a Firebase Bearer token
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

- Backend API routes do not exist. Form actions in `media/import` and `media/list` are placeholders that will be replaced by `+server.ts` API routes.
- `firebase` package is on v9; latest is v11.

## Code Conventions

- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) — no legacy `writable` stores or `onMount` where a rune works.
- Server-side code (`+page.server.ts`, `+server.ts`) uses `firebase-admin`. Client-side code uses the `firebase` client SDK only for auth token management.
- All Firestore access goes through the backend API — no direct client-side Firestore reads/writes.
- The `Media` type and tag helpers live in `shared/` — never duplicate them in `app/`, `cli/`, or `backend/`.
- TypeScript strict mode. No `any`.
- No comments unless the reason is non-obvious.

## Not Built Yet

- REST API routes (`app/src/routes/api/*`)
- CLI (`cli/`)
- Chrome extension (`extension/`)
- Tags implementation on the frontend
- File upload to Firebase Storage
