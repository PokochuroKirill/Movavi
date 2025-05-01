
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
    
    // Cast to Profile to ensure type safety
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
    
    // Cast to Profile to ensure type safety
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
        likes: likesCount || 0,
        comments: commentsCount || 0
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
        likes: likesCount || 0,
        comments: commentsCount || 0
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
    
    // Explicitly cast to Profile[] to ensure type safety
    return profilesData as Profile[];
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
    
    // Explicitly cast to Profile[] to ensure type safety
    return profilesData as Profile[];
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

// Function to remove profile banner
export const removeProfileBanner = async (userId: string): Promise<boolean> => {
  try {
    // Get current profile to check if banner exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('banner_url')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    if (profileData.banner_url) {
      // Extract filename from URL
      const filePath = profileData.banner_url.split('/').pop();
      
      if (filePath) {
        // Remove file from storage
        const { error: removeError } = await supabase.storage
          .from('profiles')
          .remove([`banners/${filePath}`]);
          
        if (removeError) {
          console.warn("Error removing banner file:", removeError);
          // Continue anyway to update the profile
        }
      }
    }
    
    // Update profile to remove banner URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ banner_url: null })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error("Error removing banner:", error);
    return false;
  }
};

// Check if username can be changed
export const canChangeUsername = async (userId: string): Promise<{ canChange: boolean, daysRemaining: number }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('last_username_change')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Error checking username change:", error);
      return { canChange: false, daysRemaining: 30 };
    }
    
    if (!data.last_username_change) {
      return { canChange: true, daysRemaining: 0 };
    }
    
    const lastChange = new Date(data.last_username_change);
    const now = new Date();
    
    // Calculate the difference in days
    const diffTime = now.getTime() - lastChange.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Username can be changed once per 30 days
    if (diffDays >= 30) {
      return { canChange: true, daysRemaining: 0 };
    } else {
      return { canChange: false, daysRemaining: 30 - diffDays };
    }
  } catch (error) {
    console.error("Error checking username change:", error);
    return { canChange: false, daysRemaining: 30 };
  }
};

// Functions to upload profile banner
export const uploadProfileBanner = async (
  userId: string,
  file: File
): Promise<string | null> => {
  try {
    console.log("Starting banner upload for user:", userId);
    
    // Upload banner to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-banner.${fileExt}`;
    const filePath = `banners/${fileName}`;
    
    console.log("Uploading to path:", filePath);
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }
    
    console.log("Upload successful, getting public URL");
    
    // Get public URL
    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
    
    const bannerUrl = data.publicUrl;
    console.log("Banner URL:", bannerUrl);
    
    // Update profile
    console.log("Updating profile with banner URL");
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ banner_url: bannerUrl })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Profile update error:", updateError);
      throw updateError;
    }
    
    console.log("Banner update complete");
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
      // If username is being changed, check if it's allowed
      if (data.username) {
        const { canChange, daysRemaining } = await canChangeUsername(userId);
        
        if (!canChange) {
          toast({
            title: "Изменение имени пользователя ограничено",
            description: `Вы сможете изменить имя пользователя через ${daysRemaining} дней`,
            variant: "destructive"
          });
          return false;
        }
        
        // Update the last_username_change field
        data.last_username_change = new Date().toISOString();
      }
      
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
