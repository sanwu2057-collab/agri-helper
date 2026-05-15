import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, User } from '@/types/auth';
import { AuthService } from '@/services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'farmer' | 'expert') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initAuth = async () => {
      const user = await AuthService.getCurrentUser();
      const isAuthenticated = AuthService.isAuthenticated();
      setState({
        user,
        isAuthenticated,
        isLoading: false,
        error: null,
      });
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await AuthService.login({ email, password });
    if (result.success && result.user) {
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        token: result.token,
      });
    } else {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: result.error || 'Login failed',
      });
      throw new Error(result.error);
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'farmer' | 'expert') => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await AuthService.signup({ email, password, name, role });
    if (result.success && result.user) {
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        token: result.token,
      });
    } else {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: result.error || 'Signup failed',
      });
      throw new Error(result.error);
    }
  };

  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await AuthService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
