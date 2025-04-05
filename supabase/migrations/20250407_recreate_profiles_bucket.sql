
-- Drop the existing bucket if it exists to recreate it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'profiles'
    ) THEN
        DELETE FROM storage.objects WHERE bucket_id = 'profiles';
        DELETE FROM storage.buckets WHERE id = 'profiles';
    END IF;
END
$$;

-- Create a storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true);

-- Create storage policies for the profiles bucket
-- Public read access
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES ('Public Read Access', 'bucket_id = ''profiles''::text', 'profiles');

-- Authenticated user upload access
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES ('Auth Upload Access', 'bucket_id = ''profiles''::text AND auth.uid() = owner', 'profiles');

-- Authenticated user update own objects
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES ('Auth Update Own Objects', 'bucket_id = ''profiles''::text AND auth.uid()::text = owner', 'profiles');

-- Authenticated user delete own objects
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES ('Auth Delete Own Objects', 'bucket_id = ''profiles''::text AND auth.uid()::text = owner', 'profiles');
