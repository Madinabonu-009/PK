-- Play Kids PostgreSQL Schema
-- Run this once to create all tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'parent',
  group_id VARCHAR(50),
  assigned_groups TEXT[], -- Array of group IDs for teachers
  teacher_id INTEGER,
  child_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50),
  birth_date DATE,
  gender VARCHAR(10),
  group_id VARCHAR(50),
  group_name VARCHAR(100),
  parent_name VARCHAR(100),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(100),
  allergies TEXT[],
  notes TEXT,
  photo VARCHAR(255),
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  achievements JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age_range VARCHAR(50),
  capacity INTEGER,
  teacher_id VARCHAR(50),
  teacher_name VARCHAR(100),
  monthly_fee INTEGER DEFAULT 500000,
  schedule JSONB,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50),
  name VARCHAR(100),
  position VARCHAR(100),
  role VARCHAR(100),
  education TEXT,
  experience INTEGER,
  phone VARCHAR(20),
  email VARCHAR(100),
  photo VARCHAR(255),
  bio TEXT,
  category VARCHAR(50),
  "group" VARCHAR(100),
  specializations TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) DEFAULT 'image',
  url TEXT NOT NULL,
  thumbnail TEXT,
  title VARCHAR(255),
  description TEXT,
  album VARCHAR(50) DEFAULT 'general',
  published BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(50)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) DEFAULT 'feedback',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  parent_name VARCHAR(100),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(100),
  target_name VARCHAR(100),
  messages JSONB,
  status VARCHAR(20),
  is_approved BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  approved_at TIMESTAMP,
  answered_at TIMESTAMP,
  answered_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Debts table
CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  amount INTEGER NOT NULL,
  paid_amount INTEGER DEFAULT 0,
  month VARCHAR(7) NOT NULL, -- 2026-09
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  last_reminder TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  child_name VARCHAR(100),
  amount INTEGER NOT NULL,
  provider VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  description TEXT,
  transaction_id VARCHAR(100),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Menu table
CREATE TABLE IF NOT EXISTS menu (
  id SERIAL PRIMARY KEY,
  week_day VARCHAR(20) NOT NULL,
  date DATE,
  breakfast JSONB,
  lunch JSONB,
  snack JSONB,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(100) NOT NULL,
  birth_date DATE,
  parent_name VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(100),
  preferred_group VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'present',
  arrival_time TIME,
  departure_time TIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  date DATE NOT NULL,
  mood VARCHAR(20),
  meal_breakfast VARCHAR(20),
  meal_lunch VARCHAR(20),
  meal_snack VARCHAR(20),
  sleep_duration INTEGER,
  activities TEXT[],
  notes TEXT,
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Library table
CREATE TABLE IF NOT EXISTS library (
  id SERIAL PRIMARY KEY,
  title JSONB NOT NULL,
  description JSONB,
  moral JSONB,
  video_url TEXT,
  emoji VARCHAR(10),
  color VARCHAR(20),
  duration INTEGER,
  characters TEXT[],
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Game progress table
CREATE TABLE IF NOT EXISTS game_progress (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  game_type VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  played_at TIMESTAMP DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  points INTEGER DEFAULT 0,
  earned_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_children_group_id ON children(group_id);
CREATE INDEX idx_debts_child_id ON debts(child_id);
CREATE INDEX idx_debts_month ON debts(month);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_daily_reports_date ON daily_reports(date);
