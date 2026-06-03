import {auth} from '$lib/firebase/client';
import {readable} from 'svelte/store';
import type {ParsedToken} from 'firebase/auth';
import {GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect} from 'firebase/auth';
import {browser} from '$app/environment';
import {goto} from '$app/navigation';

// Adapted from https://codechips.me/firebase-authentication-with-svelte/

export type User = {
  id: string|object|undefined; name: string | object | undefined;
  email: string | object | undefined;
  picture: string | object | undefined;
};

const userMapper = (claims: ParsedToken): User => ({
  id: claims['sub'] as string | object | undefined,
  name: claims['name'] as string | object | undefined,
  email: claims['email'] as string | object | undefined,
  picture: claims['picture'] as string | object | undefined
});

// construction function. need to call it after we
// initialize our firebase app
export const initAuth = (useRedirect = false) => {
  async function performSessionLogin(token: string) {
    await fetch(`${window.location.origin}/session/login`, {
      headers: {'accept': 'application/json', 'content-type': 'application/json'},
      method: 'post',
      body: JSON.stringify({idToken: token})
    });
    return;
  }

  const loginWithEmailPassword =
      async (email: string, password: string) => {
    const creds = await signInWithEmailAndPassword(auth, email, password);
    const token = await creds.user.getIdToken();
    return await performSessionLogin(token);
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    if (useRedirect) {
      // TODO: Hook this into setting a session
      return signInWithRedirect(auth, provider);
    } else {
      const creds = await signInWithPopup(auth, provider);
      const token = await creds.user.getIdToken();
      return await performSessionLogin(token);
    }
  };

  const logout = async () => {
    await auth.signOut();
    await fetch(`${window.location.origin}/session/logout`, {method: 'post'});
    await goto('/');
  };

  // wrap Firebase user in a Svelte readable store
  const user = readable<User|null>(null, set => {
    const unsub = auth.onAuthStateChanged(async fireUser => {
      if (fireUser) {
        console.log('auth.ts Firebase auth user changed. browser=' + browser);
        const token = await fireUser.getIdTokenResult();
        const user = userMapper(token.claims);
        set(user);
      } else {
        set(null);
      }
    });

    return unsub;
  });

  return {user, loginWithGoogle, loginWithEmailPassword, logout};
};
