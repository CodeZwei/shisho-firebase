# SvelteKit App (`app/`)

The SvelteKit app serves two purposes from the same Vercel deployment:

1. **Browser UI** — Svelte 5 pages for viewing, searching, and managing media entries
2. **REST API** — `+server.ts` route handlers at `/api/*` that the CLI and Chrome extension call over HTTP

## Route Structure

```
app/src/routes/
├── +layout.svelte         # global layout, auth state
├── +page.svelte           # home / dashboard
├── media/
│   ├── list/
│   │   └── +page.svelte   # browse and search entries
│   └── import/
│       └── +page.svelte   # bulk import form
└── api/
    └── media/
        ├── +server.ts     # GET (list), POST (create)
        └── [id]/
            └── +server.ts # GET (single), PATCH (update), DELETE
```

`+page.server.ts` files handle server-side data loading for the browser UI. The `/api/*` `+server.ts` files are the REST endpoints consumed by the CLI and extension.

The browser UI calls the same `/api/*` endpoints via `fetch` — it does not use form actions for data mutation.

## Auth

Browser requests are authenticated via an httpOnly session cookie set after Google OAuth. API requests from the CLI/extension use `Authorization: Bearer <firebase-id-token>`. Both are verified in `hooks.ts` before reaching any route handler.

See [firebase/Firebase.md](../firebase/Firebase.md) for the full auth flow.

## Deployment

Deployed on Vercel via `@sveltejs/adapter-vercel`. Each `+server.ts` handler compiles to a separate Vercel serverless function. Auto-deploys from the `main` branch.

See [Vercel.md](Vercel.md) for environment variable setup.

## Tech Stack

- Svelte 5 (runes syntax: `$state`, `$derived`, `$effect`, `$props`)
- SvelteKit 2
- TypeScript strict mode
- `firebase-admin` on the server, Firebase client SDK in the browser only for auth token management
