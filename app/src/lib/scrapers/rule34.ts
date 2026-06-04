import * as cheerio from 'cheerio';
import type { Parser } from './index.js';

function extractTags($: cheerio.CheerioAPI, typeClass: string): string[] {
	return $(`.tag-type-${typeClass}`)
		.map((_, el) => $(el).find('a').eq(1).text().trim())
		.get()
		.filter(Boolean);
}

export const parse: Parser = (html) => {
	const $ = cheerio.load(html);

	return {
		external: {
			title: $('title').text().trim() || undefined,
			imageUrl: $('meta[property="og:image"]').attr('content'),
			tags_copyright: extractTags($, 'copyright'),
			tags_character: extractTags($, 'character'),
			tags_artist: extractTags($, 'artist'),
			tags_general: extractTags($, 'general'),
			tags_meta: extractTags($, 'metadata'),
		},
	};
};
