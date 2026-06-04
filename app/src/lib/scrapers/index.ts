import type { Media } from 'shared';
import * as rule34 from './rule34.js';
import * as generic from './generic.js';

export type ScraperResult = { external: Partial<Media['external']> };
export type Parser = (html: string) => ScraperResult;

export async function scrape(pageUrl: string, signal?: AbortSignal): Promise<ScraperResult> {
	const response = await fetch(pageUrl, { signal });
	const html = await response.text();

	const { hostname } = new URL(pageUrl);
	if (hostname === 'rule34.xxx') {
		return rule34.parse(html);
	}
	return generic.parse(html);
}
