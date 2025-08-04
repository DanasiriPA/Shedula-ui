import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import mockDoctors from "../src/lib/mockDoctors";

// Load environment variables
dotenv.config({ path: '.env.local' });

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env.local file.');
  process.exit(1);
}

// Initialize Firebase
try {
  initializeApp({
    credential: cert(JSON.parse(serviceAccountKey)),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = getFirestore();

const uploadDoctors = async () => {
  console.log('Starting to upload mock doctor data to Firestore...');

  const doctorsCollection = db.collection('doctors');
  const batch = db.batch();
  let count = 0;

  for (const doctor of mockDoctors) {
    // Create document with both original data and the shared UID
    const doctorData = {
      ...doctor,
      uid: "b2FxNOgwPuhynq3lJUPvHaQOJV82" // Ensure all have the same UID
    };
    
    // Use the mock ID as the document ID for easier reference
    const docRef = doctorsCollection.doc(doctor.id);
    batch.set(docRef, doctorData);
    count++;
  }

  try {
    await batch.commit();
    console.log(`Successfully uploaded ${count} doctors to Firestore! 🎉`);
    console.log(`All doctors share UID: b2FxNOgwPuhynq3lJUPvHaQOJV82`);
  } catch (error) {
    console.error('Failed to upload doctors:', error);
  }
};

uploadDoctors();