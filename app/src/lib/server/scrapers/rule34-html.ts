import * as cheerio from 'cheerio';
import type { Scraper, ParserResult } from './_types.js';

const TAG_CLASSES = ['copyright', 'character', 'artist', 'general', 'metadata'];

export const scraper: Scraper = {
	name: 'rule34-html',
	matches: (url) => url.hostname === 'rule34.xxx',
	scrape: async (pageUrl, signal) => {
		const response = await fetch(pageUrl, { signal });
		const html = await response.text();
		const result = parse(html);
		result.external.id = extractPostId(pageUrl)
		return result;
	},
};

function extractPostId(pageUrl: string): string {
	const id = new URL(pageUrl).searchParams.get('id');
	if (!id) throw new Error(`Could not extract post ID from URL: ${pageUrl}`);
	return id;
}

function parse(html: string): ParserResult {
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
