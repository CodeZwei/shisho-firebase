import type { ScraperResult } from './_types.js';
import { scraper as rule34Html } from './rule34-html.js';
import { scraper as generic } from './generic.js';

export type { ParserResult, ScraperResult } from './_types.js';

const registry = [rule34Html];

export async function scrape(pageUrl: string, signal?: AbortSignal): Promise<ScraperResult> {
	const url = new URL(pageUrl);
	const matched = registry.find((s) => s.matches(url)) ?? generic;
	const result = await matched.scrape(pageUrl, signal);
	return { ...result, parser: matched.name };
}
