import {auth} from '$lib/firebase/server';
import type {RequestHandler} from './$types';
import * as cookie from 'cookie';

export const POST: RequestHandler = async ({request}) => {
  const cookies = cookie.parse(request.headers.get('cookie') || '');
  const sessionCookie = cookies['firebase-session-token'];

  if (sessionCookie) {
    await auth.verifySessionCookie(sessionCookie)
        .then(decodedToken => auth.revokeRefreshTokens(decodedToken.sub));
  }

  const options: cookie.SerializeOptions = {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: true,
  };

  return new Response(null, {
    status: 200,
    headers: {
      'set-cookie': cookie.serialize('firebase-session-token', '', options),
    }
  });
};
