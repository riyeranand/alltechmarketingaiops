# SmartTranslate Setup Guide

## 🚀 Quick Start

This guide will help you set up the complete SmartTranslate application with authentication and translation capabilities.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account
- An OpenAI API key

## 🔧 Setup Steps

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and create a project
   - Wait for the project to be ready

2. **Get Your Credentials**
   - Go to Settings → API
   - Copy your Project URL and anon public key

3. **Configure Authentication**
   - Go to Authentication → Settings
   - Configure your site URL: `http://localhost:3000`
   - Add redirect URLs if needed
   - Enable email confirmation if desired

### 2. OpenAI Setup

1. **Get API Key**
   - Go to [https://platform.openai.com](https://platform.openai.com)
   - Create an account or sign in
   - Go to API Keys section
   - Create a new API key

### 3. Environment Configuration

Update your `.env.local` file with actual credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 🔐 Authentication Flow

1. **Sign Up**: Users can create new accounts with email/password
2. **Sign In**: Existing users can log in
3. **Email Verification**: Optional email confirmation
4. **Protected Routes**: Dashboard requires authentication
5. **Sign Out**: Users can securely log out

## 🌍 Translation Features

- **Text Input**: Direct text translation
- **File Upload**: Support for .txt, .doc, .docx files
- **Language Selection**: 20+ target languages
- **Copy & Download**: Easy result management

## 🛠️ Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check your URL and anon key
   - Ensure project is active

2. **OpenAI API Error**
   - Verify API key is correct
   - Check your OpenAI account has credits

3. **Authentication Not Working**
   - Check Supabase auth settings
   - Verify redirect URLs

### Need Help?

- Check the browser console for error messages
- Ensure all environment variables are set
- Test with valid email/password combinations

## 🎯 Next Steps

After setup, you can:
- Customize the UI themes
- Add more languages
- Implement user profiles
- Add translation history
- Deploy to production

## 🚀 Deployment

For production deployment:
1. Update environment variables in your hosting platform
2. Configure production URLs in Supabase
3. Update CORS settings if needed
