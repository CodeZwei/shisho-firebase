import * as cheerio from 'cheerio';
import type { Scraper, ParserResult } from './_types.js';

const TAG_CLASSES = ['copyright', 'character', 'artist', 'general', 'metadata'];

export const scraper: Scraper = {
	name: 'rule34-html',
	matches: (url) => url.hostname === 'rule34.xxx',
	scrape: async (pageUrl, signal) => {
		const response = await fetch(pageUrl, { signal });
		const html = await response.text();
		return parse(html);
	},
};

// TODO: Remove export function and refactor tests to mock the fetch so they can call with the Scraper interface instead.
export function parse(html: string): ParserResult {
	const $ = cheerio.load(html);

	const title = $('title').text().trim();
	if (title.toLowerCase().includes('captcha')) {
		throw new Error('CAPTCHA detected — page was not returned');
	}

	const tags = TAG_CLASSES.flatMap((cls) =>
		$(`.tag-type-${cls}`)
			.map((_, el) => $(el).find('a').eq(1).text().trim())
			.get()
			.filter(Boolean)
	);

	return {
		external: {
			title: title || undefined,
			imageUrl: $('meta[property="og:image"]').attr('content'),
			tags,
		},
	};
}