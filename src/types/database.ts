
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

export type SnippetComment = {
  id: string;
  snippet_id: string;
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

export type SnippetLike = {
  id: string;
  snippet_id: string;
  user_id: string;
  created_at: string;
};

export type SavedProject = {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
};

export type SavedSnippet = {
  id: string;
  snippet_id: string;
  user_id: string;
  created_at: string;
};

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
  birthdate: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  content: string;
  technologies: string[] | null;
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type Snippet = {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};
