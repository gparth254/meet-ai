#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envTemplate = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/meet_ai"

# Authentication
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# GitHub OAuth (optional - for social login)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth (optional - for social login)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stream Video (required for calls)
NEXT_PUBLIC_STREAM_VIDEO_API_KEY=""
STREAM_VIDEO_SECRET_KEY=""

# OpenAI (required for AI features)
OPENAI_API_KEY=""
`;

const envPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Please check if all required variables are set.');
} else {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file with template variables');
  console.log('📝 Please update the values in .env.local with your actual credentials');
}

console.log('\n🔧 Required Environment Variables:');
console.log('1. DATABASE_URL - Your PostgreSQL database connection string');
console.log('2. NEXT_PUBLIC_STREAM_VIDEO_API_KEY - Stream Video API key');
console.log('3. STREAM_VIDEO_SECRET_KEY - Stream Video secret key');
console.log('4. OPENAI_API_KEY - OpenAI API key for AI features');
console.log('\n📚 Optional (for social login):');
console.log('5. GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET');
console.log('6. GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET');
console.log('\n🚀 After setting up .env.local, run: npm run dev'); 