import { FIREBASE_SERVICE_ACCOUNT_JSON } from '$env/static/private';
import fbAdmin from 'firebase-admin';

if (!FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_JSON is not set in app/.env.\n' +
    'Download a service account key from Firebase Console → Project Settings → Service Accounts,\n' +
    'then base64-encode it: base64 -i service-account.json | tr -d "\\n"'
  );
}

const serviceAccount = JSON.parse(Buffer.from(FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString());
const _app = fbAdmin.initializeApp({ credential: fbAdmin.credential.cert(serviceAccount) });

const db = _app.firestore();
const auth = _app.auth();

export { _app as admin, auth, db };
