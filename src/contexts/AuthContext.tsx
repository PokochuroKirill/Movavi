
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
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Обрабатываем OAuth вход (включая Discord)
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Создаем или обновляем профиль при OAuth входе
          if (currentSession.user.app_metadata?.provider && currentSession.user.app_metadata.provider !== 'email') {
            setTimeout(async () => {
              try {
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', currentSession.user.id)
                  .single();

                if (!existingProfile) {
                  // Создаем новый профиль для OAuth пользователя
                  const username = currentSession.user.user_metadata?.preferred_username 
                    || currentSession.user.user_metadata?.username 
                    || currentSession.user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                    || `user_${currentSession.user.id.slice(0, 8)}`;

                  const fullName = currentSession.user.user_metadata?.full_name 
                    || currentSession.user.user_metadata?.name 
                    || '';

                  await supabase
                    .from('profiles')
                    .insert({
                      id: currentSession.user.id,
                      username: username,
                      full_name: fullName,
                      avatar_url: currentSession.user.user_metadata?.avatar_url || null
                    });

                  toast({
                    title: "Добро пожаловать!",
                    description: "Ваш профиль успешно создан.",
                  });
                }
              } catch (error) {
                console.error('Error creating OAuth profile:', error);
              }
            }, 0);
          }
        }

        setLoading(false);
      }
    );

    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

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
          emailRedirectTo: `${window.location.origin}/`
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
