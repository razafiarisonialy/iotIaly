import type { StateCreator } from 'zustand';
export type StoreSlice<T> = StateCreator<any, [], [], T>;
