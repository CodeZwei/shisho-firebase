import { describe, expect, it, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { scraper } from './generic.js';

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

const TEST_URL = 'https://imgur.com/a/QR0nJVu';

function stubFetch(body: string) {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(body),
		})
	);
}

describe('generic scraper', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('has the correct name', () => {
		expect(scraper.name).toBe('generic');
	});

	it('extracts limited metadata from a known post', async () => {
		stubFetch(html);

		const result = await scraper.scrape(TEST_URL);

		expect.soft(result.external.title).toBe('imgur.com');
		expect.soft(result.external.imageUrl).toBe('https://i.imgur.com/sKCRpVph.jpg');
	});

	it('fails if the provided html is a CAPTCHA challenge', async () => {
		stubFetch('<title>Example.com CAPTCHA</title>');

		await expect(scraper.scrape(TEST_URL)).rejects.toThrow('CAPTCHA detected — page was not returned');
	});

	it('rejects with a network error when fetch fails', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

		await expect(scraper.scrape(TEST_URL)).rejects.toThrow('Failed to fetch');
	});

	it('rejects when the fetch is aborted', async () => {
		const abortError = Object.assign(new Error('The operation was aborted'), {
			name: 'AbortError',
		});
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

		const controller = new AbortController();
		await expect(scraper.scrape(TEST_URL, controller.signal)).rejects.toMatchObject({
			name: 'AbortError',
		});
	});
});
