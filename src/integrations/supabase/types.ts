export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string
          creator_id: string
          description: string
          id: string
          is_public: boolean
          members_count: number | null
          name: string
          posts_count: number | null
          topics: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          creator_id: string
          description: string
          id?: string
          is_public?: boolean
          members_count?: number | null
          name: string
          posts_count?: number | null
          topics?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          is_public?: boolean
          members_count?: number | null
          name?: string
          posts_count?: number | null
          topics?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_banned_users: {
        Row: {
          banned_by: string
          community_id: string
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_by: string
          community_id: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string
          community_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          post_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          post_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          post_id?: string
        }
        Relationships: []
      }
      community_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          community_id: string
          content: string
          created_at: string
          id: string
          likes_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          community_id: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dismissed_notifications: {
        Row: {
          created_at: string
          id: string
          notification_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          banner_url: string | null
          bio: string | null
          birthdate: string | null
          created_at: string
          discord: string | null
          full_name: string | null
          github: string | null
          id: string
          is_admin: boolean | null
          is_banned: boolean | null
          is_pro: boolean | null
          is_verified: boolean
          last_login: string | null
          last_username_change: string | null
          linkedin: string | null
          location: string | null
          login_count: number | null
          telegram: string | null
          twitter: string | null
          updated_at: string
          username: string | null
          verification_granted_at: string | null
          verification_granted_by: string | null
          verification_type: number | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          banner_url?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string
          discord?: string | null
          full_name?: string | null
          github?: string | null
          id: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean
          last_login?: string | null
          last_username_change?: string | null
          linkedin?: string | null
          location?: string | null
          login_count?: number | null
          telegram?: string | null
          twitter?: string | null
          updated_at?: string
          username?: string | null
          verification_granted_at?: string | null
          verification_granted_by?: string | null
          verification_type?: number | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          banner_url?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string
          discord?: string | null
          full_name?: string | null
          github?: string | null
          id?: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean
          last_login?: string | null
          last_username_change?: string | null
          linkedin?: string | null
          location?: string | null
          login_count?: number | null
          telegram?: string | null
          twitter?: string | null
          updated_at?: string
          username?: string | null
          verification_granted_at?: string | null
          verification_granted_by?: string | null
          verification_type?: number | null
          website?: string | null
        }
        Relationships: []
      }
      project_likes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_views: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          project_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          project_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          project_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          description: string
          github_url: string | null
          id: string
          image_url: string | null
          likes_count: number | null
          live_url: string | null
          technologies: string[] | null
          title: string
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          description: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          live_url?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          description?: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          live_url?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_projects: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_snippets: {
        Row: {
          created_at: string | null
          id: string
          snippet_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_snippets_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      snippet_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          snippet_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_snippet_comments_snippet"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snippet_comments_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      snippet_likes: {
        Row: {
          created_at: string | null
          id: string
          snippet_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "snippet_likes_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      snippet_views: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          snippet_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          snippet_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          snippet_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      snippets: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          language: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: string
          language: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          language?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "snippets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          payment_method: string
          plan_id: string
          receipt_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          plan_id: string
          receipt_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          plan_id?: string
          receipt_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: string[]
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features: string[]
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: string[]
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          payment_id: string | null
          plan_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          payment_id?: string | null
          plan_id: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          payment_id?: string | null
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "subscription_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      community_counts: {
        Row: {
          date: string | null
          new_communities: number | null
        }
        Relationships: []
      }
      snippet_counts: {
        Row: {
          date: string | null
          new_snippets: number | null
        }
        Relationships: []
      }
      user_counts: {
        Row: {
          date: string | null
          new_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      ban_user: {
        Args: { target_user_id: string; reason?: string }
        Returns: boolean
      }
      ban_user_from_community: {
        Args: { p_community_id: string; p_user_id: string; p_reason?: string }
        Returns: boolean
      }
      check_if_following: {
        Args: { follower: string; following: string }
        Returns: boolean
      }
      count_followers: {
        Args: { user_id: string }
        Returns: number
      }
      count_following: {
        Args: { user_id: string }
        Returns: number
      }
      create_notification: {
        Args: {
          target_user_id: string
          notification_title: string
          notification_message: string
          notification_type?: string
          action_url?: string
          expires_hours?: number
        }
        Returns: string
      }
      decrement_community_members: {
        Args: { community_id: string }
        Returns: undefined
      }
      decrement_community_posts: {
        Args: { community_id: string }
        Returns: undefined
      }
      delete_community: {
        Args: { community_id: string }
        Returns: boolean
      }
      delete_user_account: {
        Args: { target_user_id: string; reason?: string }
        Returns: boolean
      }
      follow_user: {
        Args: { follower: string; following: string }
        Returns: boolean
      }
      get_active_notifications_for_user: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          title: string
          message: string
          type: string
          action_url: string
          created_at: string
        }[]
      }
      get_followers: {
        Args: { user_id: string }
        Returns: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          banner_url: string | null
          bio: string | null
          birthdate: string | null
          created_at: string
          discord: string | null
          full_name: string | null
          github: string | null
          id: string
          is_admin: boolean | null
          is_banned: boolean | null
          is_pro: boolean | null
          is_verified: boolean
          last_login: string | null
          last_username_change: string | null
          linkedin: string | null
          location: string | null
          login_count: number | null
          telegram: string | null
          twitter: string | null
          updated_at: string
          username: string | null
          verification_granted_at: string | null
          verification_granted_by: string | null
          verification_type: number | null
          website: string | null
        }[]
      }
      get_following: {
        Args: { user_id: string }
        Returns: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          banner_url: string | null
          bio: string | null
          birthdate: string | null
          created_at: string
          discord: string | null
          full_name: string | null
          github: string | null
          id: string
          is_admin: boolean | null
          is_banned: boolean | null
          is_pro: boolean | null
          is_verified: boolean
          last_login: string | null
          last_username_change: string | null
          linkedin: string | null
          location: string | null
          login_count: number | null
          telegram: string | null
          twitter: string | null
          updated_at: string
          username: string | null
          verification_granted_at: string | null
          verification_granted_by: string | null
          verification_type: number | null
          website: string | null
        }[]
      }
      get_project_likes_count: {
        Args: { project_id: string }
        Returns: number
      }
      get_recommended_projects: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          title: string
          description: string
          image_url: string
          user_id: string
          created_at: string
          technologies: string[]
          relevance_score: number
        }[]
      }
      get_recommended_snippets: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          title: string
          description: string
          language: string
          user_id: string
          created_at: string
          tags: string[]
          relevance_score: number
        }[]
      }
      get_snippet_comments_count: {
        Args: { snippet_id: string }
        Returns: number
      }
      get_snippet_likes_count: {
        Args: { snippet_id: string }
        Returns: number
      }
      has_pro_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_user_liked_project: {
        Args: { project_id: string; user_id: string }
        Returns: boolean
      }
      has_user_liked_snippet: {
        Args: { snippet_id: string; user_id: string }
        Returns: boolean
      }
      has_user_saved_project: {
        Args: { project_id: string; user_id: string }
        Returns: boolean
      }
      has_user_saved_snippet: {
        Args: { snippet_id: string; user_id: string }
        Returns: boolean
      }
      increment_community_members: {
        Args: { community_id: string }
        Returns: undefined
      }
      increment_community_posts: {
        Args: { community_id: string }
        Returns: undefined
      }
      increment_project_views: {
        Args: { project_id: string; user_id?: string; ip_address?: unknown }
        Returns: undefined
      }
      increment_snippet_views: {
        Args: { snippet_id: string; user_id?: string; ip_address?: unknown }
        Returns: undefined
      }
      nullify_account: {
        Args: { target_user_id: string; reason?: string }
        Returns: boolean
      }
      send_mass_notification: {
        Args: {
          notification_title: string
          notification_message: string
          notification_type?: string
          target_verified_only?: boolean
          target_pro_only?: boolean
        }
        Returns: number
      }
      unban_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      unban_user_from_community: {
        Args: { p_community_id: string; p_user_id: string }
        Returns: boolean
      }
      unfollow_user: {
        Args: { follower: string; following: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
