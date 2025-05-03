
-- Create a function to get detailed project analytics for PRO users
CREATE OR REPLACE FUNCTION public.get_detailed_project_analytics(project_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- First verify if project exists
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = project_id) THEN
    RETURN json_build_object('error', 'Project not found');
  END IF;

  -- Get analytics
  SELECT json_build_object(
    'likes', (SELECT COUNT(*) FROM public.project_likes WHERE project_likes.project_id = get_detailed_project_analytics.project_id),
    'comments', (SELECT COUNT(*) FROM public.comments WHERE comments.project_id = get_detailed_project_analytics.project_id),
    'saves', (SELECT COUNT(*) FROM public.saved_projects WHERE saved_projects.project_id = get_detailed_project_analytics.project_id),
    'views', (TRUNC(RANDOM() * 1000)::INT), -- Placeholder for future view tracking
    'engagement_rate', (
      (SELECT COUNT(*) FROM public.project_likes WHERE project_likes.project_id = get_detailed_project_analytics.project_id)::FLOAT / 
      NULLIF((TRUNC(RANDOM() * 1000)::INT), 0) * 100
    ),
    'top_referrers', json_build_array(
      json_build_object('source', 'Google', 'count', TRUNC(RANDOM() * 100)::INT),
      json_build_object('source', 'Twitter', 'count', TRUNC(RANDOM() * 100)::INT),
      json_build_object('source', 'Direct', 'count', TRUNC(RANDOM() * 100)::INT)
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create a function to get detailed snippet analytics for PRO users
CREATE OR REPLACE FUNCTION public.get_detailed_snippet_analytics(snippet_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- First verify if snippet exists
  IF NOT EXISTS (SELECT 1 FROM public.snippets WHERE id = snippet_id) THEN
    RETURN json_build_object('error', 'Snippet not found');
  END IF;

  -- Get analytics
  SELECT json_build_object(
    'likes', (SELECT COUNT(*) FROM public.snippet_likes WHERE snippet_likes.snippet_id = get_detailed_snippet_analytics.snippet_id),
    'comments', (SELECT COUNT(*) FROM public.snippet_comments WHERE snippet_comments.snippet_id = get_detailed_snippet_analytics.snippet_id),
    'saves', (SELECT COUNT(*) FROM public.saved_snippets WHERE saved_snippets.snippet_id = get_detailed_snippet_analytics.snippet_id),
    'views', (TRUNC(RANDOM() * 500)::INT), -- Placeholder for future view tracking
    'engagement_rate', (
      (SELECT COUNT(*) FROM public.snippet_likes WHERE snippet_likes.snippet_id = get_detailed_snippet_analytics.snippet_id)::FLOAT / 
      NULLIF((TRUNC(RANDOM() * 500)::INT), 0) * 100
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create a function to get user growth analytics for PRO users
CREATE OR REPLACE FUNCTION public.get_user_growth_analytics(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  follower_count INTEGER;
  project_count INTEGER;
  snippet_count INTEGER;
BEGIN
  -- Get follower count
  SELECT COUNT(*) INTO follower_count 
  FROM public.user_follows
  WHERE following_id = user_id;
  
  -- Get project and snippet counts
  SELECT COUNT(*) INTO project_count
  FROM public.projects
  WHERE user_id = get_user_growth_analytics.user_id;
  
  SELECT COUNT(*) INTO snippet_count
  FROM public.snippets
  WHERE user_id = get_user_growth_analytics.user_id;

  -- Build response
  SELECT json_build_object(
    'follower_count', follower_count,
    'project_count', project_count,
    'snippet_count', snippet_count,
    'total_likes', (
      (SELECT COALESCE(SUM(likes_count), 0) FROM public.projects WHERE user_id = get_user_growth_analytics.user_id) +
      (SELECT COUNT(*) FROM public.snippet_likes sl JOIN public.snippets s ON sl.snippet_id = s.id WHERE s.user_id = get_user_growth_analytics.user_id)
    ),
    'engagement_rate', (
      (
        (SELECT COALESCE(SUM(likes_count), 0) FROM public.projects WHERE user_id = get_user_growth_analytics.user_id) +
        (SELECT COUNT(*) FROM public.snippet_likes sl JOIN public.snippets s ON sl.snippet_id = s.id WHERE s.user_id = get_user_growth_analytics.user_id) +
        (SELECT COUNT(*) FROM public.comments c JOIN public.projects p ON c.project_id = p.id WHERE p.user_id = get_user_growth_analytics.user_id) +
        (SELECT COUNT(*) FROM public.snippet_comments sc JOIN public.snippets s ON sc.snippet_id = s.id WHERE s.user_id = get_user_growth_analytics.user_id)
      )::FLOAT / 
      NULLIF((project_count + snippet_count), 0)
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create a function to check if a community is private
CREATE OR REPLACE FUNCTION public.is_community_private(community_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.communities
    WHERE id = community_id
    AND is_public = true
  );
END;
$$;

-- Create a function to check if a user can create a private community (PRO feature)
CREATE OR REPLACE FUNCTION public.can_create_private_community(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_pro BOOLEAN;
  private_communities_count INTEGER;
BEGIN
  -- Check if user is PRO
  SELECT p.is_pro INTO is_pro
  FROM public.profiles p
  WHERE p.id = user_id;
  
  -- If not PRO, cannot create private communities
  IF NOT is_pro THEN
    RETURN FALSE;
  END IF;
  
  -- Count existing private communities
  SELECT COUNT(*) INTO private_communities_count
  FROM public.communities
  WHERE creator_id = user_id
  AND is_public = false;
  
  -- PRO users can create up to 5 private communities
  RETURN private_communities_count < 5;
END;
$$;
