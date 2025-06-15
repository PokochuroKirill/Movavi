
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNav } from "@/components/MobileNav";
import NotificationBell from "./NotificationBell";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const { profile, isLoading } = useProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Вы вышли из аккаунта",
        description: "До встречи!",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <img src="/logo.svg" alt="logo" width="32" height="32" />
              <span>{siteConfig.name}</span>
            </a>
            <div className="hidden md:flex items-center space-x-6 ml-6">
              <a href="/projects" className="text-sm font-medium hover:underline underline-offset-4">
                Проекты
              </a>
              <a href="/snippets" className="text-sm font-medium hover:underline underline-offset-4">
                Сниппеты
              </a>
              <a href="/blog" className="text-sm font-medium hover:underline underline-offset-4">
                Блог
              </a>
              <a href="/community" className="text-sm font-medium hover:underline underline-offset-4">
                Сообщества
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user && <NotificationBell />}
            
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
                    {isLoading ? (
                      <Skeleton className="h-8 w-8 rounded-full" />
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || "Avatar"} />
                        <AvatarFallback>{profile?.username?.slice(0, 2).toUpperCase() || "AV"}</AvatarFallback>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user ? (
                    <>
                      <DropdownMenuItem onClick={() => window.location.href = `/profile/${profile?.username}`}>
                        Профиль
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = "/account"}>
                        Настройки
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                        Панель управления
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>Выйти</DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => window.location.href = "/login"}>Войти</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <MobileNav />
          </div>
        </div>
        
        <MobileNav.Content />
      </div>
    </nav>
  );
};

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default Navbar;
