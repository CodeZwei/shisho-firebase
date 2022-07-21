import {initializeApp} from 'firebase/app';
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {app, db};
