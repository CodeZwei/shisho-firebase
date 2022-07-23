import {auth} from '$lib/firebase/server';
import type {RequestHandler} from '@sveltejs/kit';
import * as cookie from 'cookie';

export const post: RequestHandler = async ({request}) => {
  const cookies = cookie.parse(request.headers.get('cookie') || '');
  const sessionCookie = cookies['firebase-auth-token'];

  if (sessionCookie) {
    // Revoke refresh tokens to force a full re-login
    await auth.verifySessionCookie(sessionCookie)
        .then(decodedToken => auth.revokeRefreshTokens(decodedToken.sub));
  }

  return {
    status: 303, headers: {
      location: '/',
      // Explicitly set a maxAge of zero to void the cookie immediately
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
      'set-cookie': cookie.serialize('firebase-auth-token', '', {maxAge: 0}),
    }
  }
};
