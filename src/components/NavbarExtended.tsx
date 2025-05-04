
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, Menu, Search, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkProAccess } from '@/hooks/useSubscriptionQueries';

const NavbarExtended = () => {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isProUser, setIsProUser] = useState(false);
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUsername(data.username || '');
          setAvatarUrl(data.avatar_url || '');
        }

        // Check PRO status
        const isUserPro = await checkProAccess(user.id);
        setIsProUser(isUserPro);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    getProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Успешный выход",
        description: "Вы вышли из своего аккаунта"
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-500">
              DevHub
            </Link>
            {!isMobile && (
              <div className="hidden md:flex space-x-2">
                <Link to="/projects">
                  <Button variant="ghost">Проекты</Button>
                </Link>
                <Link to="/snippets">
                  <Button variant="ghost">Сниппеты</Button>
                </Link>
                <Link to="/communities">
                  <Button variant="ghost">Сообщества</Button>
                </Link>
                {isProUser && (
                  <Link to="/analytics">
                    <Button variant="ghost" className="flex items-center gap-1">
                      Аналитика <Badge className="ml-1 bg-purple-500">PRO</Badge>
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {user ? (
              <>
                <Link to="/subscription">
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </Button>
                </Link>
                
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarUrl} alt={username} />
                        <AvatarFallback>
                          {(username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{username || user.email}</p>
                      {isProUser && (
                        <Badge variant="outline" className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          PRO пользователь
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <Link to="/profile">
                      <DropdownMenuItem>Мой профиль</DropdownMenuItem>
                    </Link>
                    <Link to="/subscription">
                      <DropdownMenuItem>PRO подписка</DropdownMenuItem>
                    </Link>
                    {isProUser && (
                      <Link to="/analytics">
                        <DropdownMenuItem>Аналитика</DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Войти</Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button className="hidden md:inline-flex">Регистрация</Button>
                </Link>
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && isMobile && (
          <div className="mt-2 border-t border-gray-200 dark:border-gray-800 pt-2">
            <div className="flex flex-col space-y-2">
              <Link to="/projects" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Проекты</Button>
              </Link>
              <Link to="/snippets" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Сниппеты</Button>
              </Link>
              <Link to="/communities" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Сообщества</Button>
              </Link>
              <Link to="/subscription" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">PRO подписка</Button>
              </Link>
              {isProUser && (
                <Link to="/analytics" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Аналитика <Badge className="ml-1 bg-purple-500">PRO</Badge>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarExtended;
