import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { parse } from './generic.js';

/*
Fixture captured from: https://imgur.com as a generic example
To refresh, run from the repo root:

  curl -A "Mozilla/5.0" -o app/src/lib/server/scrapers/fixtures/generic.html \
    "https://imgur.com/a/QR0nJVu"
*/

const html = readFileSync(
	fileURLToPath(new URL('./fixtures/generic.html', import.meta.url)),
	'utf-8'
);

describe('generic parser', () => {
	it('extracts limited metadata from a known post', () => {
		const result = parse(html);


		expect.soft(result.external.title).toBe('imgur.com');
		expect.soft(result.external.imageUrl).toBe('https://i.imgur.com/sKCRpVph.jpg');
	});


	it('fails if the provided html is a CAPTCHA challenge', () => {
		const html = "<title>Example.com CAPTCHA</title>"

		expect(() => parse(html)).toThrow("CAPTCHA detected — page was not returned");
	});
});
