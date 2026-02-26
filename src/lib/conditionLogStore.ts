/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";

/**
 * Photo documentation for equipment condition
 * Used to visually verify equipment state at pickup/return
 */
export interface ConditionPhoto {
  id: string;
  url: string; // Base64 data URL or cloud storage URL
  caption: string;
  timestamp: Date;
  type: "pickup" | "return" | "damage"; // Context of photo
}

/**
 * Complete condition log entry for a rental transaction
 * Documents equipment state with photos, ratings, and notes
 * Critical for damage disputes and insurance claims
 */
export interface ConditionLogEntry {
  id: string;
  rentalId: string; // Associates log with specific rental
  equipmentId: string; // Which equipment was inspected
  type: "pickup" | "return"; // When inspection occurred
  timestamp: Date;
  condition: "excellent" | "good" | "fair" | "damaged"; // Overall rating
  notes: string; // Free-form observations
  photos: ConditionPhoto[]; // Visual evidence (minimum 2 required)
  verifiedBy: string; // Who performed inspection
  damageReported: boolean; // Flag for insurance/dispute tracking
  damageDescription?: string; // Required if damage reported
}

/**
 * Zustand store for managing condition logs
 * Persisted to localStorage for offline access
 */
interface ConditionLogStore {
  logs: ConditionLogEntry[];
  addLog: (log: Omit<ConditionLogEntry, "id" | "timestamp">) => void;
}

/**
 * Custom localStorage adapter that properly handles Date serialization
 *
 * Problem: JSON.stringify converts Dates to strings, but doesn't restore them
 * Solution: Manually reconstruct Date objects when reading from storage
 *
 * This ensures:
 * - Dates remain Date objects (not strings) after reload
 * - No "Invalid Date" errors when using date methods
 * - Consistent behavior across page refreshes
 */
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try {
      const parsed = JSON.parse(str);
      // Reconstruct Date objects from ISO strings
      if (parsed.state?.logs) {
        parsed.state.logs = parsed.state.logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp), // Convert string to Date
          photos: (log.photos || []).map((photo: any) => ({
            ...photo,
            timestamp: new Date(photo.timestamp), // Convert photo timestamps too
          })),
        }));
      }
      return parsed;
    } catch {
      // If parsing fails, clear corrupted data
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name: string, value: unknown) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

/**
 * Create the condition log store with persistence
 * - Stores logs in localStorage under 'gearshift-condition-logs'
 * - Automatically syncs with localStorage on changes
 * - Uses custom storage adapter for proper Date handling
 */
export const useConditionLogStore = create<ConditionLogStore>()(
  persist(
    (set) => ({
      logs: [],
      /**
       * Add a new condition log entry
       * Automatically generates ID and timestamp
       */
      addLog: (log) => {
        const newLog: ConditionLogEntry = {
          ...log,
          id: `log-${Date.now()}`, // Unique ID based on timestamp
          timestamp: new Date(), // Current time
        };
        set((state) => ({ logs: [...state.logs, newLog] }));
      },
    }),
    {
      name: "gearshift-condition-logs",
      storage: customStorage as any,
    },
  ),
);

/**
 * Custom hook to get condition logs for a specific rental
 *
 * Uses useMemo to:
 * - Prevent unnecessary re-filtering on every render
 * - Return stable reference when logs haven't changed
 * - Improve performance in components that use this data
 *
 * @param rentalId - ID of rental to get logs for
 * @returns Array of condition logs for that rental
 */
export const useLogsForRental = (rentalId: string) => {
  const logs = useConditionLogStore((state) => state.logs);
  return useMemo(
    () => logs.filter((log) => log.rentalId === rentalId),
    [logs, rentalId],
  );
};
