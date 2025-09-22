// Test script for streak functionality
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://mkumjzxgocrfmpgxnpmn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdW1qenhnb2NyZm1wZ3hucG1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE0NTgxNiwiZXhwIjoyMDczNzIxODE2fQ.YourServiceRoleKeyHere';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStreakFunctionality() {
  console.log('🧪 Testing Streak Functionality...\n');

  try {
    // Test 1: Check if set_config function exists
    console.log('1. Testing set_config function...');
    const { data: configData, error: configError } = await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: 'test-user-123'
    });
    
    if (configError) {
      console.log('❌ set_config function not found or not working:', configError.message);
      console.log('   This is expected if the database migration hasn\'t been run yet.\n');
    } else {
      console.log('✅ set_config function working\n');
    }

    // Test 2: Check if users table has new columns
    console.log('2. Testing users table schema...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, current_mood, current_activity, breathing_pattern')
      .limit(1);
    
    if (userError) {
      console.log('❌ Users table missing new columns:', userError.message);
      console.log('   Run the database migration to add these columns.\n');
    } else {
      console.log('✅ Users table has new columns\n');
    }

    // Test 3: Check if streaks table exists
    console.log('3. Testing streaks table...');
    const { data: streakData, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .limit(1);
    
    if (streakError) {
      console.log('❌ Streaks table error:', streakError.message);
    } else {
      console.log('✅ Streaks table accessible\n');
    }

    // Test 4: Check if get_user_streak function exists
    console.log('4. Testing get_user_streak function...');
    const { data: streakFunctionData, error: streakFunctionError } = await supabase.rpc('get_user_streak', {
      user_id_param: 'test-user-123'
    });
    
    if (streakFunctionError) {
      console.log('❌ get_user_streak function not found:', streakFunctionError.message);
      console.log('   This function is created by the database migration.\n');
    } else {
      console.log('✅ get_user_streak function working, returned:', streakFunctionData);
    }

    console.log('\n📋 Summary:');
    console.log('- If you see ❌ errors, run the database migration in Supabase dashboard');
    console.log('- Copy the contents of backend/fix-database-schema.sql');
    console.log('- Paste and run it in the Supabase SQL Editor');
    console.log('- Then run this test again to verify everything works');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStreakFunctionality();
