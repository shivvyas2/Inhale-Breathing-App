const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test music generation API
async function testMusicGeneration() {
  console.log('🎵 Testing Lyria Music Generation API...\n');

  try {
    // Test 1: Generate music for Anxiety Relief
    console.log('1. Testing Anxiety Relief music generation...');
    const anxietyResponse = await axios.post(`${BASE_URL}/api/music/generate`, {
      mood: 'Anxiety Relief',
      bpm: 80,
      instruments: ['Soft Pads', 'Ocean Waves'],
      breathingPattern: { inhale: 4, hold1: 4, exhale: 6, hold2: 2 },
      duration: 30
    });

    console.log('✅ Anxiety Relief music generated:');
    console.log('   Session ID:', anxietyResponse.data.sessionId);
    console.log('   Mood:', anxietyResponse.data.music.mood);
    console.log('   BPM:', anxietyResponse.data.music.bpm);
    console.log('   Instruments:', anxietyResponse.data.music.instruments);
    console.log('   Audio File:', anxietyResponse.data.music.audio_file.filename);
    console.log('   Prompts:', anxietyResponse.data.music.prompts);
    console.log('');

    const sessionId = anxietyResponse.data.sessionId;

    // Test 2: Get session status
    console.log('2. Testing session status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/music/session/${sessionId}`);
    console.log('✅ Session status:', statusResponse.data.session.status);
    console.log('   Audio chunks:', statusResponse.data.session.audioChunksCount);
    console.log('');

    // Test 3: Update session parameters
    console.log('3. Testing session update...');
    const updateResponse = await axios.put(`${BASE_URL}/api/music/session/${sessionId}`, {
      bpm: 100,
      instruments: ['Warm Synths', 'Gentle Piano']
    });
    console.log('✅ Session updated:');
    console.log('   New BPM:', updateResponse.data.session.params.bpm);
    console.log('   New Instruments:', updateResponse.data.session.params.instruments);
    console.log('');

    // Test 4: Get audio chunks
    console.log('4. Testing audio chunks...');
    const chunksResponse = await axios.get(`${BASE_URL}/api/music/session/${sessionId}/chunks?limit=5`);
    console.log('✅ Audio chunks retrieved:');
    console.log('   Total chunks:', chunksResponse.data.total);
    console.log('   Recent chunks:', chunksResponse.data.chunks.length);
    console.log('');

    // Test 5: Get suggested prompts
    console.log('5. Testing prompt suggestions...');
    const promptsResponse = await axios.post(`${BASE_URL}/api/music/prompts`, {
      mood: 'Meditate',
      instruments: ['Singing Bowls', 'Harmonic Drones']
    });
    console.log('✅ Prompts suggested:');
    promptsResponse.data.prompts.forEach((prompt, index) => {
      console.log(`   ${index + 1}. ${prompt.text} (weight: ${prompt.weight})`);
    });
    console.log('');

    // Test 6: Get all sessions
    console.log('6. Testing all sessions...');
    const sessionsResponse = await axios.get(`${BASE_URL}/api/music/sessions`);
    console.log('✅ All sessions:');
    console.log('   Count:', sessionsResponse.data.count);
    sessionsResponse.data.sessions.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.id} - ${session.status} - ${session.params.mood}`);
    });
    console.log('');

    // Test 7: Stop session
    console.log('7. Testing session stop...');
    const stopResponse = await axios.post(`${BASE_URL}/api/music/session/${sessionId}/stop`);
    console.log('✅ Session stopped:', stopResponse.data.session.status);
    console.log('');

    // Test 8: Clean up session
    console.log('8. Testing session cleanup...');
    const cleanupResponse = await axios.delete(`${BASE_URL}/api/music/session/${sessionId}`);
    console.log('✅ Session cleaned up:', cleanupResponse.data.message);
    console.log('');

    console.log('🎉 All tests passed! Lyria Music API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test different moods
async function testDifferentMoods() {
  console.log('🎵 Testing different moods...\n');

  const moods = [
    { mood: 'Meditate', bpm: 60, instruments: ['Singing Bowls', 'Soft Bells'] },
    { mood: 'Wind Down', bpm: 70, instruments: ['Warm Synths', 'Nature Sounds'] },
    { mood: 'Focus', bpm: 90, instruments: ['Steady Rhythms', 'Atmospheric Pads'] }
  ];

  for (const moodConfig of moods) {
    try {
      console.log(`Testing ${moodConfig.mood}...`);
      const response = await axios.post(`${BASE_URL}/api/music/generate`, {
        ...moodConfig,
        duration: 15
      });

      console.log(`✅ ${moodConfig.mood} music generated:`);
      console.log(`   Session: ${response.data.sessionId}`);
      console.log(`   BPM: ${response.data.music.bpm}`);
      console.log(`   Prompts: ${response.data.music.prompts.length} prompts`);
      console.log('');

      // Clean up
      await axios.delete(`${BASE_URL}/api/music/session/${response.data.sessionId}`);

    } catch (error) {
      console.error(`❌ Failed to test ${moodConfig.mood}:`, error.response?.data || error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Lyria Music API Tests\n');
  console.log('Make sure the backend server is running on http://localhost:3000\n');

  await testMusicGeneration();
  console.log('\n' + '='.repeat(50) + '\n');
  await testDifferentMoods();

  console.log('\n🎉 All tests completed!');
}

// Check if axios is available
try {
  require('axios');
  runTests();
} catch (error) {
  console.log('Installing axios for testing...');
  const { exec } = require('child_process');
  exec('npm install axios', (err, stdout, stderr) => {
    if (err) {
      console.error('Failed to install axios:', err);
      return;
    }
    console.log('Axios installed. Please run the test again.');
  });
}
