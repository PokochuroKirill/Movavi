export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
  updated_at: string;
  telegram: string | null;
  discord: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  is_admin?: boolean;
  is_verified: boolean;
  is_pro?: boolean;
  last_username_change?: string | null;
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
  authorId?: string;
  authorUsername?: string;
  authorAvatar?: string;
  likes?: number;
  comments?: number;
  likes_count?: number;
  comments_count?: number;
  popularityScore?: number;
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
  authorId?: string;
  authorUsername?: string;
  authorAvatar?: string;
  likes?: number;
  comments?: number;
  popularityScore?: number;
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

export interface SnippetComment {
  id: string;
  content: string;
  user_id: string;
  snippet_id: string;
  created_at: string;
  profiles?: {
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
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

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar_url?: string | null;
  banner_url?: string | null;
  created_at: string;
  updated_at: string;
  creator_id: string;
  is_public: boolean;
  members_count?: number;
  posts_count?: number;
  topics?: string[];
  creator?: {
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export interface CommunityMember {
  id: string;
  user_id: string; 
  community_id: string;
  created_at: string;
  role: "admin" | "moderator" | "member";
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  community_id: string;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  comments_count?: number;
  profiles?: {
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export interface CommunityComment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  profiles?: {
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export interface CommunityPostLike {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  payment_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'pending' | 'expired';
  subscription_plans?: SubscriptionPlan;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
  payment_method: string;
  receipt_url?: string;
  admin_notes?: string;
  status: 'pending' | 'approved' | 'rejected';
}
