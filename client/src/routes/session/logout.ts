import {auth} from '$lib/firebase/server';
import type {RequestHandler} from '@sveltejs/kit';
import * as cookie from 'cookie';

export const post: RequestHandler = async ({request}) => {
  const cookies = cookie.parse(request.headers.get('cookie') || '');
  const sessionCookie = cookies['firebase-session-token'];

  if (sessionCookie) {
    // Revoke refresh tokens to force a full re-login
    await auth.verifySessionCookie(sessionCookie)
        .then(decodedToken => auth.revokeRefreshTokens(decodedToken.sub));
  }

  // Set cookie policy for session cookie.
  const options: cookie.CookieSerializeOptions = {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: true,
  };

  return {
    status: 200,
    headers: {
      // Explicitly set a maxAge of zero to void the cookie immediately
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
      'set-cookie': cookie.serialize('firebase-session-token', '', options),
    },
  }
};
