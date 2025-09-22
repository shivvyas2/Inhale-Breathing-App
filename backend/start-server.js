#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Inhale Backend Server...');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Please create one based on env.example');
  console.log('📝 Copy env.example to .env and fill in your Supabase credentials');
  process.exit(1);
}

// Start the server
const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
  process.exit(0);
});
