# Database Setup Guide

## Required Steps to Fix "relation 'projects' does not exist" Error

### 1. Run Database Migration Scripts

Execute these SQL scripts in your Neon database console in order:

\`\`\`sql
-- First, run the main tables script
-- Copy and paste the contents of scripts/001-create-tables.sql

-- Then, run the NextAuth tables script  
-- Copy and paste the contents of scripts/002-add-nextauth-tables.sql
\`\`\`

### 2. Verify Tables Were Created

Run this query to check if tables exist:
\`\`\`sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'projects', 'tasks', 'chunks', 'sessions');
\`\`\`

### 3. Environment Variables

Ensure your `.env.local` has the correct DATABASE_URL:
\`\`\`
DATABASE_URL="your-neon-database-connection-string"
\`\`\`

### 4. Test the Application

After running the migrations:
1. Restart your development server: `pnpm dev`
2. Visit `/dashboard` - it should load without database errors
3. Try creating a project at `/capture`

## Troubleshooting

- **Still getting "relation does not exist"**: Double-check that you ran both migration scripts
- **Connection errors**: Verify your DATABASE_URL is correct
- **Permission errors**: Ensure your database user has CREATE and INSERT permissions
