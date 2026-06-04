import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/firebase/server';
import { mediaConverter } from '../../media/_types';
import type { Media } from 'shared';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  const snapshot = await db
    .collection('media-metadata')
    .limit(50)
    .withConverter(mediaConverter)
    .get();

  const mediaList: Media[] = [];
  snapshot.forEach((doc) => mediaList.push(doc.data()));

  return json(mediaList);
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  const body = (await request.json()) as { items: Array<{ pageUrl: string; notes?: string }> };

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw error(400, 'items must be a non-empty array');
  }

  const chunkSize = 400;
  const col = db.collection('media-metadata');
  const batches = [];

  for (let i = 0; i < body.items.length; i += chunkSize) {
    const batch = db.batch();
    for (const item of body.items.slice(i, i + chunkSize)) {
      const docRef = col.doc().withConverter(mediaConverter);
      batch.set(docRef, {
        id: docRef.id,
        pageUrl: item.pageUrl,
        created_at: Date.now(),
        file_key: null,
        pending_delete: false,
        tags_all: [],
        external: {
          id: '',
          imageUrl: '',
          thumbnailUrl: '',
          title: '',
          tags: [],
        },
        user: {
          title: null,
          notes: item.notes ?? '',
          rating: 0,
          tags: [],
        },
        import: {
          status: 'unimported',
          last_imported_at: null,
          parser: null,
          last_error: null,
        },
      });
    }
    batches.push(batch);
  }

  await Promise.all(batches.map((b) => b.commit()));
  return json({ count: body.items.length }, { status: 201 });
};
