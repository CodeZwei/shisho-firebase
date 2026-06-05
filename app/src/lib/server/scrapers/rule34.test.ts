import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { scraper } from './rule34.js';

/*
Fixture captured from the rule34 DAPI endpoint.
To refresh, run from the repo root:

  curl -o app/src/lib/server/scrapers/fixtures/rule34-api.json \
    "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&id=1915346&api_key=YOUR_KEY&user_id=YOUR_ID"

Locate API_KEY and USER_ID from https://rule34.xxx/index.php?page=account&s=options.
*/

vi.mock('$env/private', () => ({
	RULE34_API_KEY: 'test-key',
	RULE34_USER_ID: '99999',
}));

const FIXTURE_POST_ID = '1915346';
const FIXTURE_URL = `https://rule34.xxx/index.php?page=post&s=view&id=${FIXTURE_POST_ID}`;

type ApiPost = { id: number; file_url: string; tags: string; image: string };

const fixture = JSON.parse(
	readFileSync(fileURLToPath(new URL('./fixtures/rule34-api.json', import.meta.url)), 'utf-8')
) as Array<ApiPost>;
const post = fixture[0];

function stubFetch(status: number, body: unknown) {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: status >= 200 && status < 300,
			status,
			statusText: status === 200 ? 'OK' : status === 401 ? 'Unauthorized' : 'Error',
			json: () => Promise.resolve(body),
		})
	);
}

describe('rule34 API scraper', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('has the correct name', () => {
		expect(scraper.name).toBe('rule34');
	});

	it('matches rule34.xxx URLs', () => {
		expect(scraper.matches(new URL('https://rule34.xxx/index.php?page=post&s=view&id=1'))).toBe(true);
	});

	it('does not match other URLs', () => {
		expect(scraper.matches(new URL('https://example.com/page'))).toBe(false);
	});

	it('extracts metadata from a successful API response', async () => {
		stubFetch(200, fixture);

		const result = await scraper.scrape(FIXTURE_URL);

		expect.soft(result.external.id).toBe(FIXTURE_POST_ID);
		expect.soft(result.external.imageUrl).toBe(post.file_url);
		expect.soft(result.external.title).toBe(`Rule 34 - Post #${post.id}`);
		expect.soft(result.external.tags).toEqual(post.tags.split(' ').filter(Boolean));
	});

	it('rejects with a network error when fetch fails', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

		await expect(scraper.scrape(FIXTURE_URL)).rejects.toThrow('Failed to fetch');
	});

	it('rejects when the API returns 401', async () => {
		stubFetch(401, null);

		await expect(scraper.scrape(FIXTURE_URL)).rejects.toThrow('authentication failed');
	});

	it('rejects when the fetch is aborted', async () => {
		const abortError = Object.assign(new Error('The operation was aborted'), {
			name: 'AbortError',
		});
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

		const controller = new AbortController();
		await expect(scraper.scrape(FIXTURE_URL, controller.signal)).rejects.toMatchObject({
			name: 'AbortError',
		});
	});
});
