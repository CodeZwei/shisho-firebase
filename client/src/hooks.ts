import {auth} from '$lib/firebase/server';
import type {GetSession, Handle} from '@sveltejs/kit';
import {sequence} from '@sveltejs/kit/hooks';
import * as cookie from 'cookie';

/** Built by default by svelte kit to power TODOs app. Can remove eventually. */
const setUserIdCookie: Handle = async ({event, resolve}) => {
  const cookies = cookie.parse(event.request.headers.get('cookie') || '');
  event.locals.userid = cookies['userid'] || crypto.randomUUID();

  const response = await resolve(event);

  if (!cookies['userid']) {
    // if this is the first time the user has visited this app,
    // set a cookie so that we recognize them when they return
    response.headers.set(
        'set-cookie',
        cookie.serialize('userid', event.locals.userid, {
          path: '/',
          httpOnly: true,
        }),
    );
  }

  return response;
};

/** Sends our current firebase authentication JWT to backend on every request */
const validateFirebaseAuthJWT: Handle = async ({event, resolve}) => {
  const token = event.request.headers.get('firebase-auth-token');
  // const cookies = cookie.parse(event.request.headers.get('cookie') || '');
  // const token = cookies['firebase-auth-token'];

  if (token) {
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    event.locals.auth = {uid};
  }

  const response = await resolve(event);

  return response;
};

export const handle = sequence(setUserIdCookie, validateFirebaseAuthJWT);

/** Sets the Svelte Session based on the locals set by verifying the token. */
export const getSession: GetSession = (event) => {
  if (!event.locals.auth) {
    return {};
  }

  return {...event.locals.auth};
};
