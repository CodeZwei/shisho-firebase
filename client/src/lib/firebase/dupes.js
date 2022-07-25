/**
 * @fileoverview This package is a WIP, it includes runnable commandline scripts
 * for interacting with Firebase.
 *
 * export GOOGLE_APPLICATION_CREDENTIALS=/Users/brisberg/ZweiProjects/shisho-firebase/client/shisho-app-firebase-adminsdk-1ltb7-fbe973716c.json && node ./client/src/lib/firebase/dupes.js
 */

import fbAdmin from 'firebase-admin';

let app;

console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
	// Credentials loaded through Environment Variable
	const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

	app = fbAdmin.initializeApp({
		credential: fbAdmin.credential.cert(serviceAccount),
	});
} else {
	// Credentials loaded from file saved in GOOGLE_APPLICATION_CREDENTIALS
	app = fbAdmin.initializeApp();
}

const db = app.firestore();
const auth = app.auth();

export default function countMediaDupes() {
	db.collection('media-metadata')
		.get()
		.then((snapshot) => {
			const urls = new Map();

			for (let doc of snapshot.docs) {
				const url = doc.data()['pageUrl'];

				if (url) {
					const count = urls.get(url) || 0;
					urls.set(url, count + 1);
				}
			}

			for (let [url, count] of urls) {
				if (count > 1) {
					console.log(`${count} : ${url}`);
				}
			}
		});
}

countMediaDupes();
