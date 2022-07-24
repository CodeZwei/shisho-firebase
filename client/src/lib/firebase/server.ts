import * as fbAdmin from 'firebase-admin';
const {initializeApp, credential} = fbAdmin;

// Initializes Firebase admin
// https://dev.to/vvo/how-to-add-firebase-service-account-json-files-to-vercel-ph5

let admin: fbAdmin.app.App;

if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
    // Credentials loaded through Environment Variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string);

    admin = initializeApp({
        credential: credential.cert(serviceAccount),
    });
} else {
    // Credentials loaded from file saved in GOOGLE_APPLICATION_CREDENTIALS
    admin = initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

export {admin, auth, db};
