# Local Setup Guide for Overwhelm Breaker

## Prerequisites
- Node.js 18+ installed
- Git installed
- A Neon database account (free tier available)
- Google Cloud Console account for OAuth

## Step-by-Step Setup

### 1. Clone and Install Dependencies
\`\`\`bash
git clone <your-repo-url>
cd overwhelm-breaker
pnpm install
\`\`\`

### 2. Set Up Environment Variables
Copy the example environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your actual values:
\`\`\`env
# Database (Get from Neon dashboard)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# NextAuth (Generate a random secret)
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Groq AI (Get from console.groq.com - FREE)
GROQ_API_KEY="your-groq-api-key"
\`\`\`

### 3. Set Up Database Tables

#### Option A: Using Neon Console (Recommended)
1. Go to [Neon Console](https://console.neon.tech/)
2. Open your database
3. Go to "SQL Editor"
4. Copy and paste the contents of `scripts/001-create-tables.sql`
5. Click "Run" to execute
6. Copy and paste the contents of `scripts/002-add-nextauth-tables.sql`
7. Click "Run" to execute

#### Option B: Using psql Command Line
\`\`\`bash
# Connect to your database
psql "postgresql://username:password@host/database?sslmode=require"

# Run the migration scripts
\i scripts/001-create-tables.sql
\i scripts/002-add-nextauth-tables.sql
\`\`\`

### 4. Get API Keys

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

#### Groq API Key (FREE):
1. Go to [console.groq.com](https://console.groq.com/)
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Copy to `.env.local`

### 5. Start the Application
\`\`\`bash
pnpm dev
\`\`\`

The app will be available at `http://localhost:3000`

### 6. Test the Setup
1. Visit `http://localhost:3000`
2. Click "Sign In" and test Google OAuth
3. Go to `/capture` to test AI task breakdown
4. Create a project and verify database is working

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check that your Neon database is active
- Ensure the migration scripts ran successfully

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check Google OAuth credentials
- Clear browser cookies if having session issues

### AI Features Not Working
- Verify GROQ_API_KEY is correct
- Check that you have API credits (Groq offers free tier)

## Common Commands
\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

## Need Help?
Check the error logs in your terminal and browser console for specific error messages.
