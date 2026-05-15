import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

const firebaseConfig: FirebaseConfig = {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || 'dummy_key') as string,
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy_domain') as string,
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dummy_project') as string,
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dummy_bucket') as string,
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'dummy_sender') as string,
    appId: (import.meta.env.VITE_FIREBASE_APP_ID || 'dummy_id') as string,
    measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) as string | undefined
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;

try {
    if (firebaseConfig.apiKey === 'dummy_key') {
        console.warn('Firebase Hub: Missing VITE_FIREBASE_API_KEY. Initializing in offline simulation mode.');
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Only initialize analytics if running in a browser environment
    if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }
} catch (error) {
    console.error('Firebase Hub: Critical Initialization Error. Forcing local fallback.');
    app = {} as any;
    auth = {} as any;
    db = {} as any;
}

export { auth, db, analytics };
export default app;
