import type { Media } from 'shared';

export async function scrape(pageUrl: string, signal?: AbortSignal): Promise<Partial<Media>> {
	throw new Error('not implemented');
}
