-- Seed data for Fleet Management BI

INSERT INTO regions (code, name_en, name_he) VALUES
  ('south', 'South', 'דרום'),
  ('north', 'North', 'צפון'),
  ('rishon', 'Rishon LeZion', 'ראשון לציון')
ON CONFLICT (code) DO NOTHING;

INSERT INTO customers (code, name) VALUES
  ('1001', 'Customer A'),
  ('1002', 'Customer B'),
  ('1045', 'Jerusalem Antiquities Authority')
ON CONFLICT (code) DO NOTHING;

INSERT INTO vehicles (vehicle_number, vehicle_type, region_id, status, contractor, start_date, income_threshold, downtime_days, notes)
SELECT v.vehicle_number, v.vehicle_type, r.id, v.status, v.contractor, v.start_date::date, v.income_threshold, v.downtime_days, v.notes
FROM (VALUES
  ('28861303', 'Buses (BI)', 'south', 'active', 'BI Minibuses', '2022-03-15', 24000, 12, ''),
  ('62978603', 'Minibus', 'north', 'disabled', 'BI Minibuses', '2021-08-01', 20000, 45, 'Engine repair'),
  ('28860503', 'Buses (BI)', 'south', 'active', 'BI Minibuses', '2020-01-10', 24000, 0, '')
) AS v(vehicle_number, vehicle_type, region_code, status, contractor, start_date, income_threshold, downtime_days, notes)
JOIN regions r ON r.code = v.region_code
ON CONFLICT (vehicle_number) DO NOTHING;

INSERT INTO drivers (license, name, region_id, driver_type)
SELECT d.license, d.name, r.id, d.driver_type
FROM (VALUES
  ('DL-4521', 'Abd Abu Mhareb', 'south', 'employee'),
  ('DL-3890', 'It was said by Abu Rashad', 'south', 'contractor')
) AS d(license, name, region_code, driver_type)
JOIN regions r ON r.code = d.region_code
ON CONFLICT (license) DO NOTHING;

INSERT INTO vehicle_daily_revenue (vehicle_id, revenue_date, revenue)
SELECT v.id, d.revenue_date::date, d.revenue
FROM (VALUES
  ('28861303', '2026-04-01', 26500),
  ('28861303', '2026-04-02', 22000),
  ('28861303', '2026-04-04', 28000),
  ('28861303', '2026-04-05', 19500),
  ('62978603', '2026-04-01', 21000),
  ('62978603', '2026-04-02', 22500),
  ('62978603', '2026-04-03', 20800),
  ('62978603', '2026-04-05', 23000),
  ('28860503', '2026-04-01', 25000),
  ('28860503', '2026-04-02', 26000),
  ('28860503', '2026-04-03', 25500),
  ('28860503', '2026-04-04', 27000),
  ('28860503', '2026-04-05', 24800)
) AS d(vehicle_number, revenue_date, revenue)
JOIN vehicles v ON v.vehicle_number = d.vehicle_number
ON CONFLICT (vehicle_id, revenue_date) DO NOTHING;

INSERT INTO driver_daily_revenue (driver_id, revenue_date, revenue)
SELECT dr.id, d.revenue_date::date, d.revenue
FROM (VALUES
  ('DL-4521', '2026-04-01', 9200),
  ('DL-4521', '2026-04-02', 8800),
  ('DL-4521', '2026-04-04', 9500),
  ('DL-3890', '2026-04-01', 7500),
  ('DL-3890', '2026-04-02', 6800),
  ('DL-3890', '2026-04-03', 7200)
) AS d(license, revenue_date, revenue)
JOIN drivers dr ON dr.license = d.license
ON CONFLICT (driver_id, revenue_date) DO NOTHING;

INSERT INTO customer_revenue_summary (
  customer_id, period_start, period_end, trips, vehicles, total_revenue,
  share_percent, contractor_income, contractor_share_percent, contractor_profit_percent,
  revenue_ytd, vehicles_at_loss
)
SELECT c.id, '2026-04-01'::date, '2026-04-30'::date, s.trips, s.vehicles, s.total_revenue,
  s.share_percent, s.contractor_income, s.contractor_share_percent, s.contractor_profit_percent,
  s.revenue_ytd, s.vehicles_at_loss
FROM (VALUES
  ('1001', 1240, 45, 2450000, 22.5, 180000, 7.3, 12.4, 8200000, 3),
  ('1002', 980, 32, 1890000, 17.4, 145000, 7.7, 10.2, 6100000, 8),
  ('1045', 650, 18, 980000, 9.0, 72000, 7.3, 8.5, 3200000, 1)
) AS s(code, trips, vehicles, total_revenue, share_percent, contractor_income, contractor_share_percent, contractor_profit_percent, revenue_ytd, vehicles_at_loss)
JOIN customers c ON c.code = s.code
ON CONFLICT (customer_id, period_start, period_end) DO NOTHING;

