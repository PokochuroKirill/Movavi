
-- Function to get a blog post by ID with author details
CREATE OR REPLACE FUNCTION public.get_blog_post_by_id(post_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_id UUID,
  profiles JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.title,
    bp.excerpt,
    bp.content,
    bp.category,
    bp.image_url,
    bp.created_at,
    bp.updated_at,
    bp.author_id,
    jsonb_build_object(
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ) as profiles
  FROM 
    blog_posts bp
  LEFT JOIN 
    profiles p ON bp.author_id = p.id
  WHERE 
    bp.id = post_id;
END;
$$;

-- Function to get related blog posts by category
CREATE OR REPLACE FUNCTION public.get_related_blog_posts(
  post_category TEXT,
  current_post_id UUID,
  limit_count INTEGER
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_id UUID,
  profiles JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.title,
    bp.excerpt,
    bp.content,
    bp.category,
    bp.image_url,
    bp.created_at,
    bp.updated_at,
    bp.author_id,
    jsonb_build_object(
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ) as profiles
  FROM 
    blog_posts bp
  LEFT JOIN 
    profiles p ON bp.author_id = p.id
  WHERE 
    bp.category = post_category AND
    bp.id != current_post_id
  ORDER BY
    bp.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get all blog posts with author details
CREATE OR REPLACE FUNCTION public.get_all_blog_posts()
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_id UUID,
  profiles JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.title,
    bp.excerpt,
    bp.content,
    bp.category,
    bp.image_url,
    bp.created_at,
    bp.updated_at,
    bp.author_id,
    jsonb_build_object(
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ) as profiles
  FROM 
    blog_posts bp
  LEFT JOIN 
    profiles p ON bp.author_id = p.id
  ORDER BY
    bp.created_at DESC;
END;
$$;
