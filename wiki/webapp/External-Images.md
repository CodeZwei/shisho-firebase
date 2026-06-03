# Displaying Images from External Domains

## Problem

The media list and detail screens display a thumbnail using `media.imageUrl`, which is a URL pointing to an image on a third-party domain. Browsers can load `<img>` tags from any domain by default — CORS does not apply to image loads — but there is no guarantee the remote site will serve the image when the `Referer` header identifies a foreign origin.

## Current Approach: Direct Hotlinking

The list page renders the image directly:

```svelte
<img src={media.imageUrl} alt={displayTitle(media)} />
```

No CSP is configured in `app.html` or `hooks.server.ts`, so there are no browser-side restrictions. This works as long as the remote site does not block hotlinking.

**Status:** Working in practice for hentai-foundry.com and rule34.xxx as of 2026-06.

## Alternative: Server-Side Image Proxy

Add a SvelteKit endpoint (e.g. `/api/image?url=...`) that fetches the image and pipes it back to the browser. This strips the `Referer` header, bypassing hotlink protection.

**Drawbacks:**

- Adds latency on every thumbnail load.
- All image traffic passes through Vercel — counts against bandwidth limits.
- Requires sanitizing and validating the `url` parameter to prevent the endpoint from being used as an open proxy.

## Recommendation

Keep direct hotlinking until it breaks on a specific site. Add an `onerror` handler on the `<img>` to fall back to the placeholder if a load fails, so broken images degrade gracefully rather than showing a broken-image icon.
