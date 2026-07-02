-- RBAC test users (passwords: manager123, maintenance123, viewer123)

INSERT INTO users (email, password_hash, name, role)
VALUES (
  'manager@fleet-bi.com',
  '$2b$10$nTSAhgoeyfxCs95Ldn8OPOPK0nNUgOQ/RTFxlmv0rMOe3XLe2cbeC',
  'Operations Manager',
  'manager'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

INSERT INTO users (email, password_hash, name, role)
VALUES (
  'maintenance@fleet-bi.com',
  '$2b$10$GWo81E1nDNewK3r.EKKepOrqH144kI6jrRAnhkD.vyT2IKU6TbI2G',
  'Maintenance User',
  'maintenance'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

INSERT INTO users (email, password_hash, name, role)
VALUES (
  'viewer@fleet-bi.com',
  '$2b$10$cRGjZlV1SURSKonqaiunt.rO1KcKg5cqot4tUWXSsOSJYZX4rHms2',
  'View Only User',
  'viewer'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

UPDATE users SET name = 'Chief Executive Officer', role = 'admin' WHERE email = 'admin@fleet-bi.com';
