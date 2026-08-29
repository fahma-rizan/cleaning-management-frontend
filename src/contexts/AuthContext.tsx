import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthTokens, tokenStorage, authApi, jwtUtils } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const tokens = tokenStorage.getTokens();

      if (tokens && tokenStorage.isAuthenticated()) {
        // Try to get user from valid access token
        const userFromToken = jwtUtils.getUserFromToken(tokens.accessToken);
        if (userFromToken) {
          setUser(userFromToken);
          setIsLoading(false);
          return;
        }
      }

      // If no valid token, try to refresh
      if (tokens?.refreshToken) {
        const refreshed = await authApi.refreshAccessToken();
        if (refreshed) {
          const newTokens = tokenStorage.getTokens();
          if (newTokens) {
            const userFromToken = jwtUtils.getUserFromToken(newTokens.accessToken);
            if (userFromToken) {
              setUser(userFromToken);
              setIsLoading(false);
              return;
            }
          }
        }
      }

      // No valid auth found
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      const accessToken = tokenStorage.getAccessToken();
      if (accessToken && jwtUtils.isTokenExpired(accessToken)) {
        await authApi.refreshAccessToken();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authApi.login(email, password);
      if (result) {
        setUser(result.user);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    return await authApi.refreshAccessToken();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && tokenStorage.isAuthenticated(),
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};