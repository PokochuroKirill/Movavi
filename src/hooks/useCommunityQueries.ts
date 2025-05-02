import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Community, CommunityMember, CommunityPost, CommunityComment, CommunityPostLike } from "@/types/database";
import { incrementCounter, decrementCounter } from "@/utils/dbFunctions";

// Функция для получения списка всех сообществ
export const fetchCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      profiles:creator_id (username, full_name, avatar_url)
    `)
    .eq('is_public', true)
    .order('members_count', { ascending: false });

  if (error) throw error;
  return data as unknown as Community[];
};

// Функция для получения сообщества по ID
export const fetchCommunityById = async (communityId: string): Promise<Community> => {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      profiles:creator_id (username, full_name, avatar_url)
    `)
    .eq('id', communityId)
    .single();

  if (error) throw error;
  return data as unknown as Community;
};

// Функция для получения списка участников сообщества
export const fetchCommunityMembers = async (communityId: string): Promise<CommunityMember[]> => {
  const { data, error } = await supabase
    .from('community_members')
    .select(`
      *,
      profiles:user_id (username, full_name, avatar_url)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as CommunityMember[];
};

// Функция для получения списка публикаций сообщества
export const fetchCommunityPosts = async (communityId: string): Promise<CommunityPost[]> => {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      profiles:user_id (username, full_name, avatar_url)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as CommunityPost[];
};

// Функция для получения публикации по ID
export const fetchPostById = async (postId: string): Promise<CommunityPost> => {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      profiles:user_id (username, full_name, avatar_url)
    `)
    .eq('id', postId)
    .single();

  if (error) throw error;
  return data as unknown as CommunityPost;
};

// Функция для получения комментариев к публикации
export const fetchPostComments = async (postId: string): Promise<CommunityComment[]> => {
  const { data, error } = await supabase
    .from('community_comments')
    .select(`
      *,
      profiles:user_id (username, full_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as CommunityComment[];
};

// Функция для создания комментария к публикации
export const createPostComment = async (
  postId: string,
  userId: string,
  content: string
): Promise<CommunityComment> => {
  const { data, error } = await supabase
    .from('community_comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content
    })
    .select(`
      *,
      profiles:user_id (username, full_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  
  // Обновляем счетчик комментариев публикации
  await incrementCounter('community_posts', 'comments_count', postId);

  return data as unknown as CommunityComment;
};

// Функция для удаления комментария к публикации
export const deletePostComment = async (commentId: string, userId: string, postId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('community_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw error;
  
  // Обновляем счетчик комментариев публикации
  await decrementCounter('community_posts', 'comments_count', postId);
  
  return true;
};

// Функция для проверки, является ли пользователь участником сообщества
export const checkIfMember = async (communityId: string, userId: string): Promise<{ isMember: boolean, role?: string }> => {
  const { data, error } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return { isMember: false };
  }
  
  return { isMember: true, role: data.role };
};

// Функция для присоединения к сообществу
export const joinCommunity = async (communityId: string, userId: string): Promise<CommunityMember> => {
  const { data, error } = await supabase
    .from('community_members')
    .insert({
      community_id: communityId,
      user_id: userId,
      role: 'member'
    })
    .select()
    .single();

  if (error) throw error;
  
  // Обновляем счетчик участников сообщества
  await incrementCounter('communities', 'members_count', communityId);

  return data as CommunityMember;
};

// Функция для выхода из сообщества
export const leaveCommunity = async (communityId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId);

  if (error) throw error;
  
  // Обновляем счетчик участников сообщества
  await decrementCounter('communities', 'members_count', communityId);

  return true;
};

// Функция для проверки, лайкнул ли пользователь публикацию
export const checkIfLikedPost = async (postId: string, userId: string): Promise<boolean> => {
  // Вручную создаем запрос, так как таблица может отсутствовать в типах
  const { data, error } = await supabase
    .from('community_post_likes')
    .select()
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking like:', error);
    return false;
  }
  
  return !!data;
};

// Функция для лайка/дизлайка публикации
export const togglePostLike = async (
  postId: string, 
  userId: string, 
  isLiked: boolean
): Promise<boolean> => {
  if (isLiked) {
    // Убираем лайк
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    
    // Обновляем счетчик лайков публикации
    await decrementCounter('community_posts', 'likes_count', postId);
      
    return false;
  } else {
    // Добавляем лайк
    const { error } = await supabase
      .from('community_post_likes')
      .insert({
        post_id: postId,
        user_id: userId
      });

    if (error) throw error;
    
    // Обновляем счетчик лайков публикации
    await incrementCounter('community_posts', 'likes_count', postId);
      
    return true;
  }
};

