import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC7xPmrzDZ7G6S92XM75OwQn_fwNpIJ1Cg",
  authDomain: "kec-lite.firebaseapp.com",
  projectId: "kec-lite",
  storageBucket: "kec-lite.firebasestorage.app",
  messagingSenderId: "741415385396",
  appId: "1:741415385396:web:00be3fbbbc234302028d61",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
