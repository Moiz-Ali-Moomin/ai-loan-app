-- ============================================================
-- AI Loan Governance Platform
-- Migration: 003
-- Extend audit_logs partitions through 2035
--
-- 001_initial_schema.sql left coverage ending at 2027-07-01;
-- everything after that fell into audit_logs_default, losing
-- partition pruning. This migration:
--   - Fills the 2027 gap (Q3 + Q4) using the existing quarterly
--     convention already used for 2025/2026/2027.
--   - Adds monthly partitions for 2028-01 through 2035-12 using
--     the audit_logs_YYYY_MM naming already used in 2024.
--   - Uses IF NOT EXISTS throughout for idempotency.
--   - Does NOT touch existing partitions, indexes, or the DEFAULT
--     partition. The DEFAULT partition remains as a catch-all for
--     any data beyond 2035 and as a safety net during deploys.
-- ============================================================

-- ============================================================
-- 2027 gap (Q3 and Q4 were never created in migration 001)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2027_q3 PARTITION OF audit_logs
    FOR VALUES FROM ('2027-07-01') TO ('2027-10-01');

CREATE TABLE IF NOT EXISTS audit_logs_2027_q4 PARTITION OF audit_logs
    FOR VALUES FROM ('2027-10-01') TO ('2028-01-01');

-- ============================================================
-- 2028 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2028_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-01-01') TO ('2028-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-02-01') TO ('2028-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-03-01') TO ('2028-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-04-01') TO ('2028-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-05-01') TO ('2028-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-06-01') TO ('2028-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-07-01') TO ('2028-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-08-01') TO ('2028-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-09-01') TO ('2028-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-10-01') TO ('2028-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-11-01') TO ('2028-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-12-01') TO ('2029-01-01');

-- ============================================================
-- 2029 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2029_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-01-01') TO ('2029-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-02-01') TO ('2029-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-03-01') TO ('2029-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-04-01') TO ('2029-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-05-01') TO ('2029-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-06-01') TO ('2029-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-07-01') TO ('2029-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-08-01') TO ('2029-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-09-01') TO ('2029-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-10-01') TO ('2029-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-11-01') TO ('2029-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-12-01') TO ('2030-01-01');

-- ============================================================
-- 2030 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2030_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-01-01') TO ('2030-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-02-01') TO ('2030-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-03-01') TO ('2030-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-04-01') TO ('2030-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-05-01') TO ('2030-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-06-01') TO ('2030-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-07-01') TO ('2030-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-08-01') TO ('2030-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-09-01') TO ('2030-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-10-01') TO ('2030-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-11-01') TO ('2030-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-12-01') TO ('2031-01-01');

-- ============================================================
-- 2031 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2031_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-01-01') TO ('2031-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-02-01') TO ('2031-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-03-01') TO ('2031-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-04-01') TO ('2031-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-05-01') TO ('2031-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-06-01') TO ('2031-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-07-01') TO ('2031-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-08-01') TO ('2031-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-09-01') TO ('2031-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-10-01') TO ('2031-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-11-01') TO ('2031-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-12-01') TO ('2032-01-01');

-- ============================================================
-- 2032 — monthly (leap year, no special handling needed for
--         range partitioning — bounds are month boundaries)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2032_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-01-01') TO ('2032-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-02-01') TO ('2032-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-03-01') TO ('2032-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-04-01') TO ('2032-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-05-01') TO ('2032-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-06-01') TO ('2032-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-07-01') TO ('2032-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-08-01') TO ('2032-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-09-01') TO ('2032-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-10-01') TO ('2032-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-11-01') TO ('2032-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-12-01') TO ('2033-01-01');

-- ============================================================
-- 2033 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2033_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-01-01') TO ('2033-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-02-01') TO ('2033-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-03-01') TO ('2033-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-04-01') TO ('2033-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-05-01') TO ('2033-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-06-01') TO ('2033-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-07-01') TO ('2033-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-08-01') TO ('2033-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-09-01') TO ('2033-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-10-01') TO ('2033-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-11-01') TO ('2033-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-12-01') TO ('2034-01-01');

-- ============================================================
-- 2034 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2034_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-01-01') TO ('2034-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-02-01') TO ('2034-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-03-01') TO ('2034-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-04-01') TO ('2034-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-05-01') TO ('2034-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-06-01') TO ('2034-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-07-01') TO ('2034-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-08-01') TO ('2034-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-09-01') TO ('2034-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-10-01') TO ('2034-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-11-01') TO ('2034-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-12-01') TO ('2035-01-01');

-- ============================================================
-- 2035 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2035_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-01-01') TO ('2035-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-02-01') TO ('2035-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-03-01') TO ('2035-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-04-01') TO ('2035-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-05-01') TO ('2035-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-06-01') TO ('2035-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-07-01') TO ('2035-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-08-01') TO ('2035-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-09-01') TO ('2035-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-10-01') TO ('2035-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-11-01') TO ('2035-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-12-01') TO ('2036-01-01');
