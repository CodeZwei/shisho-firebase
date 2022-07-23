import {browser} from '$app/env';
import {initializeApp} from 'firebase/app';
import {getAuth, inMemoryPersistence} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBZV9vyXEFXLbaPQ8pPm-fijhwnkog74x0',
  authDomain: 'shisho-app.firebaseapp.com',
  projectId: 'shisho-app',
  storageBucket: 'shisho-app.appspot.com',
  messagingSenderId: '64714529705',
  appId: '1:64714529705:web:adfe3f83b4259dd3e742b8',
  measurementId: 'G-4W3M0K6N8G',
};

// Initialize Firebase
console.log('Firebase initialized. browser=' + browser);
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
auth.setPersistence(inMemoryPersistence);
const db = getFirestore(app);

export {app, auth, db};
