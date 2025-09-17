// scripts/cleanup-firebase.js
// Script to remove Firebase dependencies and files

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting Firebase cleanup...');

// Files to remove
const filesToRemove = [
  'firebase.js',
  'android/app/google-services.json',
  'ios/GoogleService-Info.plist'
];

// Directories to clean up
const dirsToClean = [
  'android/app/src/main/java/com/yourcompany/inhale/firebase',
  'ios/firebase'
];

// Remove files
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
    } catch (error) {
      console.log(`⚠️  Could not remove ${file}:`, error.message);
    }
  } else {
    console.log(`ℹ️  File not found: ${file}`);
  }
});

// Remove directories
dirsToClean.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed directory: ${dir}`);
    } catch (error) {
      console.log(`⚠️  Could not remove directory ${dir}:`, error.message);
    }
  } else {
    console.log(`ℹ️  Directory not found: ${dir}`);
  }
});

console.log('🧹 Firebase cleanup completed!');
console.log('📝 Next steps:');
console.log('1. Run: npm uninstall firebase @react-native-firebase/app');
console.log('2. Update your .env file with Supabase credentials');
console.log('3. Run: npm install @supabase/supabase-js');
console.log('4. Test your app with the new Supabase setup');
