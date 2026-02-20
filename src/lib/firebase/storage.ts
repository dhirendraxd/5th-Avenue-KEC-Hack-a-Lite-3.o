import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = async (path: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple files to Firebase Storage
 */
export const uploadMultipleFiles = async (
  basePath: string,
  files: File[]
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`;
      return uploadFile(path, file);
    });
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get download URL for a file
 */
export const getFileUrl = async (path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, path);
    return await downloadURL(fileRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

/**
 * List files in a directory
 */
export const listFiles = async (path: string): Promise<string[]> => {
  try {
    const dirRef = ref(storage, path);
    const result = await listAll(dirRef);
    
    const urls = await Promise.all(
      result.items.map((itemRef) => getDownloadURL(itemRef))
    );
    
    return urls;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};
