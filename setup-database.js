#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Database Setup Guide');
console.log('=======================\n');

console.log('You need a PostgreSQL database to run this application.');
console.log('Here are your options:\n');

console.log('1. 🏠 Local PostgreSQL (Recommended for development):');
console.log('   - Install PostgreSQL on your machine');
console.log('   - Create a database named "meet_ai"');
console.log('   - Update DATABASE_URL in .env.local');
console.log('   - Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/meet_ai"\n');

console.log('2. ☁️  Cloud Database (Recommended for production):');
console.log('   - Neon (Free tier available): https://neon.tech');
console.log('   - Supabase (Free tier available): https://supabase.com');
console.log('   - Railway (Free tier available): https://railway.app');
console.log('   - Copy the connection string to DATABASE_URL\n');

console.log('3. 🐳 Docker (Alternative):');
console.log('   docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=meet_ai -p 5432:5432 -d postgres\n');

console.log('📝 Current .env.local configuration:');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
} else {
  console.log('❌ .env.local file not found');
}

console.log('\n🚀 After setting up your database:');
console.log('1. Update DATABASE_URL in .env.local with your actual connection string');
console.log('2. Run: npm run db:push');
console.log('3. Run: npm run dev');

console.log('\n💡 Quick Test:');
console.log('If you have PostgreSQL running locally with default settings, try:');
console.log('DATABASE_URL="postgresql://postgres:password@localhost:5432/meet_ai"'); 