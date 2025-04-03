
export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  telegram?: string;
  discord?: string;
  location?: string;
  birthdate?: string;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  user_id: string;
  technologies?: string[];
  image_url?: string;
  github_url?: string;
  live_url?: string;
  created_at: string;
  updated_at: string;
  author?: string;
  authorAvatar?: string;
  likes_count?: number;
  comments_count?: number;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  user_id: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  author?: string;
  authorAvatar?: string;
  likes_count?: number;
  comments_count?: number;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  project_id: string;
  created_at: string;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ProjectLike {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
}

export interface SavedProject {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author_id: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SupportRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  user_id?: string;
  created_at: string;
}

// Additional interfaces needed
export interface SnippetComment {
  id: string;
  content: string;
  user_id: string;
  snippet_id: string;
  created_at: string;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SnippetLike {
  id: string;
  user_id: string;
  snippet_id: string;
  created_at: string;
}

export interface SavedSnippet {
  id: string;
  user_id: string;
  snippet_id: string;
  created_at: string;
}
