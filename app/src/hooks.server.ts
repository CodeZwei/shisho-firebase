import { auth } from '$lib/firebase/server';
import type { Handle } from '@sveltejs/kit';
import * as cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
  const cookies = cookie.parse(event.request.headers.get('cookie') || '');
  const token = cookies['firebase-session-token'];

  if (token) {
    const decodedToken = await auth.verifySessionCookie(token);
    event.locals.auth = { uid: decodedToken.uid };
  }

  return resolve(event);
};
