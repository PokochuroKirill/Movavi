
-- Add last_username_change column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_username_change TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Fix is_verified field if it's missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Check if we need to create storage buckets for profile banners and avatars
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('profiles', 'profiles', true, false, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own profile images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Allow authenticated users to upload their own profile images'
    ) THEN
        INSERT INTO storage.policies (name, bucket_id, definition)
        VALUES (
            'Allow authenticated users to upload their own profile images',
            'profiles',
            '(bucket_id = ''profiles''::text) AND (auth.role() = ''authenticated''::text)'
        );
    END IF;
END
$$;

-- Create policy to allow public access to read profile images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Allow public access to profile images'
    ) THEN
        INSERT INTO storage.policies (name, bucket_id, definition, action)
        VALUES (
            'Allow public access to profile images',
            'profiles',
            '(bucket_id = ''profiles''::text)',
            'SELECT'
        );
    END IF;
END
$$;
