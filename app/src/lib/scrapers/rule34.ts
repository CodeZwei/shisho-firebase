import * as cheerio from 'cheerio';
import type { Parser } from './index.js';

const TAG_CLASSES = ['copyright', 'character', 'artist', 'general', 'metadata'];

export const parse: Parser = (html) => {
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
};
