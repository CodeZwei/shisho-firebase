import type { Media } from './types.js';

type TagFields = Pick<Media, 'tags_copyright' | 'tags_character' | 'tags_artist' | 'tags_general' | 'tags_meta'>;

export function buildTags(media: TagFields): string[] {
  return [
    ...media.tags_copyright,
    ...media.tags_character,
    ...media.tags_artist,
    ...media.tags_general,
    ...media.tags_meta,
  ];
}
