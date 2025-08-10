// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    getFirestore,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDUl0ixvaHik68oxdMtyhJLXXnDdJ_tOPg",
    authDomain: "foss-mentoring.firebaseapp.com",
    projectId: "foss-mentoring",
    storageBucket: "foss-mentoring.appspot.com",
    messagingSenderId: "160694360381",
    appId: "1:160694360381:web:66434093e63551094a8d54"
};

// Initialize Firebase app only once
const app = initializeApp(firebaseConfig);

//const auth = app.auth();
const db = getFirestore(app);
const storage = getStorage(app);

// Auth exports
const auth = getAuth();
const googleAuthProvider = new GoogleAuthProvider();

export { app, db, auth, googleAuthProvider, signInWithPopup, signOut, storage };
// Connect to Firestore emulator if running in development mode

