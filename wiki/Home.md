# Shisho (Firebase)

Personal media metadata manager. Tracks links to and metadata about images found on the internet. Single-user system hosted on Firebase/Vercel.

This is a re-implementation of Shisho based on Firebase online technologies instead of an offline Sqlite Database.

## Components

| Component | Status | Description |
|---|---|---|
| SvelteKit webapp | In progress | Browser UI; also hosts the REST API at `/api/*` |
| CLI | Not started | Node.js tool for batch operations and scripting |
| Chrome extension | Optional | Quick capture from a browser session |

## Architecture Decision: SvelteKit as the Backend

The SvelteKit app serves two roles: it renders the browser UI **and** hosts the REST API via `+server.ts` route handlers at `/api/*`. The CLI and Chrome extension call these same endpoints over HTTP with a Bearer token. No client accesses Firestore or Firebase Storage directly — all data access goes through the SvelteKit server, which uses the Firebase Admin SDK.

```
┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Browser        │   │   CLI            │   │ Chrome Extension │
│  (session       │   │  (Bearer token)  │   │  (Bearer token)  │
│   cookie)       │   │                  │   │                  │
└────────┬────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                     │                       │
         └─────────────────────┼───────────────────────┘
                               │ HTTPS
                      ┌────────▼────────┐
                      │  SvelteKit app  │
                      │  on Vercel      │
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

## Repo Structure

npm workspaces monorepo with a single `node_modules` and base `tsconfig.json` at the root.

```
/
├── package.json       # root — defines workspaces
├── tsconfig.json      # base TS config; each package extends this
├── app/               # SvelteKit webapp + REST API (Vercel)
├── cli/               # Node.js CLI
├── extension/         # Chrome extension (optional)
└── shared/            # shared TypeScript types and helpers
```

`shared/` is the source of truth for the `Media` type and the tag union helper. All other packages import from it — types are never duplicated.

## Deployment

- Everything (`app/`): Vercel, auto-deploys from `main`. Each `+server.ts` route compiles to a Vercel serverless function.
- Database: Cloud Firestore
- File storage: Firebase Storage (optional per-entry)

## Auth Model

Single authorized user. Two auth paths depending on the client — both end at the same place on the server.

**Browser**: Firebase session cookie, verified with `auth.verifySessionCookie()`.

**CLI / extension**: Firebase ID token sent as `Authorization: Bearer <token>`, verified with `auth.verifyIdToken()`. The CLI obtains a long-lived refresh token via a one-time `shisho login` command and exchanges it for a fresh ID token on each invocation.

Both paths check for the `authorized: true` custom claim. A valid Firebase session alone is not sufficient.

See [firebase/Firebase.md](firebase/Firebase.md) for implementation details.

## Data Model

See [firebase/DataModel.md](firebase/DataModel.md).
