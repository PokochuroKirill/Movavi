
// Custom database types that extend the Supabase types

export type Comment = {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type ProjectLike = {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
};

export type SavedProject = {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
};
