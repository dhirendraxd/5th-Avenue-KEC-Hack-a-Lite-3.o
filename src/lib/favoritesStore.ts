import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  addFavorite: (equipmentId: string) => void;
  removeFavorite: (equipmentId: string) => void;
  toggleFavorite: (equipmentId: string) => void;
  isFavorite: (equipmentId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (equipmentId) =>
        set((state) => ({
          favorites: [...state.favorites, equipmentId],
        })),
      removeFavorite: (equipmentId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== equipmentId),
        })),
      toggleFavorite: (equipmentId) => {
        const isFav = get().favorites.includes(equipmentId);
        if (isFav) {
          get().removeFavorite(equipmentId);
        } else {
          get().addFavorite(equipmentId);
        }
      },
      isFavorite: (equipmentId) => get().favorites.includes(equipmentId),
    }),
    {
      name: 'gearshift-favorites',
    }
  )
);
