# Scrapers

The scraper system extracts `Media` metadata from a page URL. It lives entirely in `app/src/lib/scrapers/` and runs server-side only.

## Architecture

```
app/src/lib/scrapers/
  index.ts        # dispatcher: matches URL hostname to scraper, falls back to generic
  rule34.ts       # booru-specific parser
  generic.ts      # og:image, og:title, meta tags — fallback for unknown sites
```

The dispatcher in `index.ts` takes a `pageUrl`, matches the hostname, invokes the right scraper, and returns a `Partial<Media>`. The caller (the API route) is responsible for filling in any remaining fields (`id`, `created_at`, etc.) and writing to Firestore.

```ts
// index.ts
export async function scrape(pageUrl: string): Promise<Partial<Media>>
```

Each scraper module exports a single function with the same signature:

```ts
export async function scrape(pageUrl: string, html: string): Promise<Partial<Media>>
```

The dispatcher fetches the HTML once and passes it down — scrapers do not make their own HTTP requests.

## Bulk Import

The bulk import endpoint (`POST /api/media/import`) accepts an array of `pageUrl` strings. It processes them with controlled concurrency (10 at a time) using `Promise.allSettled`. Each batch fires in parallel; batches run sequentially.

- Per-request HTTP timeout: 8s (via `AbortController`)
- Concurrency per batch: 10
- Returns partial results — failed URLs are reported without aborting the rest
- Route config: `export const config = { maxDuration: 60 }` to handle slow batches

Safe upper bound tested: ~40 URLs. Above ~100, a queue would be needed.

## rule34.ts

Rule34.xxx is a booru — all metadata is server-rendered in plain HTML. No JS execution required; `cheerio` is sufficient.

Fields extracted:

| `Media` field | Source |
|---|---|
| `pageUrl` | passed in |
| `imageUrl` | `<img id="image">` `src` attribute |
| `title` | `<title>` tag, stripped of site suffix |
| `tags_artist` | sidebar tag list, `class="tag-type-artist"` |
| `tags_character` | sidebar, `class="tag-type-character"` |
| `tags_copyright` | sidebar, `class="tag-type-copyright"` |
| `tags_general` | sidebar, `class="tag-type-general"` |
| `tags_meta` | sidebar, `class="tag-type-meta"` |
| `tags` | union of all tag arrays (via shared `buildTags` helper) |
| `rating` | `Rating:` stats row in the sidebar |

## generic.ts

Fallback for sites without a dedicated scraper. Extracts whatever Open Graph / standard meta tags are present.

Fields extracted (best-effort):

| `Media` field | Source |
|---|---|
| `pageUrl` | passed in |
| `imageUrl` | `og:image` meta tag |
| `title` | `og:title`, then `<title>` |

All tag fields are left empty. The user fills them in manually after import.

## Adding a New Scraper

1. Create `app/src/lib/scrapers/<site>.ts` exporting `scrape(pageUrl, html): Promise<Partial<Media>>`.
2. Add the hostname match in `index.ts` before the `generic` fallback.
3. No changes needed to the API route or the bulk import logic.

## Dependencies

- [`cheerio`](https://cheerio.js.org/) — server-side HTML parsing. Add to `app/` workspace only.
- No Puppeteer — all supported sites serve metadata in plain HTML.
