-- Acquisition and Leads tracking
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    city TEXT,
    type TEXT NOT NULL, -- 'driver', 'shipper', 'fleet'
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'rejected'
    source TEXT, -- 'website', 'waitlist', 'manual'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outreach_logs (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    agent_id TEXT, -- which AI agent or human did the outreach
    channel TEXT NOT NULL, -- 'email', 'sms', 'call'
    status TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'replied', 'failed'
    content TEXT,
    metadata TEXT, -- JSON extra data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id)
);
