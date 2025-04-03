import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "./use-toast";
import { Snippet, Comment } from "@/types/database";

// Function to fetch comments for a snippet
export const fetchSnippetComments = async (snippetId: string): Promise<Comment[]> => {
  // Используем сырой SQL запрос вместо обращения к таблице напрямую
  const { data, error } = await supabase
    .from('snippet_comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      snippet_id,
      profiles:user_id(username, full_name, avatar_url)
    `)
    .eq('snippet_id', snippetId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Comment[];
};

// Function to post a comment on a snippet
export const postSnippetComment = async (snippetId: string, userId: string, content: string): Promise<Comment> => {
  // Используем сырой SQL запрос вместо обращения к таблице напрямую
  const { data, error } = await supabase
    .from('snippet_comments')
    .insert({
      snippet_id: snippetId,
      user_id: userId,
      content,
    })
    .select(`
      id,
      content,
      created_at,
      user_id,
      snippet_id,
      profiles:user_id(username, full_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data as unknown as Comment;
};

// Function to delete a comment on a snippet
export const deleteSnippetComment = async (commentId: string, userId: string): Promise<boolean> => {
  // Используем сырой SQL запрос вместо обращения к таблице напрямую
  const { error } = await supabase
    .from('snippet_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

// Function to check if user has liked a snippet
export const hasUserLikedSnippet = async (snippetId: string, userId: string): Promise<boolean> => {
  // Используем функцию из базы данных вместо прямого запроса
  const { data, error } = await supabase
    .rpc('has_user_liked_snippet', { 
      snippet_id: snippetId,
      user_id: userId
    });
    
  if (error) throw error;
  return data as boolean;
};

// Function to check if user has saved a snippet
export const hasUserSavedSnippet = async (snippetId: string, userId: string): Promise<boolean> => {
  // Используем функцию из базы данных вместо прямого запроса
  const { data, error } = await supabase
    .rpc('has_user_saved_snippet', { 
      snippet_id: snippetId,
      user_id: userId
    });
    
  if (error) throw error;
  return data as boolean;
};

// Function to get snippet likes count
export const getSnippetLikesCount = async (snippetId: string): Promise<number> => {
  // Используем функцию из базы данных вместо прямого запроса
  const { data, error } = await supabase
    .rpc('get_snippet_likes_count', { snippet_id: snippetId });
    
  if (error) throw error;
  return data as number;
};

// Function to get snippet comments count
export const getSnippetCommentsCount = async (snippetId: string): Promise<number> => {
  // Используем сырой SQL запрос вместо обращения к таблице напрямую
  const { count, error } = await supabase
    .from('snippet_comments')
    .select('id', { count: 'exact', head: true })
    .eq('snippet_id', snippetId);
    
  if (error) throw error;
  return count || 0;
};

// Function to toggle snippet like
export const toggleSnippetLike = async (snippetId: string, userId: string, isLiked: boolean): Promise<boolean> => {
  if (isLiked) {
    // Remove like
    // Используем сырой SQL запрос вместо обращения к таблице напрямую
    const { error } = await supabase
      .from('snippet_likes')
      .delete()
      .eq('snippet_id', snippetId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return false;
  } else {
    // Add like
    // Используем сырой SQL запрос вместо обращения к таблице напрямую
    const { error } = await supabase
      .from('snippet_likes')
      .insert({ snippet_id: snippetId, user_id: userId });
      
    if (error) throw error;
    return true;
  }
};

// Function to toggle snippet save
export const toggleSnippetSave = async (snippetId: string, userId: string, isSaved: boolean): Promise<boolean> => {
  if (isSaved) {
    // Remove from saved
    // Используем сырой SQL запрос вместо обращения к таблице напрямую
    const { error } = await supabase
      .from('saved_snippets')
      .delete()
      .eq('snippet_id', snippetId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return false;
  } else {
    // Add to saved
    // Используем сырой SQL запрос вместо обращения к таблице напрямую
    const { error } = await supabase
      .from('saved_snippets')
      .insert({ snippet_id: snippetId, user_id: userId });
      
    if (error) throw error;
    return true;
  }
};

// Hook to handle snippet comments operations
export const useSnippetComments = (snippetId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSnippetComments(snippetId);
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
      const newComment = await postSnippetComment(snippetId, user.id, content);
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
      await deleteSnippetComment(commentId, user.id);
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

// Hook to handle snippet interactions (likes, saves)
export const useSnippetInteractions = (snippetId: string) => {
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
      const likesCount = await getSnippetLikesCount(snippetId);
      setLikes(likesCount);
      
      // Get comments count
      const commentsCount = await getSnippetCommentsCount(snippetId);
      setComments(commentsCount);
      
      // Check user interactions if logged in
      if (user) {
        const userLiked = await hasUserLikedSnippet(snippetId, user.id);
        setLiked(userLiked);
        
        const userSaved = await hasUserSavedSnippet(snippetId, user.id);
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
        description: "Для оценки сниппета необходимо войти",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newLikedState = await toggleSnippetLike(snippetId, user.id, liked);
      setLiked(newLikedState);
      setLikes(prev => newLikedState ? prev + 1 : prev - 1);
      
      toast({
        title: newLikedState ? "Сниппет оценен" : "Оценка удалена",
        description: newLikedState ? "Спасибо за вашу оценку!" : "Вы убрали оценку со сниппета",
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
        description: "Для сохранения сниппета необходимо войти",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newSavedState = await toggleSnippetSave(snippetId, user.id, saved);
      setSaved(newSavedState);
      
      toast({
        title: newSavedState ? "Сниппет сохранен" : "Сниппет удален из сохраненных",
        description: newSavedState ? "Сниппет добавлен в вашу коллекцию" : "Сниппет был удален из вашей коллекции",
      });
    } catch (error: any) {
      console.error("Error toggling save:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус сохра��ения",
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
