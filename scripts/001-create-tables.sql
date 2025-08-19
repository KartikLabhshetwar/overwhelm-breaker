-- Create the main database tables for Overwhelm Breaker
-- This script creates all the necessary tables as defined in the schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  work_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}',
  energy_profile JSONB,
  default_chunk_minutes INTEGER DEFAULT 10,
  oauth_google_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  notes TEXT,
  estimate_min INTEGER,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  title TEXT NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL,
  deps JSONB DEFAULT '[]',
  energy TEXT DEFAULT 'med' CHECK (energy IN ('low', 'med', 'high')),
  resources JSONB DEFAULT '[]',
  acceptance_criteria TEXT,
  order_index INTEGER NOT NULL,
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done', 'snoozed', 'stuck')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  chunk_id TEXT NOT NULL REFERENCES chunks(id),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  outcome TEXT CHECK (outcome IN ('done', 'stuck', 'snoozed')),
  actual_min INTEGER,
  reflection TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  t_plus_min INTEGER NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('good', 'neutral', 'stuck')),
  blocker_tag TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL CHECK (provider IN ('gcal', 'gtasks', 'notion', 'todoist')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  scopes JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  input_blob JSONB NOT NULL,
  plan_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_chunks_task_id ON chunks(task_id);
CREATE INDEX IF NOT EXISTS idx_sessions_chunk_id ON sessions(chunk_id);
CREATE INDEX IF NOT EXISTS idx_checkins_session_id ON checkins(session_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
