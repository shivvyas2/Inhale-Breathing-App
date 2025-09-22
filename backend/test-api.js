const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Inhale Backend API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test streak update (with a test user ID)
    console.log('\n2. Testing streak update...');
    const testUserId = 'test_user_123';
    const sessionData = {
      sessionDuration: 120, // 2 minutes
      mood: 'Meditate',
      breathingPattern: {
        inhale: 4,
        hold1: 7,
        exhale: 8,
        hold2: 0
      }
    };

    const streakResponse = await fetch(`${API_BASE}/api/users/${testUserId}/streak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });

    if (streakResponse.ok) {
      const streakData = await streakResponse.json();
      console.log('✅ Streak update successful:', streakData);
    } else {
      const errorData = await streakResponse.json();
      console.log('❌ Streak update failed:', errorData);
    }

    // Test get user data
    console.log('\n3. Testing get user data...');
    const userResponse = await fetch(`${API_BASE}/api/users/${testUserId}`);
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Get user data successful:', userData);
    } else {
      const errorData = await userResponse.json();
      console.log('❌ Get user data failed:', errorData);
    }

    console.log('\n🎉 API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend && npm start');
  }
}

testAPI();
