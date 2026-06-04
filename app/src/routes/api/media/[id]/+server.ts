import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/firebase/server';
import { mediaConverter } from '../../../media/_types';
import { buildTags } from 'shared';

export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  await db.doc(`media-metadata/${params.id}`).delete();
  return json({ success: true });
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
  if (!locals.auth?.uid) throw error(401, 'Unauthorized');

  const body = (await request.json()) as Record<string, unknown>;
  const allowed = [
    'pageUrl',
    'user.title',
    'user.notes',
    'user.rating',
    'user.tags',
    'pending_delete',
  ];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0) throw error(400, 'No valid fields');

  if ('user.tags' in patch) {
    const snap = await db.doc(`media-metadata/${params.id}`).withConverter(mediaConverter).get();
    if (!snap.exists) throw error(404, 'Not found');
    patch['tags_all'] = buildTags(snap.data()!.external, patch['user.tags'] as string[]);
  }

  await db.doc(`media-metadata/${params.id}`).update(patch);
  return json({ success: true });
};
