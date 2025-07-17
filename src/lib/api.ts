// API configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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
  
  console.log('Making API call to:', url); // Debug log
  
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
