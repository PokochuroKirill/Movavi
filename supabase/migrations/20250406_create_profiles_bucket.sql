
-- Create a storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'profiles', 'profiles', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profiles'
);

-- Set up access policies for the profiles bucket
INSERT INTO storage.policies (name, definition, bucket_id)
SELECT 'Public Read Access', '(bucket_id = ''profiles''::text)', 'profiles'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public Read Access' AND bucket_id = 'profiles'
);

-- Allow authenticated users to upload their own profile images
INSERT INTO storage.policies (name, definition, bucket_id)
SELECT 'Auth Upload Access', '(bucket_id = ''profiles''::text AND auth.uid() = owner)', 'profiles'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Auth Upload Access' AND bucket_id = 'profiles'
);
