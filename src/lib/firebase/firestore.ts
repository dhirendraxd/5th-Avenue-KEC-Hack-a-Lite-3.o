/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Query,
  QueryConstraint,
  orderBy,
  limit,
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Get a single document by ID
 */
export const getDocument = async <T>(
  collectionName: string,
  docId: string,
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get all documents in a collection with optional filters
 */
export const getDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> => {
  try {
    const q: Query = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Create or overwrite a document
 */
export const createDocument = async <T>(
  collectionName: string,
  docId: string,
  data: T,
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Update a document
 */
export const updateDocument = async <T>(
  collectionName: string,
  docId: string,
  data: Partial<T>,
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data as any);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  collectionName: string,
  docId: string,
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Query documents with where clauses
 */
export const queryDocuments = async <T>(
  collectionName: string,
  field: string,
  operator: "==" | "<" | ">" | "<=" | ">=" | "!=",
  value: any,
): Promise<T[]> => {
  try {
    const q = query(
      collection(db, collectionName),
      where(field, operator as any, value),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get documents ordered by a field
 */
export const getOrderedDocuments = async <T>(
  collectionName: string,
  orderByField: string,
  direction: "asc" | "desc" = "asc",
  limitNum?: number,
): Promise<T[]> => {
  try {
    const constraints: QueryConstraint[] = [orderBy(orderByField, direction)];
    if (limitNum) {
      constraints.push(limit(limitNum));
    }

    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(
      `Error getting ordered documents from ${collectionName}:`,
      error,
    );
    throw error;
  }
};

/**
 * Realtime subscription to documents in a collection
 */
export const subscribeDocuments = <T>(
  collectionName: string,
  onNext: (docs: T[]) => void,
  constraints: QueryConstraint[] = [],
  onError?: (error: Error) => void,
) => {
  try {
    const q: Query = query(collection(db, collectionName), ...constraints);
    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        onNext(data);
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
        onError?.(error as Error);
      },
    );
  } catch (error) {
    console.error(
      `Error setting up subscription for ${collectionName}:`,
      error,
    );
    onError?.(error as Error);
    return () => undefined;
  }
};

/**
 * Realtime subscription to a single document
 */
export const subscribeDocument = <T>(
  collectionName: string,
  docId: string,
  onNext: (doc: (T & { id: string }) | null) => void,
  onError?: (error: Error) => void,
) => {
  try {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (!snapshot.exists()) {
          onNext(null);
          return;
        }
        onNext({ id: snapshot.id, ...snapshot.data() } as T & { id: string });
      },
      (error) => {
        console.error(
          `Error subscribing to ${collectionName}/${docId}:`,
          error,
        );
        onError?.(error as Error);
      },
    );
  } catch (error) {
    console.error(
      `Error setting up document subscription for ${collectionName}/${docId}:`,
      error,
    );
    onError?.(error as Error);
    return () => undefined;
  }
};
