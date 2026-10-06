import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types/auth';
import { authService } from './authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    gradeLevel?: string;
  }) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPasswordWithToken: (email: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initial sync
    setUser(authService.getCurrentUser());
    setIsLoading(false);

    // Subscribe to session changes
    const unsubscribe = authService.subscribe(() => {
      setUser(authService.getCurrentUser());
    });

    const handleStorageEvent = () => {
      setUser(authService.getCurrentUser());
    };

    window.addEventListener('simulab_auth_change', handleStorageEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('simulab_auth_change', handleStorageEvent);
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const register = async (params: {
    name: string;
    email: string;
    password: string;
    gradeLevel?: string;
  }) => {
    const res = await authService.register(params);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    return authService.requestPasswordReset(email);
  };

  const resetPasswordWithToken = async (email: string, newPass: string) => {
    return authService.resetPasswordWithToken(email, newPass);
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    const updated = authService.updateProfile(updates);
    if (updated) {
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPasswordWithToken,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
