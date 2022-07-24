import * as admin from 'firebase-admin';

// Initializes Firebase admin
// https://dev.to/vvo/how-to-add-firebase-service-account-json-files-to-vercel-ph5

let app: admin.app.App;

if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
    // Credentials loaded through Environment Variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string);

    app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    // Credentials loaded from file saved in GOOGLE_APPLICATION_CREDENTIALS
    app = admin.initializeApp();
}

const db = app.firestore();
const auth = app.auth();

export {app as admin, auth, db};
