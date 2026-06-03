import {auth} from '$lib/firebase/server';
import type {RequestHandler} from './$types';
import * as cookie from 'cookie';
import {dev} from '$app/environment';

export const POST: RequestHandler = async ({request}) => {
  const {idToken} = await request.json();

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await auth.createSessionCookie(idToken, {expiresIn});

  const options: cookie.SerializeOptions = {
    path: '/',
    maxAge: expiresIn,
    httpOnly: true,
    secure: !dev
  };

  return new Response(null, {
    status: 200,
    headers: {
      'set-cookie': cookie.serialize('firebase-session-token', sessionCookie, options),
    }
  });
};
