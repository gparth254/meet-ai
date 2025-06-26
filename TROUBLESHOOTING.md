# Troubleshooting Guide

## 🔧 Quick Fixes

### 1. "You must be logged in to access this resource" Error

**Problem**: Authentication error when accessing protected routes.

**Solutions**:
1. **Check Environment Variables**:
   ```bash
   npm run setup
   ```
   Then edit `.env.local` and add your credentials.

2. **Clear Browser Data**:
   - Clear cookies and local storage
   - Try incognito/private mode

3. **Restart Development Server**:
   ```bash
   npm run dev
   ```

### 2. Agents Not Showing Up

**Problem**: Agents list is empty or not loading.

**Solutions**:
1. **Check Database Connection**:
   - Verify `DATABASE_URL` in `.env.local`
   - Run database migrations:
     ```bash
     npm run db:push
     ```

2. **Create Your First Agent**:
   - Go to `/agents` page
   - Click "Create Agent"
   - Fill in the required fields

3. **Check Console for Errors**:
   - Open browser developer tools
   - Look for TRPC or database errors

### 3. Call Not Connecting

**Problem**: Video calls fail to connect or show errors.

**Solutions**:
1. **Check Stream Video Configuration**:
   - Verify `NEXT_PUBLIC_STREAM_VIDEO_API_KEY`
   - Verify `STREAM_VIDEO_SECRET_KEY`
   - Get keys from: https://dashboard.stream.io/

2. **Browser Permissions**:
   - Allow microphone and camera access
   - Check browser console for permission errors

3. **Network Issues**:
   - Check internet connection
   - Try refreshing the page

### 4. Database Connection Issues

**Problem**: Database-related errors or missing data.

**Solutions**:
1. **Verify Database URL**:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database"
   ```

2. **Run Migrations**:
   ```bash
   npm run db:push
   ```

3. **Check Database Status**:
   - Ensure PostgreSQL is running
   - Verify database exists
   - Check user permissions

## 🐛 Common Error Messages

### "DATABASE_URL environment variable is not set"
- Add `DATABASE_URL` to your `.env.local` file
- Restart the development server

### "Failed to create Stream Video client"
- Check `NEXT_PUBLIC_STREAM_VIDEO_API_KEY` is set
- Verify the API key is valid

### "Invalid session. Please sign in again"
- Clear browser cookies and local storage
- Sign out and sign back in
- Check if session cookies are being set properly

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Ensure database server is running
- Check network connectivity

## 🔍 Debugging Steps

### 1. Check Environment Variables
```bash
# View current environment (development)
node -e "console.log(process.env)"
```

### 2. Check Database Connection
```bash
# Test database connection
npm run db:studio
```

### 3. Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### 4. Check Server Logs
1. Look at terminal where `npm run dev` is running
2. Check for TRPC context errors
3. Look for database connection errors

## 📋 Environment Variables Checklist

Make sure these are set in your `.env.local`:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXT_PUBLIC_STREAM_VIDEO_API_KEY` - Stream Video API key
- [ ] `STREAM_VIDEO_SECRET_KEY` - Stream Video secret key
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `NEXT_PUBLIC_APP_URL` - Application URL (optional)

## 🚀 Getting Help

If you're still having issues:

1. **Check the Setup Guide**: See `SETUP.md`
2. **Review Error Messages**: Look for specific error details
3. **Test Step by Step**: 
   - First ensure authentication works
   - Then test database connection
   - Finally test video calls
4. **Check Dependencies**: Ensure all packages are installed
   ```bash
   npm install
   ```

## 🔄 Reset Everything

If all else fails:

1. **Clear Everything**:
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   ```

2. **Reset Database**:
   ```bash
   npm run db:push
   ```

3. **Clear Browser Data**:
   - Clear all cookies and local storage
   - Try in incognito mode

4. **Restart Development**:
   ```bash
   npm run dev
   ``` 