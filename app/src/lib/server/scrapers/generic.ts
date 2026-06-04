import * as cheerio from 'cheerio';
import type { Scraper, ParserResult } from './_types.js';

export function parse(html: string): ParserResult {
	const $ = cheerio.load(html);

	const pageTitle = $('title').text().trim();
	if (pageTitle.toLowerCase().includes('captcha')) {
		throw new Error('CAPTCHA detected — page was not returned');
	}

	const meta = (attr: string, name: string) =>
		$(`meta[${attr}="${name}"]`).attr('content')?.trim() || undefined;

	const imageUrl =
		meta('name', 'twitter:image') ??
		meta('property', 'og:image') ??
		undefined;

	const rawTitle =
		meta('property', 'og:title') ??
		meta('name', 'twitter:title') ??
		($('title').text().trim() || undefined);

	const title = rawTitle?.replace(/\s*[|\-–—]\s*[^|\-–—]+$/, '').trim() || undefined;

	return { external: { imageUrl, title } };
}

export const scraper: Scraper = {
	name: 'generic',
	matches: (_url) => true,
	scrape: async (pageUrl, signal) => {
		const response = await fetch(pageUrl, { signal });
		const html = await response.text();
		return parse(html);
	},
};
