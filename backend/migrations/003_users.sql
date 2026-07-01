CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@fleet-bi.com',
  '$2b$10$28s/H4eHTI0bJARpmpAQfuSiRtEBWijEx/T63WXl1ik8c7ebx3FbS',
  'Admin User',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
