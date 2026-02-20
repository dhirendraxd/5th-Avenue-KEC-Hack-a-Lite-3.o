import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug: log resolved Firebase config (non-sensitive fields only)
let app: any = null;
let hasError = false;

try {
  console.debug("[firebase/config] resolved config:", {
    apiKey: firebaseConfig.apiKey ? "***" : undefined,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.info("[firebase/config] Firebase initialized successfully");
} catch (e) {
  hasError = true;
  console.error("[firebase/config] Firebase initialization error:", e);
  console.warn(
    "[firebase/config] App will run in fallback mode without Firebase features",
  );
}

// Initialize Firebase services - provide null values if initialization failed
export const auth = app ? getAuth(app) : (null as any);
export const db = app ? getFirestore(app) : (null as any);
export const storage = app ? getStorage(app) : (null as any);

export default app;
export { hasError };
