-- Initial schema for BackhaulAI

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, 
  email TEXT UNIQUE NOT NULL, 
  password TEXT NOT NULL, 
  role TEXT NOT NULL CHECK (role IN ('driver', 'fleet', 'company', 'admin')), 
  full_name TEXT NOT NULL, 
  phone TEXT, 
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')), 
  reputation_score REAL DEFAULT 5.0, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  onboarding_step TEXT DEFAULT 'signup', 
  onboarding_completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS loads (
  id TEXT PRIMARY KEY, 
  owner_id TEXT NOT NULL, 
  origin TEXT NOT NULL, 
  destination TEXT NOT NULL, 
  weight REAL NOT NULL, 
  "type" TEXT NOT NULL, 
  pickup_window_start DATETIME NOT NULL, 
  pickup_window_end DATETIME NOT NULL, 
  delivery_window_start DATETIME NOT NULL, 
  delivery_window_end DATETIME NOT NULL, 
  price REAL NOT NULL, 
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'in-transit', 'delivered', 'cancelled')), 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  origin_lat REAL, 
  origin_lng REAL, 
  dest_lat REAL, 
  dest_lng REAL, 
  distance_km REAL, 
  FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS trucks (
  id TEXT PRIMARY KEY, 
  owner_id TEXT NOT NULL, 
  plate_number TEXT NOT NULL, 
  capacity REAL NOT NULL, 
  "type" TEXT NOT NULL, 
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')), 
  current_lat REAL, 
  current_lng REAL, 
  gps_device_id TEXT, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY, 
  load_id TEXT NOT NULL, 
  truck_id TEXT NOT NULL, 
  driver_id TEXT NOT NULL, 
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-transit', 'delivered', 'cancelled')), 
  started_at DATETIME, 
  completed_at DATETIME, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  parent_trip_id TEXT, 
  FOREIGN KEY (load_id) REFERENCES loads (id), 
  FOREIGN KEY (truck_id) REFERENCES trucks (id), 
  FOREIGN KEY (driver_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY, 
  trip_id TEXT NOT NULL, 
  amount REAL NOT NULL, 
  commission REAL NOT NULL, 
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')), 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  FOREIGN KEY (trip_id) REFERENCES trips (id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY, 
  user_id TEXT NOT NULL, 
  "plan" TEXT NOT NULL CHECK ("plan" IN ('basic', 'pro', 'enterprise')), 
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')), 
  expires_at DATETIME NOT NULL, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  FOREIGN KEY (user_id) REFERENCES users (id)
);
