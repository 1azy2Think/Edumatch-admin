import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC0p1ezOZDyQ4bM98JqiDLCjOSh3_WQ8pE",
    authDomain: "edumatch-b415e.firebaseapp.com",
    projectId: "edumatch-b415e",
    storageBucket: "edumatch-b415e.firebasestorage.app",
    messagingSenderId: "1071264205548",
    appId: "1:1071264205548:android:cd9f14e5fa634fd8c7f3c9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
