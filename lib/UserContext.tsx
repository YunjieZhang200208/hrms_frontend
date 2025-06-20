'use client';

import { createContext, useContext } from 'react';

export type User = {
  id: string;
  role: 'admin' | 'manager' | 'employee';
  email: string;
  username: string;
  restaurant?: any;

  // Optional but defined in schema
  sin?: string;
  dob?: string;
  address?: string;
  level?: 'I' | 'II';
  baseRate: number;
  baseRateWithTips?: number;
  tipRate?: number;
};

const UserContext = createContext<User | null>(null);

export function useUser(): User | null {
  return useContext(UserContext);
}

export function UserProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: User;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
