
-- Create a storage bucket for profile images and banners if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'profiles', 'profiles', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profiles'
);

-- Create policies for the bucket if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access' AND schemaname = 'storage'
    ) THEN
        EXECUTE 'CREATE POLICY "Public Access"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = ''profiles'')';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload' AND schemaname = 'storage'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow authenticated users to upload"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = ''profiles'')';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow users to update their own objects' AND schemaname = 'storage'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow users to update their own objects"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id = ''profiles'' AND (auth.uid())::text = (storage.foldername(name))[1])';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow users to delete their own objects' AND schemaname = 'storage'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow users to delete their own objects"
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id = ''profiles'' AND (auth.uid())::text = (storage.foldername(name))[1])';
    END IF;
END
$$;
