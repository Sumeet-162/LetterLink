// Authentication utility functions

export interface AuthTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Get current user ID from JWT token
 */
export const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    // Decode JWT payload (no verification needed on frontend)
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded: AuthTokenPayload = JSON.parse(jsonPayload);
    return decoded.userId || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    // Check if token is expired
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded: AuthTokenPayload = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false;
    }
    
    return !!decoded.userId;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Get authentication headers for API calls
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};
