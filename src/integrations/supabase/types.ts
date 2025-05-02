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
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          birthdate: string | null
          created_at: string
          discord: string | null
          full_name: string | null
          github: string | null
          id: string
          is_admin: boolean | null
          is_verified: boolean
          last_username_change: string | null
          linkedin: string | null
          location: string | null
          telegram: string | null
          twitter: string | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string
          discord?: string | null
          full_name?: string | null
          github?: string | null
          id: string
          is_admin?: boolean | null
          is_verified?: boolean
          last_username_change?: string | null
          linkedin?: string | null
          location?: string | null
          telegram?: string | null
          twitter?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string
          discord?: string | null
          full_name?: string | null
          github?: string | null
          id?: string
          is_admin?: boolean | null
          is_verified?: boolean
          last_username_change?: string | null
          linkedin?: string | null
          location?: string | null
          telegram?: string | null
          twitter?: string | null
          updated_at?: string
          username?: string | null
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
      projects: {
        Row: {
          content: string
          created_at: string
          description: string
          github_url: string | null
          id: string
          image_url: string | null
          live_url: string | null
          technologies: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          description: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
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
      [_ in never]: never
    }
    Functions: {
      check_if_following: {
        Args: {
          follower: string
          following: string
        }
        Returns: boolean
      }
      count_followers: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      count_following: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      follow_user: {
        Args: {
          follower: string
          following: string
        }
        Returns: boolean
      }
      get_followers: {
        Args: {
          user_id: string
        }
        Returns: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          birthdate: string | null
          created_at: string
          discord: string | null
          full_name: string | null
          github: string | null
          id: string
          is_admin: boolean | null
          is_verified: boolean
          last_username_change: string | null
          linkedin: string | null
          location: string | null
          telegram: string | null
          twitter: string | null
          updated_at: string
          username: string | null
          website: string | null
        }[]
      }
      get_following: {
        Args: {
          user_id: string
        }
        Returns: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          birthdate: string | null
          created_at: string
          discord: string | null
          full_name: string | null
          github: string | null
          id: string
          is_admin: boolean | null
          is_verified: boolean
          last_username_change: string | null
          linkedin: string | null
          location: string | null
          telegram: string | null
          twitter: string | null
          updated_at: string
          username: string | null
          website: string | null
        }[]
      }
      get_project_likes_count: {
        Args: {
          project_id: string
        }
        Returns: number
      }
      get_snippet_likes_count: {
        Args: {
          snippet_id: string
        }
        Returns: number
      }
      has_user_liked_project: {
        Args: {
          project_id: string
          user_id: string
        }
        Returns: boolean
      }
      has_user_liked_snippet: {
        Args: {
          snippet_id: string
          user_id: string
        }
        Returns: boolean
      }
      has_user_saved_project: {
        Args: {
          project_id: string
          user_id: string
        }
        Returns: boolean
      }
      has_user_saved_snippet: {
        Args: {
          snippet_id: string
          user_id: string
        }
        Returns: boolean
      }
      unfollow_user: {
        Args: {
          follower: string
          following: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
