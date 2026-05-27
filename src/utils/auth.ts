import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  verified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// JWT utilities
export const jwtUtils = {
  // Decode token without verification (for client-side checks)
  decodeToken: (token: string): DecodedToken | null => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired: (token: string): boolean => {
    const decoded = jwtUtils.decodeToken(token);
    if (!decoded) return true;

    // Add 30 second buffer before expiration
    return decoded.exp * 1000 < Date.now() + 30000;
  },

    getUserFromToken: (token: string): Partial<User> | null => {
    const decoded = jwtUtils.decodeToken(token);
    if (!decoded) return null;

    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as User['role'],
    };
  },
};

// Token storage utilities
export const tokenStorage = {
  // Store tokens
  setTokens: (tokens: AuthTokens): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  // Get stored tokens
  getTokens: (): AuthTokens | null => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) return null;

    return { accessToken, refreshToken };
  },

  // Get access token
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Clear all tokens
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) return false;

    return !jwtUtils.isTokenExpired(accessToken);
  },
};

// This variable will hold the promise for an in-flight token refresh.
// This prevents a "race condition" where multiple failed API calls all try to refresh the token at once.
let refreshTokenPromise: Promise<boolean> | null = null;

// API utilities with automatic token refresh
export const authApi = {
 // Base API call with automatic token refresh
  async apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = tokenStorage.getAccessToken();

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}${endpoint}`, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      const refreshed = await authApi.refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        const newAccessToken = tokenStorage.getAccessToken();
        if (newAccessToken) {
          headers.set('Authorization', `Bearer ${newAccessToken}`);
        } else {
          headers.delete('Authorization');
        }
        
        return fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}${endpoint}`, {
          ...options,
          headers,
        });
      }
    }

    return response;
  },
      

  // Refresh access token
    // Refresh access token, preventing race conditions.
  async refreshAccessToken(): Promise<boolean> {
    // If a refresh is already in progress, wait for it to complete.
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    // Start a new refresh request and store the promise.
    refreshTokenPromise = (async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          tokenStorage.setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
          });
          return true;
        }

        // If the refresh token is invalid or expired, the server should return an error.
        // In this case, we clear all tokens to force the user to log in again.
        throw new Error('Token refresh failed');
      } catch (error) {
        console.error('Token refresh failed:', error);
        tokenStorage.clearTokens();
        // You might want to trigger a redirect to the login page here
        // For example: window.location.href = '/login';
        return false;
      } finally {
        // Once the refresh attempt is complete (success or fail), reset the promise
        // to allow for future refresh attempts.
        refreshTokenPromise = null;
      }
    })();

    return refreshTokenPromise;
  },

  // Login
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens } | null> {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        tokenStorage.setTokens(data.tokens);
        return { user: data.user, tokens: data.tokens };
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
    return null;
  },

  // Logout
    async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        // Inform the backend to invalidate the refresh token
        await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
        // No need to wait for the response or check if it's ok.
        // The client should clear its tokens regardless.
      } catch (error) {
        // Log the error but proceed with clearing tokens,
        // as the user's intent is to log out.
        console.error('Logout API call failed:', error);
      }
    }

    // Always clear tokens from storage on logout
    tokenStorage.clearTokens();
  },
};
