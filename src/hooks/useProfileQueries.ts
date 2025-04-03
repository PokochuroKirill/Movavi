
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
    const { data, error } = await supabase
      .rpc("check_if_following", { follower: followerId, following: followingId });

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
    const { error } = await supabase.rpc("follow_user", { 
      follower: followerId,
      following: followingId
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error following user:", error);
    return false;
  }
};

// Function to unfollow a user
export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc("unfollow_user", {
      follower: followerId,
      following: followingId
    });

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
    const { data, error } = await supabase
      .rpc("get_followers", { user_id: userId });

    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    return data as Profile[];
  } catch (error) {
    console.error("Error fetching followers:", error);
    return [];
  }
};

// Function to get the users that a user is following
export const fetchFollowing = async (userId: string): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .rpc("get_following", { user_id: userId });

    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    return data as Profile[];
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
    const { data: followersCount, error: followersError } = await supabase
      .rpc("count_followers", { user_id: userId });

    if (followersError) throw followersError;

    const { data: followingCount, error: followingError } = await supabase
      .rpc("count_following", { user_id: userId });

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
            title: "Unfollow successful",
            description: "You are no longer following this user"
          });
        }
      } else {
        success = await followUser(currentUserId, profileUserId);
        if (success) {
          toast({
            title: "Follow successful",
            description: "You are now following this user"
          });
        }
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
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
          title: "Success",
          description: "Profile updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
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
