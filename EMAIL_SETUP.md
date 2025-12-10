# 📧 Email Setup Guide for Lodge Finder

Follow these steps to enable email functionality:

## Step 1: Generate Gmail App Password

1. **Go to your Google Account**: https://myaccount.google.com
2. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to Security → 2-Step Verification
   - Follow the prompts to enable it
3. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Windows Computer" as the device (or Other)
   - Click "Generate"
   - **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

## Step 2: Create the .env File

1. **Open your project folder**: `c:\Users\User\Documents\Lodgefinder`
2. **Create a new file** named `.env` (yes, it starts with a dot)
3. **Copy and paste** the following content into the file:

```
# Server Configuration
PORT=3000

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=blessingsphiri196@gmail.com
EMAIL_PASSWORD=paste-your-app-password-here

# Email Settings
EMAIL_FROM=blessingsphiri196@gmail.com
EMAIL_TO=blessingsphiri196@gmail.com

# CORS Settings (Frontend URL)
FRONTEND_URL=http://localhost:3000
```

4. **Replace `paste-your-app-password-here`** with the 16-character App Password you generated
   - Remove any spaces from the password
   - Example: `EMAIL_PASSWORD=abcdefghijklmnop`

## Step 3: Restart the Server

1. **Stop the current server**:
   - Go to the terminal where `npm start` is running
   - Press `Ctrl + C`

2. **Start the server again**:
   ```bash
   npm start
   ```

3. **Check for success**:
   - You should see: `✅ Email server is ready to send messages`
   - Instead of: `❌ Email transporter error`

## Step 4: Test Email Functionality

### Test Contact Form:
1. Go to: http://localhost:3000/contact.html
2. Fill out the form
3. Submit
4. Check your email inbox (blessingsphiri196@gmail.com)

### Test Bookmark Subscription:
1. Go to: http://localhost:3000/search.html
2. Click the heart icon on any lodge
3. Enter an email address
4. Check both your inbox and the subscriber's inbox

## Troubleshooting

### "Invalid credentials" error:
- Make sure you're using the App Password, NOT your regular Gmail password
- Remove any spaces from the App Password
- Make sure 2-Factor Authentication is enabled

### "Less secure app access" error:
- This shouldn't happen with App Passwords
- If it does, use App Passwords instead (they're more secure)

### Emails not arriving:
- Check your spam folder
- Verify the EMAIL_TO address is correct
- Check server logs for error messages

## Security Notes

⚠️ **Important:**
- Never share your `.env` file or App Password
- The `.env` file is already in `.gitignore` so it won't be committed to Git
- If you accidentally expose your App Password, revoke it and generate a new one

## Quick Command Reference

**Create .env file (Windows PowerShell):**
```powershell
New-Item -Path .env -ItemType File
notepad .env
```

**Create .env file (Windows Command Prompt):**
```cmd
type nul > .env
notepad .env
```

Then paste the configuration and save!
