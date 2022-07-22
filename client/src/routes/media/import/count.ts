/*
 * @fileoverview Testing endpoint for a simple count collection elements query
 * verifying the auth sent over.
 */

import type {RequestHandler} from '@sveltejs/kit';
import {db, auth} from '$lib/firebase/server';

export const get: RequestHandler = async ({request}) => {
  console.log('/media/list/count called');
  const token = request.headers.get('firebase-auth-token');

  if (!token) return {status: 403};

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    console.log('Count got an auth UID of ' + uid);
    if (uid !== 'CGrN3Ndk3vhhIjQUSPqv7yd9OJF3') {
      return {
        status: 403,
        body: {
          error: `User ${uid} is not authorized for this endpoint.`,
        },
      };
    }

    const count =
        await db.collection('media-metadata').get().then(snap => snap.size);

    return {status: 200, body: JSON.stringify({count})};
  } catch (reason) {
    return {status: 400, body: JSON.stringify({error: reason})};
  }
};
