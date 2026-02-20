import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";

export interface ConditionPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: Date;
  type: "pickup" | "return" | "damage";
}

export interface ConditionLogEntry {
  id: string;
  rentalId: string;
  equipmentId: string;
  type: "pickup" | "return";
  timestamp: Date;
  condition: "excellent" | "good" | "fair" | "damaged";
  notes: string;
  photos: ConditionPhoto[];
  verifiedBy: string;
  damageReported: boolean;
  damageDescription?: string;
}

interface ConditionLogStore {
  logs: ConditionLogEntry[];
  addLog: (log: Omit<ConditionLogEntry, "id" | "timestamp">) => void;
}

// Custom storage that handles Date serialization
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try {
      const parsed = JSON.parse(str);
      if (parsed.state?.logs) {
        parsed.state.logs = parsed.state.logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          photos: (log.photos || []).map((photo: any) => ({
            ...photo,
            timestamp: new Date(photo.timestamp),
          })),
        }));
      }
      return parsed;
    } catch {
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

export const useConditionLogStore = create<ConditionLogStore>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) => {
        const newLog: ConditionLogEntry = {
          ...log,
          id: `log-${Date.now()}`,
          timestamp: new Date(),
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

// Hook to get logs for a rental with stable reference
export const useLogsForRental = (rentalId: string) => {
  const logs = useConditionLogStore((state) => state.logs);
  return useMemo(
    () => logs.filter((log) => log.rentalId === rentalId),
    [logs, rentalId],
  );
};
