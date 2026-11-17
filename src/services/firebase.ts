import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
/* CRITICAL: Passing firestoreDatabaseId ensures the specific Firestore instance is used */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // Attempt light connection check to test server connectivity
    await getDocFromServer(doc(db, 'system', 'connection_check'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: Client is currently operating in offline persistence mode.');
      return false;
    }
    // Permissions error or non-existent document means connection succeeded to server
    return true;
  }
}

export default app;
