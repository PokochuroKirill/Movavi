
import { supabase } from "@/integrations/supabase/client";
import { Profile, UserFollow, Project, Snippet } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

// Function to get profile data by ID
export const fetchProfileById = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    
    return data as Profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// Function to get profile data by username
export const fetchProfileByUsername = async (username: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) throw error;
    
    return data as Profile;
  } catch (error) {
    console.error("Error fetching profile by username:", error);
    return null;
  }
};

// Function to get user projects
export const fetchUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        profiles:user_id(username, full_name, avatar_url)
      `)
      .eq("user_id", userId);

    if (error) throw error;
    
    if (!data) return [];
    
    const projectsWithCounts = await Promise.all(data.map(async (project) => {
      const { data: likesCount } = await supabase
        .rpc("get_project_likes_count", { project_id: project.id });
      
      const { count: commentsCount } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("project_id", project.id);
      
      return {
        ...project,
        author: project.profiles?.full_name || project.profiles?.username || 'Unnamed Author',
        authorAvatar: project.profiles?.avatar_url,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0
      } as Project;
    }));

    return projectsWithCounts;
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return [];
  }
};

// Function to get user snippets
export const fetchUserSnippets = async (userId: string): Promise<Snippet[]> => {
  try {
    const { data, error } = await supabase
      .from("snippets")
      .select(`
        *,
        profiles:user_id(username, full_name, avatar_url)
      `)
      .eq("user_id", userId);

    if (error) throw error;
    
    if (!data) return [];
    
    const snippetsWithCounts = await Promise.all(data.map(async (snippet) => {
      // Get likes count for each snippet
      const { data: likesCount } = await supabase
        .rpc("get_snippet_likes_count", { snippet_id: snippet.id });
      
      // Get comments count for each snippet
      const { count: commentsCount } = await supabase
        .from("snippet_comments")
        .select("id", { count: "exact", head: true })
        .eq("snippet_id", snippet.id);
      
      return {
        ...snippet,
        author: snippet.profiles?.full_name || snippet.profiles?.username || 'Unnamed Author',
        authorAvatar: snippet.profiles?.avatar_url,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0
      } as Snippet;
    }));

    return snippetsWithCounts;
  } catch (error) {
    console.error("Error fetching user snippets:", error);
    return [];
  }
};

// Function to check if a user is following another user
export const isFollowingUser = async (
  followerId: string,
  followingId: string
): Promise<boolean> => {
  try {
    // Use direct query instead of rpc
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) {
      console.error("Error checking follow status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking if following user:", error);
    return false;
  }
};

// Function to follow a user
export const followUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    // Use direct insert instead of rpc
    const { data, error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select('id')
      .maybeSingle();

    if (error && error.code !== '23505') { // Ignore unique violation errors
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error following user:", error);
    return false;
  }
};

// Function to unfollow a user
export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    // Use direct delete instead of rpc
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return false;
  }
};

// Function to get the followers of a user
export const fetchFollowers = async (userId: string): Promise<Profile[]> => {
  try {
    // First get all follower IDs
    const { data: followData, error: followError } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', userId);

    if (followError) throw followError;
    if (!followData || followData.length === 0) return [];
    
    // Then get profiles for these IDs
    const followerIds = followData.map(item => item.follower_id);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', followerIds);
      
    if (profilesError) throw profilesError;
    
    return profilesData as Profile[] || [];
  } catch (error) {
    console.error("Error fetching followers:", error);
    return [];
  }
};

// Function to get the users that a user is following
export const fetchFollowing = async (userId: string): Promise<Profile[]> => {
  try {
    // First get all following IDs
    const { data: followData, error: followError } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) throw followError;
    if (!followData || followData.length === 0) return [];
    
    // Then get profiles for these IDs
    const followingIds = followData.map(item => item.following_id);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', followingIds);
      
    if (profilesError) throw profilesError;
    
    return profilesData as Profile[] || [];
  } catch (error) {
    console.error("Error fetching following:", error);
    return [];
  }
};

// Function to count followers and following
export const fetchFollowCounts = async (
  userId: string
): Promise<{ followers: number; following: number }> => {
  try {
    // Count followers
    const { count: followersCount, error: followersError } = await supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followersError) throw followersError;

    // Count following
    const { count: followingCount, error: followingError } = await supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (followingError) throw followingError;

    return {
      followers: followersCount || 0,
      following: followingCount || 0,
    };
  } catch (error) {
    console.error("Error fetching follow counts:", error);
    return { followers: 0, following: 0 };
  }
};

// Function to update profile
export const updateProfile = async (
  userId: string,
  profileData: Partial<Profile>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    return false;
  }
};

// Functions to upload profile banner
export const uploadProfileBanner = async (
  userId: string,
  file: File
): Promise<string | null> => {
  try {
    // Upload banner to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-banner.${fileExt}`;
    const filePath = `banners/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
    
    const bannerUrl = data.publicUrl;
    
    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ banner_url: bannerUrl })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    return bannerUrl;
  } catch (error) {
    console.error("Error uploading banner:", error);
    return null;
  }
};

// Custom hook for profile operations
export const useProfileOperations = () => {
  const { toast } = useToast();
  
  const handleFollowToggle = async (
    currentUserId: string,
    profileUserId: string,
    currentlyFollowing: boolean
  ) => {
    try {
      let success;
      
      if (currentlyFollowing) {
        success = await unfollowUser(currentUserId, profileUserId);
        if (success) {
          toast({
            title: "Отписка выполнена",
            description: "Вы больше не подписаны на этого пользователя"
          });
        }
      } else {
        success = await followUser(currentUserId, profileUserId);
        if (success) {
          toast({
            title: "Подписка выполнена",
            description: "Вы теперь подписаны на этого пользователя"
          });
        }
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус подписки",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleProfileUpdate = async (userId: string, data: Partial<Profile>) => {
    try {
      const success = await updateProfile(userId, data);
      
      if (success) {
        toast({
          title: "Успех",
          description: "Профиль успешно обновлен"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить профиль",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    handleFollowToggle,
    handleProfileUpdate
  };
};
