import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "./config";

const normalizeStorageError = (error: unknown): Error => {
  const storageError = error as { code?: string; message?: string };
  const code = storageError?.code ?? "";

  if (code === "storage/unauthorized") {
    return new Error(
      "You do not have permission to upload this file. Please sign in again.",
    );
  }

  if (code === "storage/canceled") {
    return new Error("Upload was canceled. Please try again.");
  }

  if (code === "storage/quota-exceeded") {
    return new Error("Storage quota exceeded. Please contact support.");
  }

  if (code === "storage/retry-limit-exceeded") {
    return new Error(
      "Upload took too long. Please retry with a smaller image.",
    );
  }

  if (code === "storage/invalid-format") {
    return new Error("Invalid image format. Please upload a valid image file.");
  }

  if (code === "storage/invalid-checksum") {
    return new Error("File upload was corrupted. Please retry.");
  }

  return new Error(storageError?.message || "Failed to upload file.");
};

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
    console.error("Error uploading file:", error);
    throw normalizeStorageError(error);
  }
};

/**
 * Upload multiple files to Firebase Storage
 */
export const uploadMultipleFiles = async (
  basePath: string,
  files: File[],
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`;
      return uploadFile(path, file);
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw normalizeStorageError(error);
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
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Get download URL for a file
 */
export const getFileUrl = async (path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw normalizeStorageError(error);
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
      result.items.map((itemRef) => getDownloadURL(itemRef)),
    );

    return urls;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};
