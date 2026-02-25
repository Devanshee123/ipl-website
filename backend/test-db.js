import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 MongoDB Connection Test\n');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

// Parse and display connection info (hide password)
const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@(.+)/);
if (match) {
  const [, username, password, rest] = match;
  console.log(`Username: ${username}`);
  console.log(`Password: ${'*'.repeat(password.length)} (${password.length} chars)`);
  console.log(`Host: ${rest.split('/')[0]}`);
  console.log(`Database: ${rest.split('/')[1]?.split('?')[0] || 'default'}\n`);
  
  // Check for special characters in password
  const specialChars = password.match(/[^a-zA-Z0-9]/g);
  if (specialChars) {
    console.log(`⚠️  Password contains special characters: ${[...new Set(specialChars)].join(', ')}`);
    console.log('   These need to be URL encoded!\n');
    
    // Show encoded password
    const encodedPassword = encodeURIComponent(password);
    console.log('🔧 Try this connection string:');
    console.log(`mongodb+srv://${username}:${encodedPassword}@${rest}\n`);
  }
}

console.log('🔌 Attempting to connect...\n');

mongoose.connect(uri)
  .then((conn) => {
    console.log('✅ SUCCESS! Connected to MongoDB');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ FAILED:', err.message);
    
    if (err.message.includes('bad auth')) {
      console.error('\n💡 Fix steps:');
      console.error('1. Go to MongoDB Atlas → Database Access');
      console.error('2. Check if user exists (create if missing)');
      console.error('3. Reset password if needed');
      console.error('4. If password has special chars, URL encode it:');
      console.error('   @ → %40, # → %23, % → %25, etc.\n');
    }
    
    if (err.message.includes('IP')) {
      console.error('\n💡 Go to MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0');
    }
    
    process.exit(1);
  });
