import {initializeApp} from 'firebase-admin';

const admin = initializeApp();
const db = admin.firestore();
const auth = admin.auth();

export {admin, auth, db};
