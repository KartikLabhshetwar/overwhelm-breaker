# Overwhelm Breaker Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- Google OAuth credentials

## Environment Variables Setup

1. **Copy environment file:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Update .env.local with your values:**

   ### Database (Required)
   - `DATABASE_URL`: Your Neon database connection string
   
   ### Authentication (Required)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: `http://localhost:3000` for development
   - `GOOGLE_CLIENT_ID`: From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   
   ### AI (Required)
   - `GROQ_API_KEY`: From https://console.groq.com/

## Database Setup

1. **Run database migrations:**
   \`\`\`bash
   # Execute these SQL files in your Neon database console:
   # 1. scripts/001-create-tables.sql
   # 2. scripts/002-add-nextauth-tables.sql
   \`\`\`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to .env.local

## Installation & Running

1. **Install dependencies:**
   \`\`\`bash
   pnpm install
   \`\`\`

2. **Start development server:**
   \`\`\`bash
   pnpm dev
   \`\`\`

3. **Open browser:**
   Navigate to `http://localhost:3000`

## Timezone Configuration

The app supports IST (Indian Standard Time) and other timezones. Users can set their timezone in settings after signing in.
