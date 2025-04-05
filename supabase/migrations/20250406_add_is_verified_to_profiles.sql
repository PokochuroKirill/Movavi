
-- Add is_verified column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END
$$;
