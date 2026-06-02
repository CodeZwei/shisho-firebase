import { FIREBASE_SERVICE_ACCOUNT_JSON } from '$env/static/private';
import fbAdmin from 'firebase-admin';

let _app: fbAdmin.app.App;

if (FIREBASE_SERVICE_ACCOUNT_JSON) {
  const serviceAccount = JSON.parse(Buffer.from(FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString());
  _app = fbAdmin.initializeApp({ credential: fbAdmin.credential.cert(serviceAccount) });
} else {
  _app = fbAdmin.initializeApp();
}

const db = _app.firestore();
const auth = _app.auth();

export { _app as admin, auth, db };
