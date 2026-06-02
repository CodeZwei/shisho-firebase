# Shisho (Firebase)

Personal media metadata manager. Tracks links to and metadata about images found on the internet. Single-user system hosted on Firebase/Vercel.

This is a re-implementation of Shisho based on Firebase online technologies instead of an offline Sqlite Database.

## Components

| Component | Status | Description |
|---|---|---|
| SvelteKit webapp | In progress | Browser UI for querying and managing entries |
| Backend API | Not started | REST service (Firebase Functions or Node); all clients call this |
| CLI | Not started | Node.js tool for batch operations and scripting |
| Chrome extension | Optional | Quick capture from a browser session |

## Architecture Decision: Separate Backend

All clients (webapp, CLI, Chrome extension) call a single backend REST API. No client accesses Firestore or Firebase Storage directly. This is the only design that allows the CLI to function without embedding the web app.

## Repo Structure

npm workspaces monorepo with a single `node_modules` and base `tsconfig.json` at the root.

```
/
├── package.json       # root — defines workspaces
├── tsconfig.json      # base TS config; each package extends this
├── app/               # SvelteKit webapp
├── backend/           # REST API (Firebase Functions or Node/Express)
├── cli/               # Node.js CLI
├── extension/         # Chrome extension (optional)
└── shared/            # shared TypeScript types and helpers
```

`shared/` is the source of truth for the `Media` type and the tag union helper. All other packages import from it — types are never duplicated.

## Deployment

- Frontend (`app/`): Vercel, auto-deploys from `main`
- Backend (`backend/`): Firebase Functions (preferred) or separate Node service
- Database: Cloud Firestore
- File storage: Firebase Storage (optional per-entry)

## Auth Model

Single authorized user. Firebase Auth handles Google OAuth login. A custom claim (`authorized: true`) is set on the one permitted account via the Firebase Admin SDK. The backend verifies this claim on every request — a valid Firebase session alone is not sufficient.

See [Firebase.md](Firebase.md) for implementation notes.

## Data Model

See [DataModel.md](DataModel.md).
