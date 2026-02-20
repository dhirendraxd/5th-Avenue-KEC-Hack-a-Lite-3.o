import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskFlag } from './flaggingSystem';

interface FlagStore {
  flags: TaskFlag[];
  addFlag: (flag: Omit<TaskFlag, 'id' | 'createdAt' | 'status'>) => TaskFlag;
  resolveFlag: (flagId: string, resolvedBy: string, resolutionNote?: string) => void;
  acknowledgeFlag: (flagId: string) => void;
  getFlagsForRental: (rentalId: string) => TaskFlag[];
  getOpenFlags: () => TaskFlag[];
  deleteFlag: (flagId: string) => void;
}

export const useFlagStore = create<FlagStore>()(
  persist(
    (set, get) => ({
      flags: [],
      
      addFlag: (flagData) => {
        const newFlag: TaskFlag = {
          ...flagData,
          id: `flag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          status: 'open',
        };
        set((state) => ({ flags: [...state.flags, newFlag] }));
        return newFlag;
      },
      
      resolveFlag: (flagId, resolvedBy, resolutionNote) => {
        set((state) => ({
          flags: state.flags.map((flag) =>
            flag.id === flagId
              ? {
                  ...flag,
                  status: 'resolved' as const,
                  resolvedAt: new Date(),
                  resolvedBy,
                  resolutionNote,
                }
              : flag
          ),
        }));
      },
      
      acknowledgeFlag: (flagId) => {
        set((state) => ({
          flags: state.flags.map((flag) =>
            flag.id === flagId ? { ...flag, status: 'acknowledged' as const } : flag
          ),
        }));
      },
      
      getFlagsForRental: (rentalId) => {
        return get().flags.filter((flag) => flag.rentalId === rentalId);
      },
      
      getOpenFlags: () => {
        return get().flags.filter((flag) => flag.status !== 'resolved');
      },
      
      deleteFlag: (flagId) => {
        set((state) => ({
          flags: state.flags.filter((flag) => flag.id !== flagId),
        }));
      },
    }),
    {
      name: 'gearshift-flags',
      // Handle Date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            if (parsed.state?.flags) {
              parsed.state.flags = parsed.state.flags.map((flag: any) => ({
                ...flag,
                createdAt: new Date(flag.createdAt),
                resolvedAt: flag.resolvedAt ? new Date(flag.resolvedAt) : undefined,
              }));
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
