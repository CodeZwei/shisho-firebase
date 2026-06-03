import type { Media } from 'shared';

export async function scrape(pageUrl: string, html: string): Promise<Partial<Media>> {
	throw new Error('not implemented');
}
