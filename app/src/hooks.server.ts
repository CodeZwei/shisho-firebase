import { auth } from '$lib/firebase/server';
import type { Handle } from '@sveltejs/kit';
import * as cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
  const cookies = cookie.parse(event.request.headers.get('cookie') || '');
  const sessionToken = cookies['firebase-session-token'];

  if (sessionToken) {
    try {
      const decoded = await auth.verifySessionCookie(sessionToken);
      event.locals.auth = { uid: decoded.uid };
    } catch {
      // invalid session cookie — continue unauthenticated
    }
  } else {
    const authHeader = event.request.headers.get('authorization') ?? '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (bearerToken) {
      try {
        const decoded = await auth.verifyIdToken(bearerToken);
        if (decoded.authorized === true) {
          event.locals.auth = { uid: decoded.uid };
        }
      } catch {
        // invalid token — continue unauthenticated
      }
    }
  }

  return resolve(event);
};
