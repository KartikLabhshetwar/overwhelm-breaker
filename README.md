# Overwhelm Breaker

A smart productivity app that helps you break down large projects into manageable tasks, schedule your work, and stay focused. Built with Next.js, TypeScript, and AI.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/kartik-labhshetwars-projects/v0-ai-chat-interface)

## Key Features

- **AI-Powered Task Breakdown**: Automatically break down large goals into smaller, actionable steps using the Groq API.
- **Project & Task Management**: Organize your work into projects and "chunks" (manageable tasks).
- **Intelligent Scheduling**: Plan your focus sessions for the week ahead.
- **Focus Mode**: A dedicated, distraction-free interface to concentrate on one task at a time.
- **Dashboard & Analytics**: Visualize your progress, track completed tasks, and monitor productivity trends.
- **Quick Capture**: A central place to quickly add new ideas, tasks, and projects.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (with Google Provider)
- **AI**: [Groq API](https://groq.com/) for fast task generation.

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or newer)
- pnpm (or your preferred package manager)
- A [Neon](https://neon.tech/) account for the PostgreSQL database.
- A [Google Cloud Console](https://console.cloud.google.com/) project to set up OAuth.
- A [Groq](https://console.groq.com/) account for the AI API key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/overwhelm-breaker.git
    cd overwhelm-breaker
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
    Update the file with your credentials for the database, NextAuth, Google OAuth, and Groq. You can find detailed instructions in `LOCAL_SETUP.md`.

4.  **Set up the database:**
    Connect to your Neon database and run the SQL scripts located in the `/scripts` directory in the following order:
    1.  `001-create-tables.sql`
    2.  `002-add-nextauth-tables.sql`

    For detailed instructions, see `DATABASE_SETUP.md`.

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

- `pnpm dev`: Runs the app in development mode.
- `pnpm build`: Builds the app for production.
- `pnpm start`: Starts a production server.
- `pnpm lint`: Runs the linter to check for code quality issues.