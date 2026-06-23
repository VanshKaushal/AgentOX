-- Users table (auto from Supabase Auth)

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  folder_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snapshots table  
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects,
  state JSONB,
  tasks JSONB,
  decisions JSONB,
  history JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage table (for billing)
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  syncs_this_month INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'free'
);
