/**
 * APPLICATION - MEMBERS STORE
 */

import { create } from 'zustand';
import type { Member } from '@domain/members/types';

export interface MemberStoreState {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  setMembers: (members: Member[]) => void;
  updateMember: (memberId: string, member: Member) => void;
  removeMember: (memberId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  members: [],
  isLoading: false,
  error: null,
};

export const useMemberStore = create<MemberStoreState>((set) => ({
  ...initialState,
  setMembers: (members) => set({ members }),
  updateMember: (memberId, member) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === memberId ? member : m)),
    })),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
