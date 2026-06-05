import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/firebase/server';
import { mediaConverter } from '../../../../media/_types';
import { scrape } from '$lib/server/scrapers/index.js';
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
      id: external.id ?? '',
      imageUrl: external.imageUrl ?? '',
      thumbnailUrl: external.thumbnailUrl ?? '',
      title: external.title ?? '',
      tags: external.tags ?? [],
    };

    await rawRef.update({
      'external.title': resolvedExternal.title,
      'external.imageUrl': resolvedExternal.imageUrl,
      'external.thumbnailUrl': resolvedExternal.thumbnailUrl,
      'external.tags': resolvedExternal.tags,
      tags_all: buildTags(resolvedExternal, media.user.tags),
      'import.status': 'success',
      'import.last_imported_at': Date.now(),
      'import.parser': parser,
      'import.last_error': null,
    });

    return json({ success: true });
  } catch (e) {
    console.error('[api/media/[id]/import] scrape failed:', e);

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
