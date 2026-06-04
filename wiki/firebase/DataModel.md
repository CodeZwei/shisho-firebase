# Data Model

## Media Entry

The core document type, stored in Firestore collection `media-metadata`.

```typescript
type Media = {
  id: string;
  pageUrl: string;
  created_at: number;
  file_key: string | null;
  pending_delete: boolean;
  tags_all: string[];

  external: {
    imageUrl: string;
    title: string;
    tags_copyright: string[];
    tags_character: string[];
    tags_artist: string[];
    tags_general: string[];
    tags_meta: string[];
  };

  user: {
    title: string | null;
    notes: string;
    rating: number;
    tags: string[];
  };

  import: {
    last_imported_at: number | null;
    status: "unimported" | "success" | "failed";
    parser: string | null;
    last_error: string | null;
  };
};
```

## Field Ownership

Fields are divided into three namespaces to make ownership unambiguous:

- **`external.*`** — written by the scraper on import/reimport. Never written by user action.
- **`user.*`** — written by user action only. Never overwritten by import.
- **`import.*`** — written by the import system to record the outcome of the last import run.

Reimport overwrites all `external.*` fields and updates `import.*`. It never touches `user.*`.

## Field Notes

**`tags_all`**: Write-time denormalization — the de-duplicated union of all `external.tags_*` arrays and `user.tags`. Never written directly; always recomputed and written atomically alongside any tag update. Enables cross-category queries via Firestore `array-contains` without querying multiple fields separately.

**`external.title` vs `user.title`**: `external.title` is whatever the scraper returns and will be overwritten on reimport. `user.title` is an optional user correction — set it when the scraped title is wrong or missing. The UI should display `user.title` when set, falling back to `external.title`.

**`user.rating`**: Integer 0–5. 0 means unrated. User-owned — reimport never touches it.

**`user.tags`**: Free-form user-defined labels. Not constrained to booru taxonomy. Included in `tags_all`.

**Tag categories** (`external.tags_*`): Lowercase strings, underscores for spaces, matching booru-style taxonomy.
- `tags_copyright`: Franchise or IP (e.g., `halo`, `overwatch`)
- `tags_character`: Named characters depicted (e.g., `master_chief`, `cortana`)
- `tags_artist`: Artist handle(s) who produced the image
- `tags_general`: Content descriptors for what's in the image
- `tags_meta`: Descriptors about the image file/post itself (e.g., `ai_generated`, `large_filesize`)

**`import.status`**:
- `"unimported"` — no import has ever been attempted
- `"success"` — last import completed without error
- `"failed"` — last import threw an error; see `import.last_error`

**`import.parser`**: The parser key used on the last import run (e.g., `"rule34"`, `"generic"`). Stored explicitly so reimport jobs can be filtered by parser (e.g., reimport all `rule34` documents after updating that parser).

**`import.last_error`**: Human-readable error message from the last failed import. `null` on success.

**`file_key`**: If `null`, the entry is link-only — no file is stored. If set, it is the Firebase Storage object path (e.g., `media/abc123.jpg`). The webapp and CLI derive the download URL from this key at access time.

**`pending_delete`**: Soft delete. A background job (or manual CLI sweep) is needed to remove entries where this is `true` and clean up associated Storage files.

## Firestore Update Rules

Nested map updates require dot-notation to avoid replacing the entire map. Always use:

```typescript
doc.update({ "external.imageUrl": "...", "external.tags_general": [...] })
// NOT:
doc.update({ external: { imageUrl: "..." } }) // replaces the whole external map
```

All tag writes must go through a central server-side function that recomputes `tags_all` atomically in the same update call.

## Firestore Rules

Rules must enforce:
1. All reads/writes require an authenticated user with the `authorized` custom claim.
2. No unauthenticated access to any collection.

The current rules are not complete — see [Firebase.md](Firebase.md).

## Indexes

Queries that will need composite indexes:
- `tags_all array-contains X` + `created_at desc` (list by tag, newest first)
- `tags_all array-contains X` + `user.rating desc` (list by tag, highest rated)
- `external.tags_character array-contains X` + `created_at desc` (filter by character)
- `external.tags_copyright array-contains X` + `user.rating desc` (filter by franchise, best first)
- `user.rating > 0` + `user.rating desc` (list rated entries)
- `import.status == "unimported"` + `created_at asc` (queue of pending imports)
- `import.status == "failed"` + `created_at asc` (failed imports for retry)

Define these in `firestore.indexes.json` before deploying queries that use them.
