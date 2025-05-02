
-- Create community_post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT unique_community_post_like UNIQUE (user_id, post_id)
);

-- Enable RLS on the community_post_likes table
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own likes
CREATE POLICY "Users can select their own post likes"
ON public.community_post_likes
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own likes
CREATE POLICY "Users can insert their own post likes"
ON public.community_post_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own likes
CREATE POLICY "Users can delete their own post likes"
ON public.community_post_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Add function for increment and decrement if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'increment') THEN
        CREATE OR REPLACE FUNCTION public.increment(table_name text, column_name text, row_id uuid)
        RETURNS int
        LANGUAGE plpgsql
        AS $$
        DECLARE
          new_value int;
        BEGIN
          EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + 1 WHERE id = $1 RETURNING %I', 
                        table_name, column_name, column_name, column_name)
          INTO new_value
          USING row_id;
          
          RETURN new_value;
        END;
        $$;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'decrement') THEN
        CREATE OR REPLACE FUNCTION public.decrement(table_name text, column_name text, row_id uuid)
        RETURNS int
        LANGUAGE plpgsql
        AS $$
        DECLARE
          new_value int;
        BEGIN
          EXECUTE format('UPDATE %I SET %I = GREATEST(0, COALESCE(%I, 0) - 1) WHERE id = $1 RETURNING %I', 
                        table_name, column_name, column_name, column_name)
          INTO new_value
          USING row_id;
          
          RETURN new_value;
        END;
        $$;
    END IF;
END
$$;
