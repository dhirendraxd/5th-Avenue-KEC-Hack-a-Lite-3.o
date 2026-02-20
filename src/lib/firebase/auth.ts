import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from './config';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Set persistence for auth
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Failed to set persistence:', error);
});

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign in user with email and password
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): AuthUser | null => {
  const user = auth.currentUser;
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
    } else {
      callback(null);
    }
  });
};
