
-- Create a bucket for subscription receipts if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'subscriptions'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'subscriptions',
            'subscriptions',
            true,
            5242880, -- ~5MB
            ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']::text[]
        );
    END IF;
END
$$;

-- Set up access policies for the subscriptions bucket
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES
  ('Subscription storage read policy', 'subscriptions', 'bucket_id = ''subscriptions''::text'),
  ('Subscription storage insert policy', 'subscriptions', 'bucket_id = ''subscriptions''::text AND auth.role() = ''authenticated''::text'),
  ('Subscription storage update policy', 'subscriptions', 'bucket_id = ''subscriptions''::text AND auth.role() = ''authenticated''::text'),
  ('Subscription storage delete policy', 'subscriptions', 'bucket_id = ''subscriptions''::text AND auth.role() = ''authenticated''::text')
ON CONFLICT (name, bucket_id) DO NOTHING;
