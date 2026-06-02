import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/firebase/server';

export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  await db.doc(`media-metadata/${params.id}`).delete();
  return json({ success: true });
};
