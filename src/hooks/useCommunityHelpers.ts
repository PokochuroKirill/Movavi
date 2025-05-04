
import { useCallback, useEffect, useState } from 'react';
import { useToast } from "./use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Community, CommunityMember } from '@/types/database';

export const useCommunityDetails = (communityId: string) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCommunityDetails = useCallback(async () => {
    if (!communityId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
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
          profiles!community_members_user_id_fkey(username, full_name, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
      
      if (membersError) throw membersError;
      
      setCommunity(communityData as Community);
      setMembers(membersData as CommunityMember[]);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching community details:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные сообщества",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [communityId, toast]);

  useEffect(() => {
    fetchCommunityDetails();
  }, [fetchCommunityDetails]);

  return {
    community,
    members,
    loading,
    error,
    refetch: fetchCommunityDetails
  };
};

export const useCommunityAccess = (communityId: string, userId: string | undefined) => {
  const [isMember, setIsMember] = useState(false);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const checkMembershipStatus = useCallback(async () => {
    if (!communityId || !userId) {
      setLoading(false);
      return;
    }
    
    try {
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
      console.error("Error checking membership:", err);
    } finally {
      setLoading(false);
    }
  }, [communityId, userId]);
  
  useEffect(() => {
    checkMembershipStatus();
  }, [checkMembershipStatus]);
  
  const joinCommunity = async () => {
    if (!userId || !communityId) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Check if already a member
      if (isMember) return true;
      
      // Add as member
      const { error } = await supabase
        .from('community_members')
        .insert({
          user_id: userId,
          community_id: communityId,
          role: 'member'
        });
      
      if (error) throw error;
      
      // Update membership status
      setIsMember(true);
      setMemberRole('member');
      
      // Update members count
      await supabase.rpc('increment_community_members', {
        community_id: communityId
      });
      
      toast({
        title: "Успешно",
        description: "Вы присоединились к сообществу"
      });
      
      return true;
    } catch (err) {
      console.error("Error joining community:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к сообществу",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const leaveCommunity = async () => {
    if (!userId || !communityId) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Check if not a member
      if (!isMember) return true;
      
      // Remove membership
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('user_id', userId)
        .eq('community_id', communityId);
      
      if (error) throw error;
      
      // Update membership status
      setIsMember(false);
      setMemberRole(null);
      
      // Update members count
      await supabase.rpc('decrement_community_members', {
        community_id: communityId
      });
      
      toast({
        title: "Успешно",
        description: "Вы вышли из сообщества"
      });
      
      return true;
    } catch (err) {
      console.error("Error leaving community:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из сообщества",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    isMember,
    memberRole,
    loading,
    joinCommunity,
    leaveCommunity,
    refreshStatus: checkMembershipStatus
  };
};
