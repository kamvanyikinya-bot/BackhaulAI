-- Phase 3: Trust & Monetisation Schema
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_submitted', 'pending', 'approved', 'rejected')),
  documents TEXT, -- JSON array of document info
  reviewer_id TEXT,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (reviewer_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  features TEXT, -- JSON array of features
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed subscription plans
DELETE FROM subscription_plans;
INSERT INTO subscription_plans (id, name, price, features) VALUES 
('starter', 'Starter', 3500, '["Priority matching", "Basic analytics", "Email support"]'),
('pro', 'Pro', 9500, '["Advanced route optimization", "Priority matching", "Direct support"]'),
('business', 'Business', 20000, '["Full analytics", "Priority matching", "Direct support", "Fleet management"]'),
('enterprise', 'Enterprise', 35000, '["Full network intelligence", "White-glove support", "Custom integrations"]'),
('enterprise_plus', 'Enterprise+', 65000, '["Full network intelligence", "White-glove support", "Custom integrations", "Dedicated account manager"]');

-- Re-implement user_subscriptions to link to plans
DROP TABLE IF EXISTS subscriptions;
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  auto_renew BOOLEAN DEFAULT TRUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
);

CREATE TABLE IF NOT EXISTS reputation_scores (
  user_id TEXT PRIMARY KEY,
  score REAL DEFAULT 0,
  level TEXT DEFAULT 'newbie',
  badges TEXT, -- JSON array
  stats TEXT, -- JSON object for trips, rating, on-time, response-rate
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS gps_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  speed REAL,
  heading REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips (id)
);
