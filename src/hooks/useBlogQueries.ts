
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

// Function to fetch all blog posts
export const fetchAllBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const { data, error } = await supabase.rpc('get_all_blog_posts');
    
    if (error) throw error;
    
    return data as BlogPost[] || [];
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
};

// Function to fetch a blog post by id
export const fetchBlogPostById = async (postId: string): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase.rpc('get_blog_post_by_id', { post_id: postId });
    
    if (error) throw error;
    
    if (!data || data.length === 0) return null;
    
    return data as BlogPost;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
};

// Function to create a new blog post
export const createBlogPost = async (
  authorId: string,
  postData: Omit<BlogPost, 'id' | 'author_id' | 'created_at' | 'updated_at'>
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...postData,
        author_id: authorId
      })
      .select('id')
      .single();
      
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error("Error creating blog post:", error);
    return null;
  }
};

// Function to update a blog post
export const updateBlogPost = async (
  postId: string,
  postData: Partial<BlogPost>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', postId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating blog post:", error);
    return false;
  }
};

// Function to delete a blog post
export const deleteBlogPost = async (postId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return false;
  }
};

// Custom hook for blog operations
export const useBlogOperations = () => {
  const { toast } = useToast();
  
  const handleCreateBlogPost = async (
    authorId: string,
    postData: Omit<BlogPost, 'id' | 'author_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const postId = await createBlogPost(authorId, postData);
      
      if (postId) {
        toast({
          title: "Успех",
          description: "Запись блога успешно создана"
        });
        return postId;
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось создать запись блога",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать запись блога",
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleUpdateBlogPost = async (
    postId: string,
    postData: Partial<BlogPost>
  ) => {
    try {
      const success = await updateBlogPost(postId, postData);
      
      if (success) {
        toast({
          title: "Успех",
          description: "Запись блога успешно обновлена"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить запись блога",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить запись блога",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleDeleteBlogPost = async (postId: string) => {
    try {
      const success = await deleteBlogPost(postId);
      
      if (success) {
        toast({
          title: "Успех",
          description: "Запись блога успешно удалена"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить запись блога",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить запись блога",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    handleCreateBlogPost,
    handleUpdateBlogPost,
    handleDeleteBlogPost
  };
};
