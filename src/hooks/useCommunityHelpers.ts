
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Community, CommunityMember } from '@/types/database';

export interface CommunityAccess {
  isMember: boolean;
  memberRole: 'admin' | 'moderator' | 'member' | null;
  loading: boolean;
  joinCommunity: () => Promise<boolean>;
  leaveCommunity: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

export interface CommunityDetails {
  community: Community | null;
  members: CommunityMember[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useCommunityDetails = (communityId: string): CommunityDetails => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCommunityDetails = useCallback(async () => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*, creator:creator_id(username, full_name, avatar_url)')
        .eq('id', communityId)
        .single();

      if (communityError) throw communityError;
      setCommunity(communityData);

      // Fetch community members
      const { data: membersData, error: membersError } = await supabase
        .from('community_members')
        .select('*, profiles(*)')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (membersError) throw membersError;
      
      // Ensure proper typing for community members
      const typedMembers = membersData?.map(member => ({
        ...member,
        role: member.role as 'admin' | 'moderator' | 'member'
      })) || [];
      
      setMembers(typedMembers);

      setError(null);
    } catch (err: any) {
      console.error('Error fetching community details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  // Fetch on mount and when communityId changes
  useState(() => {
    fetchCommunityDetails();
  });

  return {
    community,
    members,
    loading,
    error,
    refetch: fetchCommunityDetails
  };
};

export const useCommunityAccess = (communityId: string, userId?: string): CommunityAccess => {
  const { toast } = useToast();
  const [isMember, setIsMember] = useState<boolean>(false);
  const [memberRole, setMemberRole] = useState<'admin' | 'moderator' | 'member' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkMembershipStatus = useCallback(async () => {
    if (!userId || !communityId) {
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
      
      if (data && typeof data.role === 'string') {
        const role = data.role as 'admin' | 'moderator' | 'member';
        setMemberRole(role);
      } else {
        setMemberRole(null);
      }
    } catch (error) {
      console.error('Error checking community membership:', error);
    } finally {
      setLoading(false);
    }
  }, [communityId, userId]);

  // Check membership on mount and when dependencies change
  useState(() => {
    checkMembershipStatus();
  });

  const joinCommunity = async (): Promise<boolean> => {
    if (!userId || !communityId) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо войти в систему для присоединения к сообществу',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // First check if already a member
      const { data: existingMember } = await supabase
        .from('community_members')
        .select('id')
        .eq('user_id', userId)
        .eq('community_id', communityId)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: 'Уведомление',
          description: 'Вы уже являетесь участником этого сообщества',
        });
        return true;
      }

      // Add the user to the community
      const { error: joinError } = await supabase
        .from('community_members')
        .insert({
          user_id: userId,
          community_id: communityId,
          role: 'member'
        });

      if (joinError) throw joinError;
      
      // Use a direct SQL update to increment members count
      const { error: updateError } = await supabase
        .from('communities')
        .update({ members_count: supabase.rpc('get_members_count', { community_id: communityId }) + 1 })
        .eq('id', communityId);
      
      if (updateError) {
        console.error('Error incrementing members count:', updateError);
      }

      toast({
        title: 'Успех',
        description: 'Вы присоединились к сообществу',
      });
      
      setIsMember(true);
      setMemberRole('member');
      
      return true;
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось присоединиться к сообществу',
        variant: 'destructive',
      });
      return false;
    }
  };

  const leaveCommunity = async (): Promise<boolean> => {
    if (!userId || !communityId) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо войти в систему',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error: leaveError } = await supabase
        .from('community_members')
        .delete()
        .eq('user_id', userId)
        .eq('community_id', communityId);

      if (leaveError) throw leaveError;
      
      // Use a direct SQL update to decrement members count
      const { error: updateError } = await supabase
        .from('communities')
        .update({ 
          members_count: supabase.rpc('get_members_count', { community_id: communityId }) - 1 
        })
        .eq('id', communityId);
      
      if (updateError) {
        console.error('Error decrementing members count:', updateError);
      }

      toast({
        title: 'Успех',
        description: 'Вы вышли из сообщества',
      });
      
      setIsMember(false);
      setMemberRole(null);
      
      return true;
    } catch (error: any) {
      console.error('Error leaving community:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось выйти из сообщества',
        variant: 'destructive',
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
