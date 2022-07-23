import type {RequestHandler} from './__types';
import {db} from '$lib/firebase/server';
import type {Media} from '../_types';
import {browser} from '$app/env';

export const get: RequestHandler = async ({locals}) => {
  // TODO: Implement permissions using locals.

  console.log('media/list GET running browser=' + browser);
  const metadataCol = db.collection('media-metadata').limit(50);
  const q = metadataCol.get();

  const snapshot = await q;
  const mediaList: Media[] = [];
  snapshot.forEach((doc) => mediaList.push(doc.data() as Media));

  return {status: 200, body: {mediaList}};
};

export const del: RequestHandler = async ({request}) => {
  const form = await request.formData();

  const uid = form.get('uid');

  const ref = db.doc('media-metadata/' + uid);

  return ref.delete()
      .then(() => {
        return {status: 200};
      })
      .catch((reason) => {
        return {status: 400, body: {error: reason}};
      });
};
