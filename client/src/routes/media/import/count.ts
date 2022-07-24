/*
 * @fileoverview Testing endpoint for a simple count collection elements query
 * verifying the auth sent over.
 */

import type {RequestHandler} from '@sveltejs/kit';
import {db} from '$lib/firebase/server';

export const get: RequestHandler = async ({locals}) => {
  console.log('/media/list/count called');
  const uid = locals.auth?.uid;
  console.log('Request has uid: ' + uid);

  if (!uid) return {status: 403};

  if (uid !== 'CGrN3Ndk3vhhIjQUSPqv7yd9OJF3') {
    return {
      status: 403,
      body: {
        error: `User ${uid} is not authorized for this endpoint.`,
      },
    };
  }

  const count =
      await db.collection('media-metadata').limit(1).get().then(snap => snap.size);

  return {status: 200, body: JSON.stringify({count})};
};
