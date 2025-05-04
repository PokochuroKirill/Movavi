
-- Function to increment community members count
CREATE OR REPLACE FUNCTION public.increment_community_members(community_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE communities
  SET members_count = COALESCE(members_count, 0) + 1
  WHERE id = community_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement community members count
CREATE OR REPLACE FUNCTION public.decrement_community_members(community_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE communities
  SET members_count = GREATEST(COALESCE(members_count, 0) - 1, 0)
  WHERE id = community_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
