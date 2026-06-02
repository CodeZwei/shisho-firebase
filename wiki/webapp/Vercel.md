# Vercel Integration

Vercel can be auto-configured to recieve events from your repo and build/deploy from the main branch.

https://dev.to/vvo/how-to-add-firebase-service-account-json-files-to-vercel-ph5

This article talks about how to hook in the Firebase Admin service account email as a JSON encoded environment variable on Vercel.


**For Vercel deployment**: encode the service account JSON as base64 and paste it as the env var value. See: https://dev.to/vvo/how-to-add-firebase-service-account-json-files-to-vercel-ph5

Decode it in `lib/firebase/server.ts`:
```ts
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!, 'base64').toString()
);
```