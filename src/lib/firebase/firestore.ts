import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Query,
  QueryConstraint,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Get a single document by ID
 */
export const getDocument = async <T>(collectionName: string, docId: string): Promise<T | null> => {
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
  constraints: QueryConstraint[] = []
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
  data: T
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
  data: Partial<T>
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
export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
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
  operator: '==' | '<' | '>' | '<=' | '>=' | '!=',
  value: any
): Promise<T[]> => {
  try {
    const q = query(
      collection(db, collectionName),
      where(field, operator as any, value)
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
  direction: 'asc' | 'desc' = 'asc',
  limitNum?: number
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
    console.error(`Error getting ordered documents from ${collectionName}:`, error);
    throw error;
  }
};
