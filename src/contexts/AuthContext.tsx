
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Устанавливаем обработчик изменения состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Обновляем или создаем профиль при входе
        if (event === 'SIGNED_IN' && currentSession?.user) {
          await handleUserSignIn(currentSession.user);
        }
      }
    );

    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSignIn = async (user: User) => {
    try {
      // Проверяем, существует ли профиль
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Создаем новый профиль
        const displayName = user.user_metadata?.full_name || user.user_metadata?.name || 'Пользователь';
        let username = user.user_metadata?.username || user.user_metadata?.preferred_username;
        
        // Если username не указан или это email, генерируем уникальный
        if (!username || username.includes('@')) {
          username = `user_${user.id.substring(0, 8)}`;
        }

        // Проверяем уникальность username
        const { data: existingUsername } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUsername) {
          username = `${username}_${Date.now()}`;
        }

        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username,
            full_name: displayName,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
          });

        if (error) {
          console.error('Error creating profile:', error);
        }
      } else {
        // Обновляем avatar_url если он изменился
        const newAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        if (newAvatarUrl && newAvatarUrl !== existingProfile.avatar_url) {
          await supabase
            .from('profiles')
            .update({ avatar_url: newAvatarUrl })
            .eq('id', user.id);
        }
      }
    } catch (error) {
      console.error('Error handling user sign in:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, username?: string) => {
    try {
      // Если указан username, проверяем его уникальность
      if (username) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();
        
        if (data) {
          toast({
            title: "Ошибка при регистрации",
            description: "Это имя пользователя уже занято. Пожалуйста, выберите другое.",
            variant: "destructive",
          });
          throw new Error("Имя пользователя уже занято");
        }
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username
          },
        },
      });

      if (error) throw error;
      toast({
        title: "Регистрация успешна",
        description: "На ваш email отправлена ссылка для подтверждения.",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка при регистрации",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast({
        title: "Вход выполнен успешно",
        description: "Добро пожаловать в DevHub!",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithDiscord = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы.",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка при выходе",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signInWithDiscord,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
