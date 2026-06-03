import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { parse } from './generic.js';

/*
Fixture captured from: https://imgur.com as a generic example
To refresh, run from the repo root:

  curl -A "Mozilla/5.0" -o app/src/lib/scrapers/fixtures/generic.html \
    "https://imgur.com/a/QR0nJVu"
*/

const html = readFileSync(
	fileURLToPath(new URL('./fixtures/generic.html', import.meta.url)),
	'utf-8'
);

describe('generic parser', () => {
	it('extracts limited metadata from a known post', () => {
		const result = parse(html);

		
		expect.soft(result.title).toBe('imgur.com');
		expect.soft(result.imageUrl).toBe('https://i.imgur.com/sKCRpVph.jpg');
	});
});
