import { db } from '$lib/firebase/server';
import { mediaConverter } from '../_types';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  const snap = await db
    .doc(`media-metadata/${params.id}`)
    .withConverter(mediaConverter)
    .get();

  if (!snap.exists) throw error(404, 'Not found');
  return { media: snap.data()! };
}
