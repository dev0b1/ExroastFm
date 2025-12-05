-- UP: drop old Paddle-related columns (safe after verifying data copied to new columns)
BEGIN;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS paddle_subscription_id;
ALTER TABLE transactions DROP COLUMN IF EXISTS paddle_data;
COMMIT;

-- DOWN: re-add the columns if you need to revert (no data restoration)
-- Note: DOWN adds columns as nullable text/jsonb to restore schema shape only
-- Run the DOWN block manually if reverting

/*
BEGIN;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_subscription_id text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paddle_data jsonb;
COMMIT;
*/
