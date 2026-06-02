# Firebase

## Auth Design

Single authorized user. The flow:

1. User logs in with Google OAuth via Firebase Auth (client SDK).
2. The Firebase session cookie is set server-side via `auth.createSessionCookie()`.
3. On every backend request, `hooks.ts` verifies the session cookie via `auth.verifySessionCookie()` and decodes the custom claims.
4. The backend checks for `decodedToken.authorized === true`. If absent, return 403.

The `authorized` custom claim must be set once on your Firebase account via the Admin SDK:
```js
await admin.auth().setCustomUserClaims(uid, { authorized: true });
```

This is done once manually (or via a one-shot script). No self-service registration.

**References**:
- https://firebase.google.com/docs/auth/admin/custom-claims
- https://medium.com/firebase-developers/patterns-for-security-with-firebase-group-based-permissions-for-cloud-firestore-72859cdec8f6

## Firestore Security Rules

Current rules are incomplete. Target rules:

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

These rules only apply to direct client SDK access. Since all clients will route through the backend API (which uses the Admin SDK and bypasses these rules), the rules act as a safety net against misconfigured clients. The real enforcement is in the backend.

## Firebase Storage Rules

Restrict all access to authorized users only. No public URLs for stored files — generate signed URLs server-side.

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
FIREBASE_SERVICE_ACCOUNT_JSON=   # base64-encoded JSON of service account key
```

**For Vercel deployment**: encode the service account JSON as base64 and paste it as the env var value. See: https://dev.to/vvo/how-to-add-firebase-service-account-json-files-to-vercel-ph5

Decode it in `lib/firebase/server.ts`:
```ts
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!, 'base64').toString()
);
```

## Current State / TODOs

- [ ] Move hardcoded Firebase config in `client/src/lib/firebase/client.ts` to env vars
- [ ] Fix `client/src/hooks.ts` — uses removed SvelteKit v1 `getSession` API
- [ ] Set `authorized` custom claim on the admin Firebase account
- [ ] Write complete Firestore security rules
- [ ] Write Firebase Storage security rules
