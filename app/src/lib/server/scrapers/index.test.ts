import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrape } from './index.js';
import { scraper as rule34Scraper } from './rule34.js';
import { scraper as genericScraper } from './generic.js';

vi.mock('./rule34.js', () => ({
	scraper: {
		name: 'rule34',
		matches: (url: URL) => url.hostname === 'rule34.xxx',
		scrape: vi.fn(),
	},
}));

vi.mock('./generic.js', () => ({
	scraper: {
		name: 'generic',
		matches: (_url: URL) => true,
		scrape: vi.fn(),
	},
}));

const RULE34_URL = 'https://rule34.xxx/index.php?page=post&id=123';
const GENERIC_URL = 'https://example.com/some-page';

// TODO: Refactor this test to be more generic to pass in a mock list of scrapers and verify the matching works.
describe('scrape dispatcher', () => {
	beforeEach(() => {
		vi.mocked(rule34Scraper.scrape).mockResolvedValue({ external: { title: 'rule34 post' } });
		vi.mocked(genericScraper.scrape).mockResolvedValue({ external: { imageUrl: 'https://example.com/img.jpg' } });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('routes rule34.xxx to the rule34 scraper', async () => {
		const result = await scrape(RULE34_URL);

		expect(vi.mocked(rule34Scraper.scrape)).toHaveBeenCalledWith(RULE34_URL, undefined);
		expect(vi.mocked(genericScraper.scrape)).not.toHaveBeenCalled();
		expect(result).toEqual({ external: { title: 'rule34 post' }, parser: 'rule34' });
	});

	it('routes unknown hostnames to the generic scraper', async () => {
		const result = await scrape(GENERIC_URL);

		expect(vi.mocked(genericScraper.scrape)).toHaveBeenCalledWith(GENERIC_URL, undefined);
		expect(vi.mocked(rule34Scraper.scrape)).not.toHaveBeenCalled();
		expect(result).toEqual({ external: { imageUrl: 'https://example.com/img.jpg' }, parser: 'generic' });
	});

	it('forwards the AbortSignal to the matched scraper', async () => {
		const controller = new AbortController();

		await scrape(GENERIC_URL, controller.signal);

		expect(vi.mocked(genericScraper.scrape)).toHaveBeenCalledWith(GENERIC_URL, controller.signal);
	});

	it('propagates errors from the matched scraper', async () => {
		vi.mocked(genericScraper.scrape).mockRejectedValue(new TypeError('Failed to fetch'));

		await expect(scrape(GENERIC_URL)).rejects.toThrow('Failed to fetch');
	});
});
