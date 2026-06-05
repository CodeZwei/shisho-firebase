# Workarounds

## `encoding` package in `app/`

`firebase-admin` transitively depends on `node-fetch@2` (via `gaxios`/`teeny-request`), which does an optional `require('encoding')` for charset detection. Without the package present, Vercel's Node File Tracer emits a warning on every build.

`encoding` is installed solely to suppress that warning — it provides no functional benefit. If `firebase-admin` ever upgrades its dependency chain past `node-fetch@2`, this package can be removed from `app/package.json`.
