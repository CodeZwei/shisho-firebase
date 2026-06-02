import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/firebase/server';
import { mediaConverter } from '../../media/_types';
import { Timestamp } from 'firebase-admin/firestore';
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
      batch.set(col.doc(), {
        pageUrl: item.pageUrl,
        notes: item.notes ?? '',
        createdAt: Timestamp.now(),
        pending_delete: false,
      });
    }
    batches.push(batch);
  }

  await Promise.all(batches.map((b) => b.commit()));
  return json({ count: body.items.length }, { status: 201 });
};
