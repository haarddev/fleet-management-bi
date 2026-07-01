-- Fleet Management BI – initial schema

CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_he VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type VARCHAR(80) NOT NULL,
  region_id INT REFERENCES regions(id),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  contractor VARCHAR(120),
  start_date DATE,
  end_date DATE,
  actual_end_date DATE,
  downtime_days INT NOT NULL DEFAULT 0,
  income_threshold DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  license VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  region_id INT REFERENCES regions(id),
  driver_type VARCHAR(20) NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_daily_revenue (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  revenue_date DATE NOT NULL,
  revenue DECIMAL(12, 2),
  UNIQUE (vehicle_id, revenue_date)
);

CREATE TABLE IF NOT EXISTS driver_daily_revenue (
  id SERIAL PRIMARY KEY,
  driver_id INT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  revenue_date DATE NOT NULL,
  revenue DECIMAL(12, 2),
  UNIQUE (driver_id, revenue_date)
);

CREATE TABLE IF NOT EXISTS customer_revenue_summary (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  trips INT NOT NULL DEFAULT 0,
  vehicles INT NOT NULL DEFAULT 0,
  total_revenue DECIMAL(14, 2) NOT NULL DEFAULT 0,
  share_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,
  contractor_income DECIMAL(14, 2) NOT NULL DEFAULT 0,
  contractor_share_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,
  contractor_profit_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,
  revenue_ytd DECIMAL(14, 2) NOT NULL DEFAULT 0,
  vehicles_at_loss INT NOT NULL DEFAULT 0,
  UNIQUE (customer_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS weekly_revenue_days (
  id SERIAL PRIMARY KEY,
  revenue_date DATE UNIQUE NOT NULL,
  revenue DECIMAL(14, 2),
  vehicles INT NOT NULL DEFAULT 0,
  organic_vehicles INT NOT NULL DEFAULT 0,
  change_percent DECIMAL(6, 2),
  holiday_label VARCHAR(120),
  week_num INT NOT NULL,
  year INT NOT NULL
);

CREATE TABLE IF NOT EXISTS maintenance_agreements (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  supplier VARCHAR(120) NOT NULL,
  agreement_number VARCHAR(60) UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  annual_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  service_types TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS vehicle_expenses (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  category VARCHAR(60) NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  provider VARCHAR(120),
  invoice_ref VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS vehicle_relocations (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  change_date DATE NOT NULL,
  from_customer VARCHAR(200),
  to_customer VARCHAR(200),
  from_driver VARCHAR(200),
  to_driver VARCHAR(200),
  from_area VARCHAR(80),
  to_area VARCHAR(80),
  reason VARCHAR(120),
  operator_name VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_name VARCHAR(120) NOT NULL,
  action_type VARCHAR(40) NOT NULL,
  module VARCHAR(80) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45)
);

CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  trip_id VARCHAR(30) UNIQUE NOT NULL,
  trip_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  description TEXT,
  customer_id INT REFERENCES customers(id),
  region_id INT REFERENCES regions(id),
  vehicle_id INT REFERENCES vehicles(id),
  driver_id INT REFERENCES drivers(id),
  vehicle_type VARCHAR(80),
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  estimated_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  driver_type VARCHAR(20),
  manufacturer_status VARCHAR(40),
  confirmed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS vehicle_idle_stats (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_km DECIMAL(10, 2) NOT NULL DEFAULT 0,
  productive_km DECIMAL(10, 2) NOT NULL DEFAULT 0,
  idle_km DECIMAL(10, 2) NOT NULL DEFAULT 0,
  productivity_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,
  UNIQUE (vehicle_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS driver_idle_stats (
  id SERIAL PRIMARY KEY,
  driver_id INT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_km DECIMAL(10, 2) NOT NULL DEFAULT 0,
  productive_km DECIMAL(10, 2) NOT NULL DEFAULT 0,
  idle_km DECIMAL(10, 2) NOT NULL DEFAULT 0,
  productivity_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,
  operating_days INT NOT NULL DEFAULT 0,
  vehicle_count INT NOT NULL DEFAULT 0,
  UNIQUE (driver_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_daily_revenue_date ON vehicle_daily_revenue (revenue_date);
CREATE INDEX IF NOT EXISTS idx_driver_daily_revenue_date ON driver_daily_revenue (revenue_date);
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips (trip_date);
CREATE INDEX IF NOT EXISTS idx_activity_log_logged_at ON activity_log (logged_at DESC);
