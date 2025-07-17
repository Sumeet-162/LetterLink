// Test the API endpoints
const API_BASE = 'http://localhost:5000/api';

// Test basic API connection
async function testAPI() {
  try {
    const response = await fetch('http://localhost:5000/');
    const data = await response.json();
    console.log('API Root:', data);
  } catch (error) {
    console.error('API connection failed:', error);
  }
}

// Test auth endpoints
async function testAuth() {
  try {
    // Test registration
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration:', registerData);
    
    if (registerData.token) {
      // Test profile update
      const profileResponse = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${registerData.token}`
        },
        body: JSON.stringify({
          name: 'Test User',
          country: 'USA',
          timezone: 'America/New_York',
          bio: 'Test bio',
          interests: ['reading', 'writing', 'music']
        })
      });
      
      const profileData = await profileResponse.json();
      console.log('Profile Update:', profileData);
    }
  } catch (error) {
    console.error('Auth test failed:', error);
  }
}

// Run tests
testAPI();
testAuth();
