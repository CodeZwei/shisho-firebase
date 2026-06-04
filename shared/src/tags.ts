import type { Media } from './types.js';

export function buildTags(external: Media['external'], userTags: string[]): string[] {
  return [...new Set([
    ...external.tags_copyright,
    ...external.tags_character,
    ...external.tags_artist,
    ...external.tags_general,
    ...external.tags_meta,
    ...userTags,
  ])];
}
