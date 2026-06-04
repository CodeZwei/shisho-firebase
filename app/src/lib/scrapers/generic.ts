import * as cheerio from 'cheerio';
import type { Parser } from './index.js';

/** 
 * Fallback parser for a generic page hosting an image.
 * Currently does not perform very well, even on known websites.
 */
export const parse: Parser = (html) => {
	const $ = cheerio.load(html);
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
};
