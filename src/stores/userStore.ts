import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

export interface User {
  id?: string;
  email: string;
  password: string;
  name: string;
  token?: string;
}

interface UserState {
  userData: User;
  setUserData: (userData: User) => void;
  updateUserData:(newUserData:User) => void;
  removeUserData: () => void;
  getUserData: () => User;
}

type MyPersist = (
  config: (set: any, get: any, api: any) => UserState,
  options: PersistOptions<UserState>
) => (set: any, get: any, api: any) => UserState;

export const useUserStore = create<UserState>(
  (persist as MyPersist)(
    (set, get) => ({
      userData: { id: '', email: '', password: '', name: '', token: '' },
      setUserData: (userData) => set({ userData }),
      updateUserData: (newUserData) => set((state: UserState) => ({
        userData: { ...state.userData, ...newUserData }
      })),
      removeUserData: () => set({ userData: { id: '', email: '', password: '', name: '', token: '' } }),
      getUserData: () => get().userData,

    }),
    {
      name: 'user-storage', // unique name
      storage: createJSONStorage(() => localStorage), // use `localStorage` as storage
    }
  )
);


