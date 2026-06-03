import { auth } from '$lib/firebase/client';
import { goto } from '$app/navigation';

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status !== 401) return res;

  const user = auth.currentUser;
  if (!user) {
    await goto('/');
    return res;
  }

  const idToken = await user.getIdToken(true);
  const renewRes = await fetch('/session/login', {
    method: 'POST',
    headers: { accept: 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!renewRes.ok) {
    await goto('/');
    return res;
  }

  return fetch(input, init);
}
