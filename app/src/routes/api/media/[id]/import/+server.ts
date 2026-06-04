import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/firebase/server';
import { mediaConverter } from '../../../../media/_types';
import { scrape } from '$lib/scrapers/index.js';
import { buildTags, type Media } from 'shared';

export const POST: RequestHandler = async ({ locals, params }) => {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  const rawRef = db.doc(`media-metadata/${params.id}`);
  const snap = await rawRef.withConverter(mediaConverter).get();
  if (!snap.exists) throw error(404, 'Not found');

  const media = snap.data()!;

  try {
    const { external, parser } = await scrape(media.pageUrl);

    const resolvedExternal: Media['external'] = {
      imageUrl: external.imageUrl ?? '',
      title: external.title ?? '',
      tags_copyright: external.tags_copyright ?? [],
      tags_character: external.tags_character ?? [],
      tags_artist: external.tags_artist ?? [],
      tags_general: external.tags_general ?? [],
      tags_meta: external.tags_meta ?? [],
    };

    await rawRef.update({
      'external.imageUrl': resolvedExternal.imageUrl,
      'external.title': resolvedExternal.title,
      'external.tags_copyright': resolvedExternal.tags_copyright,
      'external.tags_character': resolvedExternal.tags_character,
      'external.tags_artist': resolvedExternal.tags_artist,
      'external.tags_general': resolvedExternal.tags_general,
      'external.tags_meta': resolvedExternal.tags_meta,
      tags_all: buildTags(resolvedExternal, media.user.tags),
      'import.status': 'success',
      'import.last_imported_at': Date.now(),
      'import.parser': parser,
      'import.last_error': null,
    });

    return json({ success: true });
  } catch (e) {
    await rawRef.update({
      'import.status': 'failed',
      'import.last_imported_at': Date.now(),
      'import.last_error': e instanceof Error ? e.message : String(e),
    });
    return json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
};
