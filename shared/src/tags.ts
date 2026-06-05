import type { Media } from './types.js';

export function buildTags(external: Media['external'], userTags: string[]): string[] {
  return [...new Set([...external.tags, ...userTags])];
}