// Хук для работы с сообществами
export const useCommunity = (communityId: string) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberStatus, setMemberStatus] = useState({ isMember: false, isAdmin: false });
  const { user } = useAuth();
  const { toast } = useToast();
  
  const loadCommunityData = async () => {
    setLoading(true);
    try {
      // Загружаем данные сообщества
      const communityData = await fetchCommunityById(communityId);
      setCommunity(communityData);
      
      // Загружаем участников сообщества
      const membersData = await fetchCommunityMembers(communityId);
      setMembers(membersData);
      
      // Загружаем публикации сообщества
      const postsData = await fetchCommunityPosts(communityId);
      setPosts(postsData);
      
      // Проверяем членство пользователя
      if (user) {
        const { isMember, role } = await checkIfMember(communityId, user.id);
        setMemberStatus({
          isMember,
          isAdmin: role === 'admin' || role === 'moderator'
        });
      }
    } catch (error: any) {
      console.error('Error loading community data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные сообщества',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinCommunity = async () => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для присоединения к сообществу необходимо войти',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await joinCommunity(communityId, user.id);
      setMemberStatus({ ...memberStatus, isMember: true });
      
      // Обновляем список участников
      const membersData = await fetchCommunityMembers(communityId);
      setMembers(membersData);
      
      toast({
        description: 'Вы успешно присоединились к сообществу'
      });
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось присоединиться к сообществу',
        variant: 'destructive'
      });
    }
  };
  
  const handleLeaveCommunity = async () => {
    if (!user) return;
    
    try {
      await leaveCommunity(communityId, user.id);
      setMemberStatus({ isMember: false, isAdmin: false });
      
      // Обновляем список участников
      const membersData = await fetchCommunityMembers(communityId);
      setMembers(membersData);
      
      toast({
        description: 'Вы покинули сообщество'
      });
    } catch (error: any) {
      console.error('Error leaving community:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось покинуть сообщество',
        variant: 'destructive'
      });
    }
  };
  
  return {
    community,
    members,
    posts,
    loading,
    isMember: memberStatus.isMember,
    isAdmin: memberStatus.isAdmin,
    loadCommunityData,
    handleJoinCommunity,
    handleLeaveCommunity
  };
};

// Хук для работы с публикациями сообщества
export const useCommunityPost = (postId: string) => {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const loadPostData = async () => {
    setLoading(true);
    try {
      // Загружаем данные публикации
      const postData = await fetchPostById(postId);
      setPost(postData);
      
      // Загружаем комментарии к публикации
      const commentsData = await fetchPostComments(postId);
      setComments(commentsData);
      
      // Проверяем, поставил ли пользователь лайк
      if (user) {
        const userLiked = await checkIfLikedPost(postId, user.id);
        setIsLiked(userLiked);
      }
    } catch (error: any) {
      console.error('Error loading post data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные публикации',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для оценки публикации необходимо войти',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const newLikedState = await togglePostLike(postId, user.id, isLiked);
      setIsLiked(newLikedState);
      
      if (post) {
        const likesCount = post.likes_count || 0;
        setPost({
          ...post,
          likes_count: newLikedState ? likesCount + 1 : Math.max(0, likesCount - 1)
        });
      }
      
      toast({
        description: newLikedState ? 'Вам понравилась публикация' : 'Вы убрали лайк с публикации'
      });
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить оценку',
        variant: 'destructive'
      });
    }
  };
  
  const handleAddComment = async (content: string) => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для публикации комментария необходимо войти',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!content.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Комментарий не может быть пустым',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      const newComment = await createPostComment(postId, user.id, content);
      setComments([newComment, ...comments]);
      
      if (post) {
        const commentsCount = post.comments_count || 0;
        setPost({
          ...post,
          comments_count: commentsCount + 1
        });
      }
      
      toast({
        description: 'Комментарий добавлен'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!user || !post) return;
    
    try {
      await deletePostComment(commentId, user.id, postId);
      setComments(comments.filter(comment => comment.id !== commentId));
      
      const commentsCount = post.comments_count || 0;
      setPost({
        ...post,
        comments_count: Math.max(0, commentsCount - 1)
      });
      
      toast({
        description: 'Комментарий удален'
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить комментарий',
        variant: 'destructive'
      });
    }
  };
  
  return {
    post,
    comments,
    isLiked,
    loading,
    loadPostData,
    handleLikeToggle,
    handleAddComment,
    handleDeleteComment
  };
};
