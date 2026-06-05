# Scrapers

The scraper system extracts `Media` metadata from a page URL. It lives entirely in `app/src/lib/scrapers/` and runs server-side only.

## Architecture

```
app/src/lib/scrapers/
  index.ts        # dispatcher: matches URL hostname to scraper registry, falls back to generic
  _types.ts       # shared Scraper interface and result types
  rule34.ts       # rule34.xxx — API client, with HTML fallback
  generic.ts      # og:image, og:title, meta tags — fallback for unknown sites
  fixtures/       # captured HTML for parser tests
```

Each scraper module owns its own fetch-and-parse logic, implementing the `Scraper` interface. The dispatcher in `index.ts` does not fetch HTML itself — it matches the URL to the right scraper and delegates entirely.

```ts
// _types.ts
export interface Scraper {
  matches(url: URL): boolean;
  scrape(pageUrl: string, signal?: AbortSignal): Promise<ParserResult>;
}

export type ParserResult = { external: Partial<Media['external']> };
export type ScraperResult = ParserResult & { parser: string };
```

```ts
// index.ts
export async function scrape(pageUrl: string, signal?: AbortSignal): Promise<ScraperResult>
```

## Scraper Types

Two scraper strategies exist:

**HTML scrapers** — fetch the page URL, parse the HTML with cheerio. Used for sites with no structured API. The `generic` scraper is always HTML-based. HTML scrapers are more fragile (markup changes break them) and can trigger bot detection (CAPTCHAs, rate limiting) when deployed to cloud IPs.

**API scrapers** — call a structured API endpoint instead of fetching the page HTML. More reliable, not subject to HTML parsing fragility or bot detection. Required when the page URL alone is not enough to construct the API call (e.g., extracting a post ID from the URL).

A scraper can combine both strategies: prefer the API, fall back to HTML if the API fails or is unavailable.

## rule34.ts

Rule34.xxx has a public DAPI endpoint that returns structured JSON per post. The rule34 scraper uses this API as its primary strategy and falls back to HTML parsing only if the API call fails.

### API Strategy (primary)

Endpoint: `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&id={id}&api_key={key}&user_id={userId}`

The post ID is extracted from the `pageUrl` query string (`?id=...`). An API key is required and must be set via environment variables.

**Environment variables required:**

| Variable | Description |
|---|---|
| `RULE34_API_KEY` | API key obtained from rule34.xxx account settings |
| `RULE34_USER_ID` | Numeric user ID associated with the API key |

Fields extracted from the API response:

| `Media` field | Source |
|---|---|
| `external.imageUrl` | `file_url` |
| `external.title` | constructed as `"Rule 34 - Post #<id>"` |
| `external.tags` | `tags` field, split on whitespace |

Note: The rule34 API returns all tags as a flat space-separated string. Tag categories (artist, character, copyright, general, metadata) are not available from the API and are not preserved. See [DataModel.md](../firebase/DataModel.md) for the rationale.

### HTML Strategy (fallback)

If the API call fails (network error, API key invalid, API down), the scraper falls back to fetching the page HTML and parsing it with cheerio. The fallback extracts the same fields as the API (minus tag categories, which are not worth preserving inconsistently). The `import.parser` field will be `"rule34-html"` when the fallback is used, allowing failed or fallback imports to be identified and re-run.

The HTML fallback will throw if the page returns a CAPTCHA (`<title>` contains `"captcha"`), recording a clean failure rather than writing garbage data.

## generic.ts

Fallback for sites without a dedicated scraper. Fetches the page HTML and extracts whatever Open Graph / standard meta tags are present.

Fields extracted (best-effort):

| `Media` field | Source |
|---|---|
| `external.imageUrl` | `og:image` meta tag |
| `external.title` | `og:title`, then `<title>` |
| `external.tags` | always empty — user fills in manually |

## Adding a New Scraper

**HTML-based scraper:**

1. Create `app/src/lib/scrapers/<site>.ts` implementing `Scraper`.
2. Implement `matches(url)` to return `true` for the target hostname.
3. Implement `scrape(pageUrl, signal)` to fetch the HTML and parse it with cheerio.
4. Register the scraper in the `registry` array in `index.ts` before the `generic` fallback.

**API-based scraper:**

Same as above, but `scrape()` calls the API instead of fetching HTML. Extract any identifiers needed (post ID, slug, etc.) from the `pageUrl` in `matches()` or `scrape()`. Document required environment variables in this file.

No changes are needed to the API route or the bulk import logic when adding a new scraper.

## Dependencies

- [`cheerio`](https://cheerio.js.org/) — server-side HTML parsing. Add to `app/` workspace only.
- No Puppeteer — all supported sites either serve metadata in plain HTML or have a structured API.
