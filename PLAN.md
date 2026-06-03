# Branch: import-status

Migrating the `Media` type from a flat structure to a nested one (`external`, `user`, `import`), and adding a server-side import action callable from the media details UI.

See [wiki/firebase/DataModel.md](wiki/firebase/DataModel.md) for the final data model.

## Tasks

### Phase 1 — Type System
- [ ] `shared/src/types.ts` — redefine `Media` with nested `external`, `user`, `import` namespaces and top-level `tags_all`
- [ ] `shared/src/tags.ts` — update `buildTags()` to read from `external.tags_*` and `user.tags`

### Phase 2 — Scrapers
- [ ] `app/src/lib/scrapers/rule34.ts` — return shape changes to `{ external: { imageUrl, tags_* } }`
- [ ] `app/src/lib/scrapers/generic.ts` — same
- [ ] Update scraper tests to match new return shape

### Phase 3 — Firestore Layer
- [ ] `app/src/routes/media/_types.ts` — update `mediaConverter` to map to/from the nested structure

### Phase 4 — API Routes
- [ ] `app/src/routes/api/media/+server.ts` — POST writes initial document with `import.status: "unimported"`, `import.last_imported_at: null`
- [ ] `app/src/routes/api/media/[id]/+server.ts` — rewrite PATCH allowed-fields whitelist and use dot-notation for Firestore updates
- [ ] Add `app/src/routes/api/media/[id]/import/+server.ts` — POST endpoint: reads `pageUrl`, runs scraper, writes `external.*`, `tags_all`, and `import.*`

### Phase 5 — UI
- [ ] `app/src/routes/media/[id]/+page.svelte` — update state and form bindings for nested field paths
- [ ] Add Reimport button on the details page — calls the import endpoint, shows loading/error/success state
- [ ] Display import metadata on the details page (`import.status`, `import.last_imported_at`, `import.last_error`)
- [ ] `app/src/routes/media/list/+page.svelte` — `imageUrl` → `external.imageUrl`, `rating` → `user.rating`
- [ ] `app/src/routes/media/list/_sample-data.ts` — update shape to match new type
