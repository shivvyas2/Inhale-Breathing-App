// scripts/upload-music.js
// Script to upload music files to Supabase Storage and update the database

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // You'll need the service key for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Music files to upload (place these in a 'music-files' directory)
const musicFiles = [
  {
    name: 'Ocean Waves',
    filename: 'ocean-waves.mp3',
    category: 'breathing',
    mood: 'calm',
    duration_seconds: 300
  },
  {
    name: 'Forest Sounds',
    filename: 'forest-sounds.mp3',
    category: 'breathing',
    mood: 'peaceful',
    duration_seconds: 600
  },
  {
    name: 'Rain Drops',
    filename: 'rain-drops.mp3',
    category: 'breathing',
    mood: 'relaxing',
    duration_seconds: 480
  },
  {
    name: 'Tibetan Bowls',
    filename: 'tibetan-bowls.mp3',
    category: 'meditation',
    mood: 'spiritual',
    duration_seconds: 720
  },
  {
    name: 'White Noise',
    filename: 'white-noise.mp3',
    category: 'breathing',
    mood: 'focused',
    duration_seconds: 1800
  }
];

async function uploadMusicFiles() {
  console.log('Starting music upload process...');
  
  for (const music of musicFiles) {
    try {
      const filePath = path.join(__dirname, 'music-files', music.filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${music.filename}`);
        continue;
      }
      
      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('music')
        .upload(`music/${music.filename}`, fileBuffer, {
          contentType: 'audio/mpeg',
          upsert: true
        });
      
      if (uploadError) {
        console.error(`❌ Upload error for ${music.filename}:`, uploadError);
        continue;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('music')
        .getPublicUrl(`music/${music.filename}`);
      
      // Insert or update in database
      const { error: dbError } = await supabase
        .from('music')
        .upsert({
          name: music.name,
          file_path: `music/${music.filename}`,
          file_url: urlData.publicUrl,
          duration_seconds: music.duration_seconds,
          category: music.category,
          mood: music.mood,
          is_active: true
        });
      
      if (dbError) {
        console.error(`❌ Database error for ${music.name}:`, dbError);
        continue;
      }
      
      console.log(`✅ Successfully uploaded: ${music.name}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${music.name}:`, error);
    }
  }
  
  console.log('Music upload process completed!');
}

// Run the upload
uploadMusicFiles().catch(console.error);
