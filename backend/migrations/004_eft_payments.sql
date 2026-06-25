-- EFT Payments and Bank Details
CREATE TABLE eft_payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('subscription', 'commission')),
    target_id TEXT NOT NULL,
    reference_number TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    proof_of_payment_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Update user_subscriptions status check
PRAGMA foreign_keys=OFF;
CREATE TABLE user_subscriptions_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  auto_renew BOOLEAN DEFAULT TRUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
);
INSERT INTO user_subscriptions_new SELECT id, user_id, plan_id, status, auto_renew, expires_at, created_at, updated_at FROM user_subscriptions;
DROP TABLE user_subscriptions;
ALTER TABLE user_subscriptions_new RENAME TO user_subscriptions;
PRAGMA foreign_keys=ON;

-- Add banking details to config
INSERT OR REPLACE INTO config (key, value) VALUES ('bank_name', 'First National Bank (FNB)');
INSERT OR REPLACE INTO config (key, value) VALUES ('account_holder', 'BackhaulAI (Pty) Ltd');
INSERT OR REPLACE INTO config (key, value) VALUES ('account_number', '62901234567');
INSERT OR REPLACE INTO config (key, value) VALUES ('branch_code', '250655');
INSERT OR REPLACE INTO config (key, value) VALUES ('payment_reference_prefix', 'BH-');
