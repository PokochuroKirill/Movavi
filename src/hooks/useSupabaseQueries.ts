
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "./use-toast";
import { Comment, ProjectLike, SavedProject } from "@/types/database";

// Function to fetch comments for a project
export const fetchComments = async (projectId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      project_id,
      profiles!comments_user_id_fkey(username, full_name, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Comment[];
};

// Function to post a comment
export const postComment = async (projectId: string, userId: string, content: string): Promise<Comment> => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      project_id: projectId,
      user_id: userId,
      content,
    })
    .select(`
      id,
      content,
      created_at,
      user_id,
      project_id,
      profiles!comments_user_id_fkey(username, full_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data as unknown as Comment;
};

// Function to delete a comment
export const deleteComment = async (commentId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

// Function to check if user has liked a project
export const hasUserLikedProject = async (projectId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .rpc('has_user_liked_project', { 
      project_id: projectId,
      user_id: userId
    });
    
  if (error) throw error;
  return data as boolean;
};

// Function to check if user has saved a project
export const hasUserSavedProject = async (projectId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .rpc('has_user_saved_project', { 
      project_id: projectId,
      user_id: userId
    });
    
  if (error) throw error;
  return data as boolean;
};

// Function to get project likes count
export const getProjectLikesCount = async (projectId: string): Promise<number> => {
  const { data, error } = await supabase
    .rpc('get_project_likes_count', { project_id: projectId });
    
  if (error) throw error;
  return data as number;
};

// Function to get project comments count
export const getProjectCommentsCount = async (projectId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId);
    
  if (error) throw error;
  return count || 0;
};

// Function to toggle project like
export const toggleProjectLike = async (projectId: string, userId: string, isLiked: boolean): Promise<boolean> => {
  if (isLiked) {
    // Remove like
    const { error } = await supabase
      .from('project_likes')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return false;
  } else {
    // Add like
    const { error } = await supabase
      .from('project_likes')
      .insert({ project_id: projectId, user_id: userId });
      
    if (error) throw error;
    return true;
  }
};

// Function to toggle project save
export const toggleProjectSave = async (projectId: string, userId: string, isSaved: boolean): Promise<boolean> => {
  if (isSaved) {
    // Remove from saved
    const { error } = await supabase
      .from('saved_projects')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return false;
  } else {
    // Add to saved
    const { error } = await supabase
      .from('saved_projects')
      .insert({ project_id: projectId, user_id: userId });
      
    if (error) throw error;
    return true;
  }
};

// Hook to handle comment operations
export const useComments = (projectId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchComments(projectId);
      setComments(data);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить комментарии",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для публикации комментария необходимо войти в систему",
        variant: "destructive"
      });
      return false;
    }

    if (!content.trim()) {
      toast({
        title: "Ошибка",
        description: "Комментарий не может быть пустым",
        variant: "destructive"
      });
      return false;
    }

    try {
      const newComment = await postComment(projectId, user.id, content);
      setComments([newComment, ...comments]);
      toast({
        title: "Комментарий опубликован",
        description: "Ваш комментарий был успешно опубликован",
      });
      return true;
    } catch (error: any) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось опубликовать комментарий",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для удаления комментария необходимо войти в систему",
        variant: "destructive"
      });
      return false;
    }

    try {
      await deleteComment(commentId, user.id);
      setComments(comments.filter(comment => comment.id !== commentId));
      toast({
        title: "Комментарий удален",
        description: "Ваш комментарий был успешно удален",
      });
      return true;
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить комментарий",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    comments,
    isLoading,
    loadComments,
    addComment,
    removeComment
  };
};

// Hook to handle project interactions (likes, saves)
export const useProjectInteractions = (projectId: string) => {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadInteractions = async () => {
    setIsLoading(true);
    try {
      // Get likes count
      const likesCount = await getProjectLikesCount(projectId);
      setLikes(likesCount);
      
      // Get comments count
      const commentsCount = await getProjectCommentsCount(projectId);
      setComments(commentsCount);
      
      // Check user interactions if logged in
      if (user) {
        const userLiked = await hasUserLikedProject(projectId, user.id);
        setLiked(userLiked);
        
        const userSaved = await hasUserSavedProject(projectId, user.id);
        setSaved(userSaved);
      }
    } catch (error: any) {
      console.error("Error loading interactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для оценки проекта необходимо войти",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newLikedState = await toggleProjectLike(projectId, user.id, liked);
      setLiked(newLikedState);
      setLikes(prev => newLikedState ? prev + 1 : prev - 1);
      
      toast({
        title: newLikedState ? "Проект оценен" : "Оценка удалена",
        description: newLikedState ? "Спасибо за вашу оценку!" : "Вы убрали оценку с проекта",
      });
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить оценку",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для сохранения проекта необходимо войти",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newSavedState = await toggleProjectSave(projectId, user.id, saved);
      setSaved(newSavedState);
      
      toast({
        title: newSavedState ? "Проект сохранен" : "Проект удален из сохраненных",
        description: newSavedState ? "Проект добавлен в вашу коллекцию" : "Проект был удален из вашей коллекции",
      });
    } catch (error: any) {
      console.error("Error toggling save:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус сохранения",
        variant: "destructive"
      });
    }
  };

  const setCommentsCount = (count: number) => {
    setComments(count);
  };

  return {
    likes,
    comments,
    liked,
    saved,
    isLoading,
    loadInteractions,
    handleLike,
    handleSave,
    setCommentsCount
  };
};
