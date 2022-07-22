import { readable } from 'svelte/store';
import {auth} from '$lib/firebase';
import type { ParsedToken } from 'firebase/auth';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';

// Adapted from https://codechips.me/firebase-authentication-with-svelte/

export type User = {
    id: string|object|undefined;
    name: string|object|undefined;
    email: string|object|undefined;
    picture: string|object|undefined;
};

const userMapper = (claims: ParsedToken): User => ({
  id: claims.sub,
  name: claims.name,
  email: claims.email,
  picture: claims.picture
});

// construction function. need to call it after we
// initialize our firebase app
export const initAuth = (useRedirect = false) => {
  const loginWithEmailPassword = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();

    if (useRedirect) {
      return signInWithRedirect(auth, provider);
    } else {
      return signInWithPopup(auth, provider);
    }
  };

  const logout = () => auth.signOut();

  // wrap Firebase user in a Svelte readable store
  const user = readable<User|null>(null, set => {
    const unsub = auth.onAuthStateChanged(async fireUser => {
      if (fireUser) {
        const token = await fireUser.getIdTokenResult();
        const user = userMapper(token.claims);
        set(user);
      } else {
        set(null);
      }
    });

    return unsub;
  });

  return {
    user,
    loginWithGoogle,
    loginWithEmailPassword,
    logout
  };
};