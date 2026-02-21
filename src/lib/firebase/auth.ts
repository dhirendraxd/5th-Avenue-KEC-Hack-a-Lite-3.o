import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, hasError } from "./config";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Set persistence for auth only if Firebase is available
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn("Failed to set persistence:", error);
  });
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
): Promise<User> => {
  if (!auth) throw new Error("Firebase not initialized");
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};

/**
 * Sign in user with email and password
 */
export const signIn = async (
  email: string,
  password: string,
): Promise<User> => {
  if (!auth) throw new Error("Firebase not initialized");
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  if (!auth) throw new Error("Firebase not initialized");
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): AuthUser | null => {
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  if (!auth) {
    console.warn("Firebase not initialized, calling callback with null");
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  if (!auth) throw new Error("Firebase not initialized");
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
};