INSERT INTO weekly_revenue_days (revenue_date, revenue, vehicles, organic_vehicles, change_percent, holiday_label, week_num, year)
VALUES
  ('2026-04-12', 580000, 22, 8, 3.2, NULL, 16, 2026),
  ('2026-04-13', 620000, 24, 9, 5.1, NULL, 16, 2026),
  ('2026-04-14', 590000, 23, 8, -1.4, NULL, 16, 2026),
  ('2026-04-15', 610000, 24, 10, 2.8, NULL, 16, 2026),
  ('2026-04-16', 640000, 25, 11, 4.5, NULL, 16, 2026),
  ('2026-04-17', 420000, 18, 6, -8.2, NULL, 16, 2026),
  ('2026-04-18', NULL, 0, 0, NULL, 'Memorial Day', 16, 2026),
  ('2026-04-05', 560000, 21, 7, 1.1, NULL, 15, 2026),
  ('2026-04-06', 600000, 23, 9, 3.8, NULL, 15, 2026),
  ('2026-04-07', 575000, 22, 8, -0.5, NULL, 15, 2026),
  ('2026-04-08', 595000, 23, 9, 1.9, NULL, 15, 2026),
  ('2026-04-09', 630000, 24, 10, 4.2, NULL, 15, 2026),
  ('2026-04-10', 410000, 17, 5, -6.1, NULL, 15, 2026),
  ('2026-04-11', 380000, 16, 5, -4.3, NULL, 15, 2026)
ON CONFLICT (revenue_date) DO NOTHING;

INSERT INTO maintenance_agreements (vehicle_id, supplier, agreement_number, start_date, end_date, monthly_cost, annual_cost, service_types, status)
SELECT v.id, 'Garage Central', 'AGR-2024-001', '2024-01-01', '2026-12-31', 3500, 42000, 'Engine, Body, Electrical', 'Active'
FROM vehicles v WHERE v.vehicle_number = '28861303'
ON CONFLICT (agreement_number) DO NOTHING;

INSERT INTO vehicle_expenses (vehicle_id, expense_date, category, description, amount, provider, invoice_ref)
SELECT v.id, '2026-04-01'::date, 'Fuel', 'Monthly fuel', 8500, 'Paz', 'INV-4521'
FROM vehicles v WHERE v.vehicle_number = '28861303';

INSERT INTO vehicle_relocations (vehicle_id, change_date, from_customer, to_customer, from_driver, to_driver, from_area, to_area, reason, operator_name)
SELECT v.id, '2026-03-20'::date, 'Customer A', 'Customer B', 'Abd Abu Mhareb', 'It was said by Abu Rashad', 'South', 'North', 'Fleet Balance', 'Admin User'
FROM vehicles v WHERE v.vehicle_number = '28861303';

INSERT INTO activity_log (logged_at, user_name, action_type, module, details, ip_address)
VALUES ('2026-04-15T10:30:00Z', 'Admin User', 'Update', 'Vehicle Revenue', 'Update vehicle income threshold 28861303', '192.168.1.10');

INSERT INTO trips (trip_id, trip_date, start_time, end_time, description, customer_id, region_id, vehicle_id, driver_id, vehicle_type, price, estimated_price, driver_type, manufacturer_status, confirmed)
SELECT
  '11237800',
  '2026-04-14'::date,
  '06:10'::time,
  '07:10'::time,
  'Pickup from Hammar 300 - to Jerusalem on the Peace Train',
  c.id,
  r.id,
  v.id,
  d.id,
  'BI Minibuses',
  130,
  130,
  'Employee',
  'BI process',
  TRUE
FROM customers c
JOIN regions r ON r.code = 'rishon'
JOIN vehicles v ON v.vehicle_number = '62978603'
JOIN drivers d ON d.license = 'DL-4521'
WHERE c.code = '1045'
ON CONFLICT (trip_id) DO NOTHING;

INSERT INTO vehicle_idle_stats (vehicle_id, period_start, period_end, total_km, productive_km, idle_km, productivity_percent)
SELECT v.id, '2026-04-01'::date, '2026-04-30'::date, 187, 178, 9, 91
FROM vehicles v WHERE v.vehicle_number = '28860503'
ON CONFLICT (vehicle_id, period_start, period_end) DO NOTHING;

INSERT INTO driver_idle_stats (driver_id, period_start, period_end, total_km, productive_km, idle_km, productivity_percent, operating_days, vehicle_count)
SELECT d.id, '2026-04-01'::date, '2026-04-30'::date, 110, 16, 94, 74.8, 1, 1
FROM drivers d WHERE d.license = 'DL-3890'
ON CONFLICT (driver_id, period_start, period_end) DO NOTHING;
