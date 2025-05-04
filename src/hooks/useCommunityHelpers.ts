
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useCommunityHelpers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Function to check if user is a member of a community
  const checkMembership = async (communityId: string, userId: string) => {
    if (!communityId || !userId) return false;
    
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  };
  
  // Function to join a community
  const joinCommunity = async (communityId: string, userId: string) => {
    if (!communityId || !userId) {
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к сообществу",
        variant: "destructive",
      });
      return false;
    }
    
    setLoading(true);
    
    try {
      // Check if already a member
      const isMember = await checkMembership(communityId, userId);
      
      if (isMember) {
        toast({
          title: "Информация",
          description: "Вы уже являетесь участником этого сообщества",
        });
        setLoading(false);
        return true;
      }
      
      // Insert new member
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: userId,
          role: 'member' // Default role
        });
      
      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Вы присоединились к сообществу",
      });
      
      return true;
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к сообществу. Попробуйте позже.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to leave a community
  const leaveCommunity = async (communityId: string, userId: string) => {
    if (!communityId || !userId) {
      toast({
        title: "Ошибка",
        description: "Не удалось покинуть сообщество",
        variant: "destructive",
      });
      return false;
    }
    
    setLoading(true);
    
    try {
      // Check membership first
      const isMember = await checkMembership(communityId, userId);
      
      if (!isMember) {
        toast({
          title: "Информация",
          description: "Вы не являетесь участником этого сообщества",
        });
        setLoading(false);
        return true;
      }
      
      // Remove membership
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Вы покинули сообщество",
      });
      
      return true;
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось покинуть сообщество. Попробуйте позже.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to get members count
  const getMembersCount = async (communityId: string) => {
    if (!communityId) return 0;
    
    try {
      const { data, error } = await supabase
        .rpc('get_members_count', { 
          community_id: communityId 
        });
      
      if (error) {
        console.error('Error calling RPC:', error);
        // Fallback to manual count if RPC fails
        const { count, countError } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', communityId);
          
        if (countError) throw countError;
        return count || 0;
      }
      return data || 0;
    } catch (error) {
      console.error('Error getting members count:', error);
      return 0;
    }
  };
  
  // Function to get admin status for a user in community
  const checkIsAdmin = async (communityId: string, userId: string) => {
    if (!communityId || !userId) return false;
    
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.role === 'admin' || data?.role === 'owner';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Function to get owner status for a user in community
  const checkIsOwner = async (communityId: string, userId: string) => {
    if (!communityId || !userId) return false;
    
    try {
      // First check the membership table for owner role
      const { data: memberData, error: memberError } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (memberError) throw memberError;
      
      // If user has owner role in members table
      if (memberData?.role === 'owner') return true;
      
      // Also check the communities table for creator_id
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('creator_id')
        .eq('id', communityId)
        .maybeSingle();
      
      if (communityError) throw communityError;
      
      // If user is the creator of the community
      return communityData?.creator_id === userId;
    } catch (error) {
      console.error('Error checking owner status:', error);
      return false;
    }
  };

  return {
    checkMembership,
    joinCommunity,
    leaveCommunity,
    getMembersCount,
    checkIsAdmin,
    checkIsOwner,
    loading
  };
}

// Now let's add the missing hooks that were being imported in CommunityDetailPage.tsx

// Hook to get community details
export function useCommunityDetails(communityId: string) {
  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunityData = async () => {
    setLoading(true);
    
    try {
      // Fetch community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select(`
          *,
          creator:creator_id(username, full_name, avatar_url)
        `)
        .eq('id', communityId)
        .single();
      
      if (communityError) throw communityError;
      
      // Fetch community members
      const { data: membersData, error: membersError } = await supabase
        .from('community_members')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('role', { ascending: false });
        
      if (membersError) throw membersError;

      setCommunity(communityData);
      setMembers(membersData || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching community details:', err);
      setError(err.message || 'Failed to load community details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId]);

  const refetch = () => {
    fetchCommunityData();
  };

  return { community, members, loading, error, refetch };
}

// Hook to check and manage user access to a community
export function useCommunityAccess(communityId: string, userId: string | undefined) {
  const [isMember, setIsMember] = useState(false);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const helpers = useCommunityHelpers();

  const checkStatus = async () => {
    setLoading(true);
    
    try {
      if (!userId || !communityId) {
        setIsMember(false);
        setMemberRole(null);
        return;
      }
      
      // Check if user is a member
      const { data, error } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      setIsMember(!!data);
      setMemberRole(data?.role || null);
    } catch (err) {
      console.error('Error checking community access:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [communityId, userId]);

  const joinCommunity = async () => {
    if (!userId) {
      toast({
        title: "Требуется авторизация",
        description: "Для присоединения к сообществу необходимо войти в систему",
        variant: "destructive"
      });
      return false;
    }
    
    const result = await helpers.joinCommunity(communityId, userId);
    if (result) {
      await checkStatus();
    }
    
    return result;
  };

  const leaveCommunity = async () => {
    if (!userId) return false;
    
    const result = await helpers.leaveCommunity(communityId, userId);
    if (result) {
      await checkStatus();
    }
    
    return result;
  };

  return {
    isMember,
    memberRole,
    loading,
    joinCommunity,
    leaveCommunity,
    refreshStatus: checkStatus
  };
}
