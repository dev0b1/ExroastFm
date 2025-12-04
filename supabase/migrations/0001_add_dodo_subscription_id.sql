-- 0001_add_dodo_subscription_id.sql
-- Reversible migration: add `dodo_subscription_id`, copy values from `paddle_subscription_id`, add index.
-- Run this against your Postgres DB. Review results before dropping the old column.

-- UP
BEGIN;

-- Add the new column if it doesn't exist
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT;

-- Copy existing values from paddle_subscription_id when present
UPDATE subscriptions
SET dodo_subscription_id = paddle_subscription_id
WHERE paddle_subscription_id IS NOT NULL
  AND (dodo_subscription_id IS NULL OR dodo_subscription_id = '');

-- Create an index for faster lookups (if helpful)
CREATE INDEX IF NOT EXISTS subscriptions_dodo_subscription_id_idx ON subscriptions (dodo_subscription_id);

COMMIT;

-- DOWN (reverse): restore paddle_subscription_id from dodo_subscription_id and remove the new column.
-- Use only if you need to rollback.
-- BEGIN;
--
-- ALTER TABLE subscriptions
--   ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;
--
-- UPDATE subscriptions
-- SET paddle_subscription_id = dodo_subscription_id
-- WHERE dodo_subscription_id IS NOT NULL
--   AND (paddle_subscription_id IS NULL OR paddle_subscription_id = '');
--
-- DROP INDEX IF EXISTS subscriptions_dodo_subscription_id_idx;
--
-- ALTER TABLE subscriptions
--   DROP COLUMN IF EXISTS dodo_subscription_id;
--
-- COMMIT;
