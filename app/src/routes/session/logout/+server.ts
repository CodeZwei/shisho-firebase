import {auth} from '$lib/firebase/server';
import type {RequestHandler} from './$types';
import * as cookie from 'cookie';

export const POST: RequestHandler = async ({request}) => {
  const cookies = cookie.parse(request.headers.get('cookie') || '');
  const sessionCookie = cookies['firebase-session-token'];

  if (sessionCookie) {
    try {
      const decoded = await auth.verifySessionCookie(sessionCookie);
      await auth.revokeRefreshTokens(decoded.sub);
    } catch {
      // cookie already expired or invalid — still clear it
    }
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
