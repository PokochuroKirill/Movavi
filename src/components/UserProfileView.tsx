
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Globe, Github, Twitter, Linkedin, MessageSquare, UserPlus, UserMinus, Crown } from 'lucide-react';
import { Profile, Project, Snippet } from '@/types/database';
import { formatDate } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProjectCard from './ProjectCard';
import SnippetCard from './SnippetCard';
import FollowersModal from './FollowersModal';

interface UserProfileViewProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  isOwnProfile,
  onEditProfile
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  useEffect(() => {
    fetchUserData();
    if (user && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [profile.id, user]);

  const fetchUserData = async () => {
    try {
      // Получаем проекты
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      // Получаем сниппеты
      const { data: snippetsData } = await supabase
        .from('snippets')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      // Получаем количество подписчиков
      const { count: followersCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id);

      // Получаем количество подписок
      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id);

      setProjects(projectsData || []);
      setSnippets(snippetsData || []);
      setFollowersCount(followersCount || 0);
      setFollowingCount(followingCount || 0);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: "Отписка выполнена",
          description: `Вы отписались от ${profile.full_name || profile.username}`
        });
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        
        toast({
          title: "Подписка оформлена",
          description: `Вы подписались на ${profile.full_name || profile.username}`
        });
      }
    } catch (error: any) {
      console.error('Error following/unfollowing user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить действие",
        variant: "destructive"
      });
    }
  };

  const getSocialLinks = () => {
    const links = [];
    if (profile.website) links.push({ icon: Globe, url: profile.website, label: 'Веб-сайт' });
    if (profile.github) links.push({ icon: Github, url: `https://github.com/${profile.github}`, label: 'GitHub' });
    if (profile.twitter) links.push({ icon: Twitter, url: `https://twitter.com/${profile.twitter}`, label: 'Twitter' });
    if (profile.linkedin) links.push({ icon: Linkedin, url: profile.linkedin, label: 'LinkedIn' });
    return links;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Профиль пользователя */}
      <Card className="overflow-hidden">
        <div 
          className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
          style={{
            backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <CardHeader className="relative pb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg -mt-12 relative z-10">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {(profile.full_name || profile.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-3 flex-1">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-3xl text-gray-900 dark:text-white">
                      {profile.full_name || profile.username}
                    </CardTitle>
                    {profile.is_verified && (
                      <Badge className="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <Crown className="h-3 w-3 mr-1" />
                        Верифицирован
                      </Badge>
                    )}
                    {profile.is_pro && (
                      <Badge className="bg-gradient-to-r from-gold-400 to-gold-600 text-white">
                        PRO
                      </Badge>
                    )}
                  </div>
                  {profile.username && profile.full_name && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">@{profile.username}</p>
                  )}
                  {profile.bio && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Зарегистрирован {formatDate(profile.created_at)}</span>
                  </div>
                </div>

                {/* Социальные ссылки */}
                {getSocialLinks().length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {getSocialLinks().map(({ icon: Icon, url, label }, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Статистика подписок */}
                <div className="flex gap-6 text-sm">
                  <button
                    onClick={() => setShowFollowersModal(true)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">{followersCount}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">подписчиков</span>
                  </button>
                  <button
                    onClick={() => setShowFollowingModal(true)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">{followingCount}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">подписок</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button onClick={onEditProfile} className="gap-2">
                  Редактировать профиль
                </Button>
              ) : user ? (
                <>
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollow}
                    className="gap-2"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        Отписаться
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Подписаться
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Сообщение
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Модальные окна для подписчиков и подписок */}
      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={profile.id}
        type="followers"
      />
      
      <FollowersModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        userId={profile.id}
        type="following"
      />

      {/* Вкладки с контентом */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">Проекты</TabsTrigger>
          <TabsTrigger value="snippets">Сниппеты</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-6">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {isOwnProfile ? 'У вас пока нет проектов' : 'У пользователя пока нет проектов'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  author={project.profiles?.full_name || project.profiles?.username || 'Аноним'}
                  authorAvatar={project.profiles?.avatar_url}
                  authorId={project.user_id}
                  authorUsername={project.profiles?.username}
                  technologies={project.technologies}
                  imageUrl={project.image_url}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="snippets" className="space-y-6">
          {snippets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {isOwnProfile ? 'У вас пока нет сниппетов' : 'У пользователя пока нет сниппетов'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  id={snippet.id}
                  title={snippet.title}
                  description={snippet.description}
                  language={snippet.language}
                  author={snippet.profiles?.full_name || snippet.profiles?.username || 'Аноним'}
                  authorAvatar={snippet.profiles?.avatar_url}
                  authorId={snippet.user_id}
                  authorUsername={snippet.profiles?.username}
                  tags={snippet.tags}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileView;
