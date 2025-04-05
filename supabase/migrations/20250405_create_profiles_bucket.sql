
-- Create a storage bucket for profile images and banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true);

-- Create policies for the bucket
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

CREATE POLICY "Allow users to update their own objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profiles' AND (auth.uid())::text = (storage.foldername(name))[1]);
