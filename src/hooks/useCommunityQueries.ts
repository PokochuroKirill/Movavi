
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Community, CommunityMember, CommunityPost, CommunityComment } from '@/types/database';

// Function to fetch community details
export const fetchCommunityById = async (id: string): Promise<Community | null> => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        creator:creator_id(username, full_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching community:', error);
    return null;
  }
};

// Function to fetch community members
export const fetchCommunityMembers = async (communityId: string): Promise<CommunityMember[]> => {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        *,
        profiles:user_id(username, full_name, avatar_url)
      `)
      .eq('community_id', communityId)
      .order('role', { ascending: false });

    if (error) throw error;
    
    const typedData: CommunityMember[] = data ? data.map(member => ({
      ...member,
      role: member.role as "admin" | "moderator" | "member"
    })) : [];
    
    return typedData;
  } catch (error) {
    console.error('Error fetching community members:', error);
    return [];
  }
};

// Function to fetch community posts
export const fetchCommunityPosts = async (communityId: string): Promise<CommunityPost[]> => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles:user_id(username, full_name, avatar_url)
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }
};

// Function to fetch a single post
export const fetchPostById = async (postId: string): Promise<CommunityPost | null> => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles:user_id(username, full_name, avatar_url)
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
};

// Function to create a community post
export const createCommunityPost = async (
  communityId: string,
  userId: string,
  title: string,
  content: string
): Promise<CommunityPost | null> => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        community_id: communityId,
        user_id: userId,
        title,
        content
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

// Function to check if a user is a member of a community
export const isUserMember = async (communityId: string, userId: string): Promise<boolean> => {
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
export const joinCommunity = async (communityId: string, userId: string): Promise<boolean> => {
  try {
    // Проверяем, не заблокирован ли пользователь
    const { data: banCheck } = await supabase
      .from('community_banned_users')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .maybeSingle();

    if (banCheck) {
      throw new Error('Вы заблокированы в этом сообществе');
    }

    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: userId,
        role: 'member'
      });

    if (error) throw error;

    // Обновляем счетчик участников
    await supabase.rpc('increment_community_members', { community_id: communityId });

    return true;
  } catch (error) {
    console.error('Error joining community:', error);
    return false;
  }
};

// Function to leave a community
export const leaveCommunity = async (communityId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);

    if (error) throw error;

    // Обновляем счетчик участников
    await supabase.rpc('decrement_community_members', { community_id: communityId });

    return true;
  } catch (error) {
    console.error('Error leaving community:', error);
    return false;
  }
};

// Hook for post likes functionality
export const usePostLikes = (postId: string) => {
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkUserLike = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking user like:', error);
      return false;
    }
  };

  const loadLikes = async () => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('community_post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      if (error) throw error;
      setLikesCount(count || 0);

      if (user) {
        const hasLiked = await checkUserLike(user.id);
        setUserLiked(hasLiked);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeLike = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для оценки поста необходимо войти",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('community_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      setLikesCount(Math.max(0, likesCount - 1));
      setUserLiked(false);
      return true;
    } catch (error) {
      console.error('Error removing like:', error);
      return false;
    }
  };

  const addLike = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для оценки поста необходимо войти",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('community_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });
        
      if (error) throw error;
      setLikesCount(likesCount + 1);
      setUserLiked(true);
      return true;
    } catch (error) {
      console.error('Error adding like:', error);
      return false;
    }
  };

  const toggleLike = async () => {
    if (userLiked) {
      await removeLike();
    } else {
      await addLike();
    }
  };

  return {
    likesCount,
    userLiked,
    loading,
    loadLikes,
    toggleLike,
    addLike,
    removeLike
  };
};

export default {
  fetchCommunityById,
  fetchCommunityMembers,
  fetchCommunityPosts,
  fetchPostById,
  createCommunityPost,
  isUserMember,
  joinCommunity,
  leaveCommunity,
  usePostLikes
};
