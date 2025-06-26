# Meet AI Setup Guide

## 🔧 Quick Fix for Authentication Issues

The "You must be logged in to access this resource" error occurs because the application is missing required environment variables.

### Step 1: Set up Environment Variables

Run the setup script to create the environment file:

```bash
npm run setup
```

This will create a `.env.local` file with template variables.

### Step 2: Configure Required Variables

Edit the `.env.local` file and add your actual credentials:

#### Required Variables:
1. **DATABASE_URL** - Your PostgreSQL database connection string
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/meet_ai"
   ```

2. **NEXT_PUBLIC_STREAM_VIDEO_API_KEY** - Stream Video API key
   - Get from: https://dashboard.stream.io/

3. **STREAM_VIDEO_SECRET_KEY** - Stream Video secret key
   - Get from: https://dashboard.stream.io/

4. **OPENAI_API_KEY** - OpenAI API key for AI features
   - Get from: https://platform.openai.com/api-keys

#### Optional Variables (for social login):
5. **GITHUB_CLIENT_ID** & **GITHUB_CLIENT_SECRET**
6. **GOOGLE_CLIENT_ID** & **GOOGLE_CLIENT_SECRET**

### Step 3: Set up Database

1. Create a PostgreSQL database
2. Update the DATABASE_URL in `.env.local`
3. Run database migrations:
   ```bash
   npm run db:push
   ```

### Step 4: Start the Application

```bash
npm run dev
```

## 🐛 Common Issues & Solutions

### Issue: "You must be logged in to access this resource"
**Solution**: This happens when environment variables are missing. Follow the setup steps above.

### Issue: Agents not showing up
**Solution**: 
1. Make sure you're logged in
2. Check that DATABASE_URL is correct
3. Run `npm run db:push` to ensure database tables exist
4. Create your first agent through the UI

### Issue: Call not connecting
**Solution**:
1. Verify STREAM_VIDEO_API_KEY and STREAM_VIDEO_SECRET_KEY are set
2. Check browser console for any errors
3. Ensure microphone/camera permissions are granted

### Issue: Authentication not working
**Solution**:
1. Clear browser cookies and local storage
2. Restart the development server
3. Try signing up with a new account

## 🔍 Debugging

To debug authentication issues:

1. Open browser developer tools
2. Check the Console tab for error messages
3. Check the Network tab for failed API requests
4. Look for TRPC context errors in the server logs

## 📞 Support

If you're still having issues:
1. Check that all environment variables are set correctly
2. Ensure the database is running and accessible
3. Verify that all required services (Stream Video, OpenAI) are properly configured 