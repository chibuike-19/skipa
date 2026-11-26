-- Counters for the Postgres-backed rate-limit store (AD §6.2: no Redis). See ADR-34.
-- UNLOGGED: fast, not WAL-logged or replicated, emptied after a crash; losing counters only
-- resets windows early, which is acceptable for rate limits. Keys are HMACs, never raw IPs or
-- phone numbers.
CREATE UNLOGGED TABLE rate_limit_counters (
  key       text PRIMARY KEY,
  count     int NOT NULL,
  reset_at  timestamptz NOT NULL
);
CREATE INDEX rate_limit_counters_reset_idx ON rate_limit_counters (reset_at);
