import type { Media } from 'shared';
import * as rule34 from './rule34.js';
import * as generic from './generic.js';

/**
 * Fetches a page and extracts media metadata using a site-specific scraper,
 * falling back to the generic scraper for unrecognized hosts.
 * @param pageUrl - The URL of the page to scrape.
 * @param signal - Optional AbortSignal to cancel the fetch.
 */
export async function scrape(pageUrl: string, signal?: AbortSignal): Promise<Partial<Media>> {
	const response = await fetch(pageUrl, { signal });
	const html = await response.text();

	const { hostname } = new URL(pageUrl);
	if (hostname === 'rule34.xxx') {
		return rule34.scrape(pageUrl, html);
	}
	return generic.scrape(pageUrl, html);
}
