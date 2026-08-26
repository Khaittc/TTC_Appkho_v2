import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { IS_DEMO_MODE } from '../config/env';

export let app: FirebaseApp;
export let auth: Auth;
export let db: Firestore;
export let googleProvider: GoogleAuthProvider;

if (!IS_DEMO_MODE) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
  googleProvider = new GoogleAuthProvider();
} else {
  // Mock implementations for Demo Mode to satisfy type checking if needed
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  googleProvider = {} as GoogleAuthProvider;
}

