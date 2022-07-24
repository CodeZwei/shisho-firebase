/**
 * @fileoverview
 * Initializes Firebase admin
 * https://dev.to/vvo/how-to-add-firebase-service-account-json-files-to-vercel-ph5
 **/ 

import fbAdmin from 'firebase-admin';

let app: fbAdmin.app.App;

if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
    // Credentials loaded through Environment Variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string);

    app = fbAdmin.initializeApp({
        credential: fbAdmin.credential.cert(serviceAccount),
    });
} else {
    // Credentials loaded from file saved in GOOGLE_APPLICATION_CREDENTIALS
    app = fbAdmin.initializeApp();
}

const db = app.firestore();
const auth = app.auth();

export {app as admin, auth, db};
