-- Fix foreign key relationships for comments table
-- Add proper foreign key to comments table for user profiles
ALTER TABLE public.comments ADD CONSTRAINT fk_comments_user 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix foreign key relationships for snippet_comments table  
ALTER TABLE public.snippet_comments ADD CONSTRAINT fk_snippet_comments_user
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;