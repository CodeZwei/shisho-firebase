import { describe, expect, it, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { scraper } from './rule34-html.js';

/*
Fixture captured from: https://rule34.xxx
To refresh, run from the repo root:

  curl -A "Mozilla/5.0" -o app/src/lib/server/scrapers/fixtures/rule34.html \
    "https://rule34.xxx/index.php?page=post&s=view&id=1915346"
*/

const html = readFileSync(
	fileURLToPath(new URL('./fixtures/rule34.html', import.meta.url)),
	'utf-8'
);

const FIXTURE_POST_ID = '1915346';
const FIXTURE_URL = `https://rule34.xxx/index.php?page=post&s=view&id=${FIXTURE_POST_ID}`;

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

describe('rule34-html scraper', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('has the correct name', () => {
		expect(scraper.name).toBe('rule34-html');
	});

	it('matches rule34.xxx URLs', () => {
		expect(scraper.matches(new URL('https://rule34.xxx/index.php?page=post&s=view&id=1'))).toBe(true);
	});

	it('does not match other URLs', () => {
		expect(scraper.matches(new URL('https://example.com/page'))).toBe(false);
	});

	it('extracts all metadata from a known post', async () => {
		stubFetch(html);

		const result = await scraper.scrape(FIXTURE_URL);

		expect.soft(result.external.id).toBe(FIXTURE_POST_ID);
		expect.soft(result.external.title).toBe("Rule 34 - 2girls areola areolae arms behind back arms tied behind back bangs bayonetta bayonetta (character) beauty mark before sex big breasts black hair blonde hair blush blushing bondage bound bound arms breasts cherry-gig closed eyes completely nude completely nude female crossover dominant dominant female drool drooling earrings erect nipples eyeliner eyeshadow eyewear female female only femdom femsub gag gagged glasses gloves hair bondage hair gag hair grab hair pull human human only large areolae large breasts lesbian lezdom lezsub long hair metroid multiple females multiple girls nintendo nipples nude nude female painted nails perky breasts ponytail prehensile hair restrained saliva saliva trail samus aran submissive submissive female sweat thick lips tied hair tied up very long hair witch yuri | 1915346");
		expect.soft(result.external.imageUrl).toBe("https://wimg.rule34.xxx//images/1769/f8769b4d0ec93ee5c38207b1693afccc.jpeg?1915346");
		expect.soft(result.external.tags).toEqual([
			// copyright
			"bayonetta", "metroid", "nintendo",
			// character
			"bayonetta (character)", "samus aran",
			// artist
			"cherry-gig",
			// general
			"2girls","areola","areolae","arms behind back","arms tied behind back","bangs","beauty mark","before sex","big breasts","black hair","blonde hair","blush","blushing","bondage","bound","bound arms","breasts","closed eyes","completely nude","completely nude female","dominant","dominant female","drool","drooling","earrings","erect nipples","eyeliner","eyeshadow","eyewear","female","female only","femdom","femsub","gag","gagged","glasses","gloves","hair bondage","hair gag","hair grab","hair pull","human","human only","large areolae","large breasts","lesbian","lezdom","lezsub","long hair","multiple females","multiple girls","nipples","nude","nude female","painted nails","perky breasts","ponytail","prehensile hair","restrained","saliva","saliva trail","submissive","submissive female","sweat","thick lips","tied hair","tied up","very long hair","witch","yuri",
			// meta
			"crossover",
		]);
	});

	it('fails if the provided html is a CAPTCHA challenge', async () => {
		stubFetch('<title>Rule34 CAPTCHA</title>');

		await expect(scraper.scrape(FIXTURE_URL)).rejects.toThrow('CAPTCHA detected — page was not returned');
	});

	it('rejects with a network error when fetch fails', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

		await expect(scraper.scrape(FIXTURE_URL)).rejects.toThrow('Failed to fetch');
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
