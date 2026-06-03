import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { scrape } from './rule34.js';

// Fixture captured from: https://rule34.xxx
// To refresh, run from the repo root:
//
//   curl -A "Mozilla/5.0" -o app/src/lib/scrapers/fixtures/rule34.html \
//     "https://rule34.xxx/index.php?page=post&s=view&id=1915346"

const html = readFileSync(
	fileURLToPath(new URL('./fixtures/rule34.html', import.meta.url)),
	'utf-8'
);
const PAGE_URL = 'https://rule34.xxx/index.php?page=post&id=<ID>';

describe('rule34 scraper', () => {
	it('extracts all metadata from a known post', async () => {
		const result = await scrape(PAGE_URL, html);

		expect.soft(result.title).toBe(/* placeholder */"");
		expect.soft(result.imageUrl).toBe(/* placeholder */"");
		expect.soft(result.tags_copyright).toEqual(/* placeholder */[]);
		expect.soft(result.tags_character).toEqual(/* placeholder */[]);
		expect.soft(result.tags_artist).toEqual(/* placeholder */[]);
		expect.soft(result.tags_general).toEqual(/* placeholder */[]);
		expect.soft(result.tags_meta).toEqual(/* placeholder */[]);
	});
});
