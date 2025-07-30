import { getAuthHeaders } from '@/utils/auth';

// Use environment variable for API base URL with fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://letterlink-api.vercel.app/api';

// Auth API calls
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('authToken', data.token); // Store both for compatibility
      console.log('Login successful, token stored');
    }
    return data;
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('authToken', data.token);
      console.log('Registration successful, token stored');
    }
    return data;
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    const userData = await response.json();
    console.log('Current user data fetched:', userData);
    return userData;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user'); // Clean up any old user data
    console.log('User logged out, localStorage cleared');
  }
};

// Profile API calls
export const profileAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get profile');
    }
    
    return response.json();
  },

  updateProfile: async (profileData: {
    name: string;
    country: string;
    timezone?: string;
    bio?: string;
    interests: string[];
  }) => {
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return response.json();
  },

  checkProfileStatus: async () => {
    const response = await fetch(`${API_BASE}/profile/status`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to check profile status');
    }
    
    return response.json();
  }
};

// Friends API calls
export const friendsAPI = {
  getFriends: async () => {
    const response = await fetch(`${API_BASE}/friends`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get friends');
    }
    
    return response.json();
  },

  searchUsers: async (query: string) => {
    console.log('API: Searching for:', query);
    const url = `${API_BASE}/friends/search?q=${encodeURIComponent(query)}`;
    console.log('API: Request URL:', url);
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    console.log('API: Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Error response:', errorText);
      throw new Error(`Failed to search users: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API: Response data:', data);
    return data;
  },

  getFriendDetails: async (friendId: string) => {
    const response = await fetch(`${API_BASE}/friends/${friendId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get friend details');
    }
    
    return response.json();
  },

  getFriendTimeWeather: async (friendId: string) => {
    const response = await fetch(`${API_BASE}/friends/${friendId}/time-weather`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get friend time/weather');
    }
    
    return response.json();
  },

  addFriend: async (friendId: string) => {
    const response = await fetch(`${API_BASE}/friends`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ friendId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add friend');
    }
    
    return response.json();
  },

  // Send friend request with letter
  sendFriendRequest: async (requestData: {
    recipientId: string;
    subject: string;
    content: string;
  }) => {
    const response = await fetch(`${API_BASE}/friends/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send friend request: ${response.status} ${errorText}`);
    }
    
    return response.json();
  },

  // Get pending friend requests
  getFriendRequests: async () => {
    const response = await fetch(`${API_BASE}/friends/requests`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get friend requests');
    }
    
    return response.json();
  },

  // Accept friend request
  acceptFriendRequest: async (requestId: string) => {
    const response = await fetch(`${API_BASE}/friends/requests/${requestId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to accept friend request');
    }
    
    return response.json();
  },

  // Reject friend request
  rejectFriendRequest: async (requestId: string) => {
    const response = await fetch(`${API_BASE}/friends/requests/${requestId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject friend request');
    }
    
    return response.json();
  }
};

// Letters API calls
export const lettersAPI = {
  getInbox: async () => {
    const response = await fetch(`${API_BASE}/letters/inbox`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get inbox');
    }
    
    return response.json();
  },

  getSentLetters: async () => {
    const response = await fetch(`${API_BASE}/letters/sent`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get sent letters');
    }
    
    return response.json();
  },

  getLetterById: async (letterId: string) => {
    const response = await fetch(`${API_BASE}/letters/${letterId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get letter');
    }
    
    return response.json();
  },

  sendLetter: async (letterData: {
    recipientId: string;
    subject: string;
    content: string;
    deliveryDelay?: number;
  }) => {
    const response = await fetch(`${API_BASE}/letters`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(letterData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send letter');
    }
    
    return response.json();
  },

  replyToLetter: async (replyData: {
    letterId: string;
    subject: string;
    content: string;
    deliveryDelay?: number;
  }) => {
    console.log('API: Sending reply request to:', `${API_BASE}/letters/reply`);
    console.log('API: Request data:', replyData);
    
    const response = await fetch(`${API_BASE}/letters/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(replyData)
    });
    
    console.log('API: Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Error response:', errorText);
      throw new Error(`Failed to reply to letter: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Success response:', result);
    return result;
  },

  getConversation: async (friendId: string) => {
    const response = await fetch(`${API_BASE}/letters/conversation/${friendId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get conversation');
    }
    
    return response.json();
  },

  // Get matched recipients preview based on targeting preferences
  getMatchedRecipients: async (preferences: {
    region?: string;
    countries?: string[];
    ageGroup?: string;
    gender?: string;
    interests?: string[];
    languages?: string[];
    relationshipStatus?: string;
    writingStyle?: string;
  } = {}) => {
    const params = new URLSearchParams();
    
    if (preferences.region) params.append('region', preferences.region);
    if (preferences.countries) params.append('countries', preferences.countries.join(','));
    if (preferences.ageGroup) params.append('ageGroup', preferences.ageGroup);
    if (preferences.gender) params.append('gender', preferences.gender);
    if (preferences.interests) params.append('interests', preferences.interests.join(','));
    if (preferences.languages) params.append('languages', preferences.languages.join(','));
    if (preferences.relationshipStatus) params.append('relationshipStatus', preferences.relationshipStatus);
    if (preferences.writingStyle) params.append('writingStyle', preferences.writingStyle);
    
    const response = await fetch(`${API_BASE}/letters/matched-recipients?${params}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get matched recipients');
    }
    
    return response.json();
  },

  // Mark letter as read
  markLetterAsRead: async (letterId: string) => {
    const response = await fetch(`${API_BASE}/letters/${letterId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark letter as read');
    }
    
    return response.json();
  },
  
  // Send random match letter with targeting preferences
  sendRandomMatchLetter: async (letterData: {
    subject: string;
    content: string;
    preferences?: {
      region?: string;
      countries?: string[];
      ageGroup?: string;
      gender?: string;
      interests?: string[];
      languages?: string[];
      relationshipStatus?: string;
      writingStyle?: string;
    };
  }) => {
    console.log('Sending random match letter to:', `${API_BASE}/letters/random-match`);
    console.log('Headers:', getAuthHeaders());
    console.log('Data:', letterData);
    
    const response = await fetch(`${API_BASE}/letters/random-match`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(letterData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to send random match letter: ${response.status} ${errorText}`);
    }
    
    return response.json();
  },

  // Get pending friend letters (delivered letters waiting for accept/reject)
  getPendingFriendLetters: async () => {
    const response = await fetch(`${API_BASE}/letters/pending-friend-letters`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get pending friend letters');
    }
    
    return response.json();
  },

  // Accept a friend letter
  acceptFriendLetter: async (letterId: string) => {
    const response = await fetch(`${API_BASE}/letters/${letterId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to accept friend letter');
    }
    
    return response.json();
  },

  // Reject a friend letter
  rejectFriendLetter: async (letterId: string) => {
    const response = await fetch(`${API_BASE}/letters/${letterId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject friend letter');
    }
    
    return response.json();
  }
};

// Drafts API calls
export const draftsAPI = {
  getDrafts: async () => {
    const response = await fetch(`${API_BASE}/drafts`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get drafts');
    }
    
    return response.json();
  },

  getDraftById: async (draftId: string) => {
    const response = await fetch(`${API_BASE}/drafts/${draftId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get draft');
    }
    
    return response.json();
  },

  createDraft: async (draftData: {
    recipientId: string;
    subject: string;
    content: string;
    type?: 'letter' | 'reply';
    replyTo?: string;
    deliveryDelay?: number;
  }) => {
    const response = await fetch(`${API_BASE}/drafts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(draftData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create draft');
    }
    
    return response.json();
  },

  updateDraft: async (draftId: string, draftData: {
    subject?: string;
    content?: string;
    deliveryDelay?: number;
  }) => {
    const response = await fetch(`${API_BASE}/drafts/${draftId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(draftData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update draft');
    }
    
    return response.json();
  },

  deleteDraft: async (draftId: string) => {
    const response = await fetch(`${API_BASE}/drafts/${draftId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete draft');
    }
    
    return response.json();
  },

  getDraftStats: async () => {
    const response = await fetch(`${API_BASE}/drafts/stats`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get draft stats');
    }
    
    return response.json();
  },

  sendDraft: async (draftId: string) => {
    const response = await fetch(`${API_BASE}/drafts/${draftId}/send`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to send draft');
    }
    
    return response.json();
  }
};

// Letter cycle API calls
export const letterCycleAPI = {
  getNextCycleInfo: async () => {
    const response = await fetch(`${API_BASE}/letters/cycle/next`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get cycle information');
    }
    
    return response.json();
  },

  triggerCycle: async () => {
    const response = await fetch(`${API_BASE}/letters/cycle/trigger`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to trigger cycle');
    }
    
    return response.json();
  },

  getArchivedLetters: async () => {
    const response = await fetch(`${API_BASE}/letters/archived`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get archived letters');
    }
    
    return response.json();
  }
};

// Main API object combining all APIs
export const api = {
  // Auth methods
  ...authAPI,
  
  // Profile methods
  getProfile: profileAPI.getProfile,
  updateProfile: profileAPI.updateProfile,
  checkProfileStatus: profileAPI.checkProfileStatus,
  
  // Friends methods
  getFriends: friendsAPI.getFriends,
  searchUsers: friendsAPI.searchUsers,
  getFriendDetails: friendsAPI.getFriendDetails,
  getFriendTimeWeather: friendsAPI.getFriendTimeWeather,
  addFriend: friendsAPI.addFriend,
  sendFriendRequest: friendsAPI.sendFriendRequest,
  getFriendRequests: friendsAPI.getFriendRequests,
  acceptFriendRequest: friendsAPI.acceptFriendRequest,
  rejectFriendRequest: friendsAPI.rejectFriendRequest,
  
  // Letters methods
  getInboxLetters: lettersAPI.getInbox,
  getSentLetters: lettersAPI.getSentLetters,
  getLetterById: lettersAPI.getLetterById,
  sendLetter: lettersAPI.sendLetter,
  replyToLetter: lettersAPI.replyToLetter,
  getConversation: lettersAPI.getConversation,
  getMatchedRecipients: lettersAPI.getMatchedRecipients,
  
  // Friend letter methods
  getPendingFriendLetters: lettersAPI.getPendingFriendLetters,
  acceptFriendLetter: lettersAPI.acceptFriendLetter,
  rejectFriendLetter: lettersAPI.rejectFriendLetter,
  
  // Mark letter as read
  markLetterAsRead: async (letterId: string) => {
    const response = await fetch(`${API_BASE}/letters/${letterId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark letter as read');
    }
    
    return response.json();
  },
  
  // Send random match letter
  sendRandomMatchLetter: async (letterData: {
    subject: string;
    content: string;
    interests: string[];
  }) => {
    const response = await fetch(`${API_BASE}/letters/random-match`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(letterData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send random match letter');
    }
    
    return response.json();
  },
  
  // Drafts methods
  getDrafts: draftsAPI.getDrafts,
  getDraftById: draftsAPI.getDraftById,
  createDraft: draftsAPI.createDraft,
  updateDraft: draftsAPI.updateDraft,
  deleteDraft: draftsAPI.deleteDraft,
  sendDraft: draftsAPI.sendDraft,
  getDraftStats: draftsAPI.getDraftStats,
  
  // Letter cycle methods
  getNextCycleInfo: letterCycleAPI.getNextCycleInfo,
  triggerCycle: letterCycleAPI.triggerCycle,
  getArchivedLetters: letterCycleAPI.getArchivedLetters,
  
  // Incoming letters methods (letters in transit)
  getInTransitLetters: async () => {
    console.log('🔍 Fetching incoming letters...');
    const response = await fetch(`${API_BASE}/letters/incoming`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch incoming letters:', response.status, response.statusText);
      throw new Error('Failed to fetch incoming letters');
    }
    
    const letters = await response.json();
    console.log('📬 Incoming letters received:', letters);
    return { inTransitLetters: letters }; // Wrap in expected format for compatibility
  },
  
  processReadyLetters: async () => {
    const response = await fetch(`${API_BASE}/letters/deliver-scheduled`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to process ready letters');
    }
    
    return response.json();
  },
  
  deliverLetter: async (letterId: string) => {
    const response = await fetch(`${API_BASE}/in-transit/deliver/${letterId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to deliver letter');
    }
    
    return response.json();
  },
  
  getDeliveryStats: async () => {
    const response = await fetch(`${API_BASE}/in-transit/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch delivery stats');
    }
    
    return response.json();
  }
};
