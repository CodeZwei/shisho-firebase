# Shisho Firebase

Personal media metadata manager for tracking links to and metadata about images found on the internet. Single-user system — auth is access control, not multi-tenancy.

## Architecture

```
┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  SvelteKit App  │   │   CLI (Node.js)  │   │ Chrome Extension │
│  (Vercel)       │   │                  │   │  (optional)      │
└────────┬────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                     │                       │
         └─────────────────────┼───────────────────────┘
                               │ HTTP REST + Bearer token
                      ┌────────▼────────┐
                      │  Backend API    │
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

## Tech Stack

- **Frontend**: SvelteKit 2 / Svelte 5 (runes syntax), TypeScript, deployed on Vercel
- **Backend**: Firebase Functions (preferred) or standalone Node/Express service — not yet built
- **Database**: Cloud Firestore
- **Auth**: Firebase Auth (Google OAuth); single authorized user enforced via custom claim `authorized: true`
- **File storage**: Firebase Storage, optional per-entry (some entries are link-only)
- **CLI**: Node.js, calls backend REST API with a long-lived token

## Data Model

See [wiki/DataModel.md](wiki/DataModel.md).

## Development

```bash
cd client
npm install
npm run dev        # dev server at localhost:5173
npm run check      # svelte-kit sync + type check
npm run lint       # prettier + eslint
npm run build      # production build
```

Environment variables go in `client/.env` (never committed). Required:
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

- `client/src/hooks.ts` imports `GetSession`/`getSession` from `@sveltejs/kit` — these were removed in SvelteKit v2. Firebase integration is currently broken because of this.
- Firebase config is **hardcoded** in `client/src/lib/firebase/client.ts` — must be moved to `PUBLIC_FIREBASE_*` env vars before any further work.
- `client/src/routes/todos/` is dead template code — delete it.
- Backend API service does not exist. Current SvelteKit form actions in `media/import` and `media/list` are placeholders that will be replaced by API calls.
- `firebase` package is on v9; latest is v11.

## Code Conventions

- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) — no legacy `writable` stores or `onMount` where a rune works.
- Server-side code (`+page.server.ts`, `+server.ts`) uses `firebase-admin`. Client-side code uses the `firebase` client SDK only for auth token management.
- All Firestore access goes through the backend API once it exists — no direct client-side Firestore reads/writes.
- TypeScript strict mode. No `any`.
- No comments unless the reason is non-obvious.

## Not Built Yet

- Backend API service (Firebase Functions or Node/Express)
- CLI
- Chrome extension
- Tags implementation on the frontend
- File upload to Firebase Storage
