
-- Function to get the current members count for a community
CREATE OR REPLACE FUNCTION public.get_members_count(community_id uuid)
RETURNS integer AS $$
DECLARE
  count_members INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_members
  FROM public.community_members
  WHERE community_id = $1;
  
  RETURN count_members;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
