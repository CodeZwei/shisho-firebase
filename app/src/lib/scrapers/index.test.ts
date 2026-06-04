import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrape } from './index.js';
import * as rule34 from './rule34.js';
import * as generic from './generic.js';

vi.mock('./rule34.js', () => ({ parse: vi.fn() }));
vi.mock('./generic.js', () => ({ parse: vi.fn() }));

const RULE34_URL = 'https://rule34.xxx/index.php?page=post&id=123';
const GENERIC_URL = 'https://example.com/some-page';
const MOCK_HTML = '<html><body>page content</body></html>';

function stubFetch(html: string = MOCK_HTML) {
	const mock = vi.fn().mockResolvedValue({
		ok: true,
		text: () => Promise.resolve(html)
	});
	vi.stubGlobal('fetch', mock);
	return mock;
}

let controller: AbortController;

describe('scrape dispatcher', () => {
	beforeEach(() => {
		controller = new AbortController();
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	// Routing
	it('routes rule34.xxx to the rule34 parser', async () => {
		stubFetch(MOCK_HTML);
		vi.mocked(rule34.parse).mockReturnValue({ external: { title: 'test post' } });

		const result = await scrape(RULE34_URL);

		expect(vi.mocked(rule34.parse)).toHaveBeenCalledWith(MOCK_HTML);
		expect(vi.mocked(generic.parse)).not.toHaveBeenCalled();
		expect(result).toEqual({ external: { title: 'test post' } });
	});

	it('routes unknown hostnames to the generic parser', async () => {
		stubFetch(MOCK_HTML);
		vi.mocked(generic.parse).mockReturnValue({ external: { imageUrl: 'https://example.com/img.jpg' } });

		const result = await scrape(GENERIC_URL);

		expect(vi.mocked(generic.parse)).toHaveBeenCalledWith(MOCK_HTML);
		expect(vi.mocked(rule34.parse)).not.toHaveBeenCalled();
		expect(result).toEqual({ external: { imageUrl: 'https://example.com/img.jpg' } });
	});

	// Fetch behavior
	it('fetches HTML exactly once per scrape call', async () => {
		const fetchMock = stubFetch();
		vi.mocked(generic.parse).mockReturnValue({ external: {} });

		await scrape(GENERIC_URL);

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('rejects when fetch fails with a network error', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

		await expect(scrape(GENERIC_URL)).rejects.toThrow('Failed to fetch');
	});

	// Abort behavior
	it('forwards the caller AbortSignal to fetch', async () => {
		const fetchMock = stubFetch();
		vi.mocked(generic.parse).mockReturnValue({ external: {} });

		await scrape(GENERIC_URL, controller.signal);

		const [, init] = fetchMock.mock.calls[0];
		expect((init as RequestInit)?.signal).toBe(controller.signal);
	});

	it('rejects when fetch is aborted', async () => {
		const abortError = Object.assign(new Error('The operation was aborted'), {
			name: 'AbortError'
		});
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

		await expect(scrape(GENERIC_URL, controller.signal)).rejects.toMatchObject({
			name: 'AbortError'
		});
	});
});
