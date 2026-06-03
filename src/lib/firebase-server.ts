import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let serverDb: Firestore | null = null;

export function getServerDb(): Firestore {
  if (serverDb) return serverDb;
  if (!firebaseConfig.projectId) {
    throw new Error('Firebase non configuré. Vérifie les variables d\'environnement.');
  }
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  serverDb = getFirestore(app);
  return serverDb;
}
