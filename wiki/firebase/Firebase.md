# Firebase

## Auth Design

Single authorized user. Two auth paths, both verified in `hooks.ts` before any route handler runs.

### Browser flow

1. User clicks "Sign in with Google" — Firebase Auth client SDK handles the OAuth flow in the browser
2. Firebase returns a short-lived ID token (1 hour)
3. The SvelteKit app sends that token to a server endpoint, which calls `auth.createSessionCookie()` to exchange it for a long-lived session cookie (e.g. 14 days)
4. The cookie is set `httpOnly` and sent automatically by the browser on every request
5. `hooks.ts` calls `auth.verifySessionCookie()`, confirms `authorized: true`, populates `event.locals.auth`

### CLI / extension flow

1. One-time: `shisho login` opens a browser, completes Google OAuth, and stores a **refresh token** in `~/.config/shisho/config.json`
2. On every command, the CLI calls Firebase's token exchange endpoint to swap the refresh token for a fresh ID token
3. The ID token is sent as `Authorization: Bearer <token>` on each API request
4. `hooks.ts` calls `auth.verifyIdToken()`, confirms `authorized: true`, populates `event.locals.auth`

### hooks.ts middleware pattern

```typescript
const sessionCookie = cookies.get('firebase-session-token');
if (sessionCookie) {
  const decoded = await auth.verifySessionCookie(sessionCookie, true);
  event.locals.auth = decoded;
  return resolve(event);
}

const header = event.request.headers.get('Authorization');
if (header?.startsWith('Bearer ')) {
  const decoded = await auth.verifyIdToken(header.slice(7));
  event.locals.auth = decoded;
  return resolve(event);
}
```

Both paths produce the same `event.locals.auth` shape. All route handlers check `event.locals.auth?.authorized === true`.

### Setting the authorized custom claim

Must be done once manually via the Admin SDK after the account is created:

```js
await admin.auth().setCustomUserClaims(uid, { authorized: true });
```

No self-service registration. A valid session without this claim returns 403.

**References**:
- https://firebase.google.com/docs/auth/admin/custom-claims
- https://medium.com/firebase-developers/patterns-for-security-with-firebase-group-based-permissions-for-cloud-firestore-72859cdec8f6

## Firestore Security Rules

The SvelteKit server uses the Admin SDK, which bypasses Firestore rules entirely. These rules are a safety net against any future misconfigured direct-access client — they should never be the primary enforcement mechanism.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.token.authorized == true;
    }
  }
}
```

## Firebase Storage Rules

Restrict all access to authorized users only. No public URLs — generate signed URLs server-side via the Admin SDK.

## Environment Variables

Firebase config must never be hardcoded. Use environment variables:

```
# Client-side (SvelteKit PUBLIC_ prefix exposes to browser)
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=

# Server-side only
FIREBASE_SERVICE_ACCOUNT_JSON=   # base64-encoded service account JSON
```

Decode the service account in `app/src/lib/firebase/server.ts`:

```ts
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!, 'base64').toString()
);
```

See [Vercel.md](../webapp/Vercel.md) for how to set these in the Vercel dashboard.

## Current TODOs

- [ ] Move hardcoded Firebase config in `app/src/lib/firebase/client.ts` to env vars
- [ ] Fix `app/src/hooks.ts` — uses removed SvelteKit v1 `getSession` API; rewrite using pattern above
- [ ] Set `authorized` custom claim on the authorized Firebase account
- [ ] Write complete Firestore security rules
- [ ] Write Firebase Storage security rules
