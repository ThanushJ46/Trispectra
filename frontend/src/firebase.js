import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB1o37fUE_ibmPJ-gzY540Cw4x1cE0G12k",
  authDomain: "wastewise-91cff.firebaseapp.com",
  projectId: "wastewise-91cff",
  storageBucket: "wastewise-91cff.firebasestorage.app",
  messagingSenderId: "597880451732",
  appId: "1:597880451732:web:f416a39aca7710ab85ba81"
};

const fbApp = initializeApp(FIREBASE_CONFIG);
const fbAuth = getAuth(fbApp);

export { fbAuth, GoogleAuthProvider, signInWithPopup };
