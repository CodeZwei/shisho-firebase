# Data Model

## Media Entry

The core document type, stored in Firestore collection `media-metadata`.

```typescript
type Media = {
  id: string;              // Firestore document ID (auto-generated)
  pageUrl: string;         // URL of the page where the image was found
  imageUrl: string;        // Direct URL to the image file (may differ from pageUrl)
  title: string;           // Human-readable title or caption
  notes: string;           // Freeform notes
  tags_copyright: string[]; // IP/franchise the image is from
  tags_character: string[]; // characters depicted
  tags_artist: string[];   // artists who produced the image
  tags_general: string[];  // content tags describing the image
  tags_meta: string[];     // descriptors about the image itself
  tags: string[];          // union of all tag arrays — for cross-category search
  rating: number;          // 0–5 integer rating; 0 = unrated
  created_at: number;      // Unix milliseconds (Firestore Timestamp on write)
  file_key: string | null; // Firebase Storage path if file is archived; null if link-only
  pending_delete: boolean; // Soft-delete flag; requires a cleanup job to permanently remove
};
```

## Field Notes

**`pageUrl` vs `imageUrl`**: `pageUrl` is the page the image appeared on (useful for context and attribution). `imageUrl` is the direct link to the image asset. They may be the same if the image was accessed directly.

**Tag categories**: All tag fields are lowercase strings by convention, using underscores for spaces (matching booru-style taxonomy). A tag may only appear in one category per entry.
- `tags_copyright`: The franchise or IP (e.g., `halo`, `overwatch`)
- `tags_character`: Named characters depicted (e.g., `master_chief`, `cortana`)
- `tags_artist`: Artist handle(s) who produced the image
- `tags_general`: Content descriptors for what's in the image
- `tags_meta`: Descriptors about the image file/post itself (e.g., `ai_generated`, `multiple_images`, `large_filesize`)

**`tags`**: Write-time denormalization — always the union of all five category arrays. Never written directly; always derived. Enables cross-category queries via Firestore `array-contains` without querying five fields separately. Must be kept in sync by a helper on every write.

**`rating`**: Integer 0–5. 0 means unrated. Allows sorting entries by quality.

**`file_key`**: If `null`, the entry is link-only — no file is stored. If set, it is the Firebase Storage object path (e.g., `media/abc123.jpg`). The webapp and CLI derive the download URL from this key at access time.

**`pending_delete`**: Soft delete. A background job (or manual CLI sweep) is needed to remove entries where this is `true` and clean up associated Storage files. Without a cleanup job, soft-deleted entries accumulate.

## Firestore Rules

Rules must enforce:
1. All reads/writes require an authenticated user with the `authorized` custom claim.
2. No unauthenticated access to any collection.

The current rules are not complete — see [Firebase.md](Firebase.md).

## Indexes

Queries that will need composite indexes:
- `tags array-contains X` + `created_at desc` (list by tag, newest first)
- `tags array-contains X` + `rating desc` (list by tag, highest rated)
- `tags_character array-contains X` + `created_at desc` (filter by character)
- `tags_copyright array-contains X` + `rating desc` (filter by franchise, best first)
- `rating > 0` + `rating desc` (list rated entries)

The category-specific fields only need indexes if you want to filter by a specific category. For general tag search, `tags` covers all categories.

Define these in `firestore.indexes.json` before deploying queries that use them.
