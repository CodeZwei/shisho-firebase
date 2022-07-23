import {auth} from '$lib/firebase/server';
import type {RequestHandler} from '@sveltejs/kit';
import * as cookie from 'cookie';

export const post: RequestHandler = async ({request}) => {
  // Get the ID token passed and the CSRF token.
  const {idToken} = await request.json();
  // const csrfToken = request.body.csrfToken.toString();
  // Guard against CSRF attacks.
  // if (csrfToken !== request.cookies.csrfToken) {
  //   res.status(401).send('UNAUTHORIZED REQUEST!');
  //   return;
  // }

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // Create the session cookie. This will also verify the ID token in the
  // process. The session cookie will have the same claims as the ID token. To
  // only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a
  // session cookie.
  const sessionCookie = await auth.createSessionCookie(idToken, {expiresIn})

  // Set cookie policy for session cookie.
  const options = {maxAge: expiresIn, httpOnly: true, secure: true};
  return {
    headers: {
      'set-cookie': [
        cookie.serialize('firebase-auth-token', sessionCookie, options),
      ]
    },
    status: 200,
  };

  // TODO catch the error if createSessionCookie fails
  // catch (error) {
  //   return {status: 401, body: 'UNAUTHORIZED REQUEST!'};
  // };
};
