import { db } from '$lib/firebase/server';
import { mediaConverter } from '../_types';
import { error } from '@sveltejs/kit';
import type { Media } from 'shared';

export async function load({ locals }) {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  const snapshot = await db
    .collection('media-metadata')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .withConverter(mediaConverter)
    .get();

  const mediaList: Media[] = [];
  snapshot.forEach((doc) => mediaList.push(doc.data()));

  return { mediaList };
}
