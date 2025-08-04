// File:lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase with the singleton pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services from the app instance
const auth = getAuth(app);
const db = getFirestore(app);

// Use Firebase emulators in development
if (process.env.NODE_ENV === 'development') {
    // connectAuthEmulator(auth, "http://127.0.0.1:9099");
    // connectFirestoreEmulator(db, "127.0.0.1", 8080);
    console.log("Firebase initialized in development mode.");
}

// Export initialized services for use throughout the application
export { app, auth, db };

// Type exports for better type safety
export type { FirebaseApp, Auth, Firestore };