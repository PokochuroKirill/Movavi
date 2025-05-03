
-- Create a bucket for subscription receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'subscriptions',
  'subscriptions',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']::text[]
)
ON CONFLICT DO NOTHING;

-- Set up access policies for the subscriptions bucket
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES
  ('Avatar storage read policy', 'subscriptions', '(bucket_id = ''subscriptions''::text)'),
  ('Avatar storage insert policy', 'subscriptions', '(bucket_id = ''subscriptions''::text AND auth.role() = ''authenticated''::text)'),
  ('Avatar storage update policy', 'subscriptions', '(bucket_id = ''subscriptions''::text AND auth.role() = ''authenticated''::text)'),
  ('Avatar storage delete policy', 'subscriptions', '(bucket_id = ''subscriptions''::text AND auth.role() = ''authenticated''::text)')
ON CONFLICT DO NOTHING;
