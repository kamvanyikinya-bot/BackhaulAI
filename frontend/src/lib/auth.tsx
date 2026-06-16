import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, AuthState } from '../types';
import { mockUser } from './mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: mockUser, token: 'mock-token', isLoading: false });
  const login = useCallback(async () => { setState(s => ({ ...s, isLoading: true })); await new Promise(r => setTimeout(r, 500)); setState({ user: mockUser, token: 'mock-token', isLoading: false }); }, []);
  const signup = useCallback(async () => { setState(s => ({ ...s, isLoading: true })); await new Promise(r => setTimeout(r, 800)); setState({ user: mockUser, token: 'mock-token', isLoading: false }); }, []);
  const logout = useCallback(() => setState({ user: null, token: null, isLoading: false }), []);
  return <AuthContext.Provider value={{ ...state, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth error'); return ctx; }