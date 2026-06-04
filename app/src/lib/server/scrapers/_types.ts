import type { Media } from 'shared';

export type ParserResult = { external: Partial<Media['external']> };
export type ScraperResult = ParserResult & { parser: string };

export interface Scraper {
	readonly name: string;
	matches(url: URL): boolean;
	scrape(pageUrl: string, signal?: AbortSignal): Promise<ParserResult>;
}
