# Shisho CLI (`cli/`)

Node.js / TypeScript CLI for interacting with Shisho data. Useful for batch operations and scripting that would be tedious through the web UI.

Calls the same REST API endpoints (`/api/*`) as the browser, authenticated with a Firebase Bearer token.

## Auth

The CLI uses a refresh token stored in `~/.config/shisho/config.json` to obtain a short-lived Firebase ID token on each invocation. That token is sent as `Authorization: Bearer <token>` on every API request.

One-time setup:

```bash
shisho login   # opens browser for Google OAuth, stores refresh token locally
```

After that, all commands authenticate automatically.

## Commands (planned)

```bash
shisho import <file>          # bulk import URLs from a text file
shisho list [--tag <tag>]     # list entries, optionally filtered by tag
shisho get <id>               # show a single entry
shisho delete <id>            # mark an entry for deletion
shisho tag <id> --add <tag>   # add a tag to an entry
shisho purge                  # permanently delete all pending_delete entries
```

## Package Structure

Lives in `cli/` in the monorepo. Imports the `Media` type and tag helpers from `shared/`. Has its own `package.json` and extends the root `tsconfig.json`.

HTTP calls use the Node built-in `fetch` (Node 18+) — no additional HTTP client dependency needed.
