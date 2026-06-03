import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/firebase/server';

export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  await db.doc(`media-metadata/${params.id}`).delete();
  return json({ success: true });
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  const body = (await request.json()) as Record<string, unknown>;
  const allowed = [
    'title', 'pageUrl', 'imageUrl', 'notes', 'rating',
    'tags_copyright', 'tags_character', 'tags_artist', 'tags_general', 'tags_meta',
  ];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0) throw error(400, 'No valid fields');

  await db.doc(`media-metadata/${params.id}`).update(patch);
  return json({ success: true });
};
