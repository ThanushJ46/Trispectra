import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const firebaseEnabled = Boolean(
  FIREBASE_CONFIG.apiKey && 
  FIREBASE_CONFIG.authDomain && 
  FIREBASE_CONFIG.projectId && 
  FIREBASE_CONFIG.appId
);

let fbApp = null;
let fbAuth = null;

if (firebaseEnabled) {
  fbApp = initializeApp(FIREBASE_CONFIG);
  fbAuth = getAuth(fbApp);
} else {
  console.warn("Firebase config missing or invalid. Demo auth mode enabled.");
}

export { fbAuth, GoogleAuthProvider, signInWithPopup, firebaseEnabled };
