// API configuration
const API_BASE_RAW = import.meta.env.VITE_API_BASE_URL || 'https://letterlink-api.vercel.app';
const API_BASE_NORMALIZED = API_BASE_RAW.endsWith('/') ? API_BASE_RAW.slice(0, -1) : API_BASE_RAW;

// Debug logging
console.log('API Base URL:', API_BASE_NORMALIZED);

export const API_CONFIG = {
  baseURL: API_BASE_NORMALIZED,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
    },
    profile: {
      status: '/api/profile/status',
      update: '/api/profile',
    },
  },
};

// Helper function to make API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  console.log('Login endpoint:', endpoint);
  console.log('Making API call to:', url);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    console.log('API response status:', response.status); // Debug log

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.message;
      
      // Handle validation errors that return an array
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.join(', ');
      }
      
      throw new Error(errorMessage || `API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API call error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
    throw error;
  }
};
