import { create } from 'zustand';
import type { User } from '@/types/user';
import { usersApi } from '@/lib/api/users';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  } | null;
  loadUsers: (page?: number, pageSize?: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  meta: null,

  loadUsers: async (page: number = 1, pageSize: number = 10) => {
    set({ loading: true, error: null });

    try {
      const response = await usersApi.getUsers(page, pageSize);
      set({
        users: response.data.users,
        loading: false,
        error: null,
        meta: response.data.meta,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar usuarios',
      });
    }
  },

  refreshUsers: async () => {
    const currentState = get();
    const currentPage = currentState.meta?.page || 1;
    const currentPageSize = currentState.meta?.page_size || 10;
    await get().loadUsers(currentPage, currentPageSize);
  },
}));
