
-- Create function to count user's likes for a post
CREATE OR REPLACE FUNCTION public.count_post_likes(post_id_param UUID, user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  like_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO like_count
  FROM public.community_post_likes
  WHERE post_id = post_id_param AND user_id = user_id_param;
  
  RETURN like_count;
END;
$$;

-- Create function to add post like
CREATE OR REPLACE FUNCTION public.add_post_like(post_id_param UUID, user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the like already exists to avoid duplicates
  IF NOT EXISTS (
    SELECT 1
    FROM public.community_post_likes
    WHERE post_id = post_id_param AND user_id = user_id_param
  ) THEN
    INSERT INTO public.community_post_likes (post_id, user_id)
    VALUES (post_id_param, user_id_param);
  END IF;
END;
$$;

-- Create function to remove post like
CREATE OR REPLACE FUNCTION public.remove_post_like(post_id_param UUID, user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.community_post_likes
  WHERE post_id = post_id_param AND user_id = user_id_param;
END;
$$;
