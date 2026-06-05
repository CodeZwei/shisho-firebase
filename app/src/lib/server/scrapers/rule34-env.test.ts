/*
This test lives in its own file so that vi.mock() can override $env/static/private
with empty values for the whole module scope. Doing this in-line inside rule34.test.ts
would require vi.resetModules() + vi.doMock() cleanup, which is fragile — if the test
throws before cleanup, the mock bleeds into subsequent tests. A dedicated file gets
Vitest's per-file module isolation for free.
*/

import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/static/private', () => ({ RULE34_API_KEY: '', RULE34_USER_ID: '' }));

const FIXTURE_URL = 'https://rule34.xxx/index.php?page=post&s=view&id=1915346';

describe('rule34 API scraper — missing env vars', () => {
	it('rejects when env vars are not configured', async () => {
		const { scraper } = await import('./rule34.js');
		await expect(scraper.scrape(FIXTURE_URL)).rejects.toThrow(
			'RULE34_API_KEY and RULE34_USER_ID environment variables must be set'
		);
	});
});
