#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envLocalPath = path.join(process.cwd(), '.env.local');

function updateOpenAIKey() {
  console.log('🔑 OpenAI API Key Setup');
  console.log('========================');
  console.log('');
  console.log('To fix the voice agent error, you need to set up a valid OpenAI API key.');
  console.log('');
  console.log('1. Go to https://platform.openai.com/api-keys');
  console.log('2. Create a new API key or copy an existing one');
  console.log('3. Enter it below (it will be saved to .env.local)');
  console.log('');

  rl.question('Enter your OpenAI API key: ', (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
      console.log('❌ No API key provided. Please run this script again with a valid key.');
      rl.close();
      return;
    }

    // Read existing .env.local file
    let envContent = '';
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, 'utf8');
    }

    // Update or add OPENAI_API_KEY
    const lines = envContent.split('\n');
    let keyFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('OPENAI_API_KEY=')) {
        lines[i] = `OPENAI_API_KEY="${apiKey.trim()}"`;
        keyFound = true;
        break;
      }
    }
    
    if (!keyFound) {
      lines.push(`OPENAI_API_KEY="${apiKey.trim()}"`);
    }

    // Write back to file
    fs.writeFileSync(envLocalPath, lines.join('\n'));
    
    console.log('');
    console.log('✅ OpenAI API key updated successfully!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Try the voice agent feature again');
    console.log('');
    console.log('💡 If you still have issues:');
    console.log('- Check that your API key is valid at https://platform.openai.com/api-keys');
    console.log('- Make sure you have credits in your OpenAI account');
    console.log('- Check the browser console for any additional error messages');
    
    rl.close();
  });
}

// Check if .env.local exists
if (!fs.existsSync(envLocalPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please run "node setup-env.js" first to create the environment file.');
  process.exit(1);
}

updateOpenAIKey(); 