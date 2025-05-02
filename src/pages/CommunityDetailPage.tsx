import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, MessageSquare, CalendarIcon, Plus, PenSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Community, CommunityPost, CommunityMember } from '@/types/database';

const CommunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      fetchCommunityData(id);
    }
  }, [id, user]);
  
  const fetchCommunityData = async (communityId: string) => {
    try {
      setLoading(true);
      
      // Демо-данные для примера
      const demoCommunity: Community = {
        id: communityId,
        name: 'React разработчики',
        description: 'Сообщество React разработчиков. Обсуждаем лучшие практики, инструменты и новости в мире React. Делимся опытом, кодом и помогаем друг другу решать проблемы в разработке приложений на React.',
        avatar_url: 'https://i.imgur.com/3lGw7sv.png',
        banner_url: 'https://i.imgur.com/T9OfDu6.jpg',
        created_at: '2023-01-15T10:00:00Z',
        updated_at: '2023-01-15T10:00:00Z',
        creator_id: '1',
        is_public: true,
        members_count: 1235,
        posts_count: 456,
        topics: ['React', 'JavaScript', 'Frontend', 'Web Development', 'React Hooks', 'Redux'],
        creator: {
          username: 'reactfan',
          full_name: 'React Enthusiast',
          avatar_url: 'https://i.imgur.com/3lGw7sv.png'
        }
      };
      
      // Демо-данные для постов
      const demoPosts: CommunityPost[] = [
        {
          id: '1',
          title: 'Как использовать React Hooks эффективно',
          content: 'В этом посте я расскажу о лучших практиках использования React Hooks...',
          user_id: '1',
          community_id: communityId,
          created_at: '2023-03-15T14:25:00Z',
          updated_at: '2023-03-15T14:25:00Z',
          likes_count: 42,
          comments_count: 12,
          profiles: {
            username: 'reactfan',
            full_name: 'React Enthusiast',
            avatar_url: 'https://i.imgur.com/3lGw7sv.png'
          }
        },
        {
          id: '2',
          title: 'Управление состоянием с Redux Toolkit',
          content: 'Redux Toolkit значительно упрощает работу с Redux...',
          user_id: '2',
          community_id: communityId,
          created_at: '2023-03-10T09:15:00Z',
          updated_at: '2023-03-10T09:15:00Z',
          likes_count: 38,
          comments_count: 8,
          profiles: {
            username: 'reduxmaster',
            full_name: 'Redux Master',
            avatar_url: 'https://i.imgur.com/4AiXzf8.jpeg'
          }
        },
        {
          id: '3',
          title: 'React Performance Optimization',
          content: 'Советы по оптимизации производительности в React...',
          user_id: '3',
          community_id: communityId,
          created_at: '2023-03-05T16:45:00Z',
          updated_at: '2023-03-05T16:45:00Z',
          likes_count: 56,
          comments_count: 15,
          profiles: {
            username: 'performancedev',
            full_name: 'Performance Developer',
            avatar_url: 'https://i.imgur.com/9KYq7VG.jpeg'
          }
        }
      ];
      
      // Демо-данные для участников сообщества
      const demoMembers: CommunityMember[] = [
        {
          id: '1',
          user_id: '1',
          community_id: communityId,
          role: 'admin',
          created_at: '2023-01-15T10:00:00Z',
          profiles: {
            username: 'reactfan',
            full_name: 'React Enthusiast',
            avatar_url: 'https://i.imgur.com/3lGw7sv.png'
          }
        },
        {
          id: '2',
          user_id: '2',
          community_id: communityId,
          role: 'moderator',
          created_at: '2023-01-16T11:30:00Z',
          profiles: {
            username: 'reduxmaster',
            full_name: 'Redux Master',
            avatar_url: 'https://i.imgur.com/4AiXzf8.jpeg'
          }
        },
        {
          id: '3',
          user_id: '3',
          community_id: communityId,
          role: 'member',
          created_at: '2023-01-20T14:15:00Z',
          profiles: {
            username: 'performancedev',
            full_name: 'Performance Developer',
            avatar_url: 'https://i.imgur.com/9KYq7VG.jpeg'
          }
        }
      ];
      
      setCommunity(demoCommunity);
      setPosts(demoPosts);
      setMembers(demoMembers);
      
      // Проверяем, является ли текущий пользователь участником сообщества
      if (user) {
        const memberRecord = demoMembers.find(member => member.user_id === user.id);
        setIsMember(!!memberRecord);
        
        if (memberRecord) {
          setIsAdmin(memberRecord.role === 'admin' || memberRecord.role === 'moderator');
        }
      }
      
    } catch (error: any) {
      console.error('Error fetching community data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные сообщества',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinCommunity = async () => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите или зарегистрируйтесь, чтобы присоединиться к сообществу',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    try {
      // Просто обновляем состояние для демонстрации
      setIsMember(true);
      toast({
        description: 'Вы успешно присоединились к сообществу'
      });
      
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось присоединиться к сообществу',
        variant: 'destructive',
      });
    }
  };
  
  const handleLeaveCommunity = async () => {
    if (!user || !id) return;
    
    try {
      // Просто обновляем состояние для демонстрации
      setIsMember(false);
      setIsAdmin(false);
      toast({
        description: 'Вы покинули сообщество'
      });
      
    } catch (error: any) {
      console.error('Error leaving community:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось покинуть сообщество',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
          <span className="ml-2 text-lg">Загрузка сообщества...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!community) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Сообщество не найдено</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
            Запрашиваемое сообщество не существует или было удалено
          </p>
          <Button onClick={() => navigate('/communities')}>
            Назад к списку сообществ
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-20">
        {/* Баннер и основная информация */}
        <div className="relative mb-10">
          {community.banner_url && (
            <div className="h-64 w-full rounded-lg overflow-hidden mb-8">
              <img 
                src={community.banner_url}
                alt={community.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 rounded-lg">
                <AvatarImage src={community.avatar_url || undefined} />
                <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h1 className="text-3xl font-bold">{community.name}</h1>
                
                <div className="mt-4 md:mt-0">
                  {!isMember ? (
                    <Button 
                      onClick={handleJoinCommunity}
                      className="gradient-bg text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Присоединиться
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      {isAdmin && (
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/communities/${community.id}/manage`)}
                        >
                          Управление
                        </Button>
                      )}
                      <Button 
                        variant={isAdmin ? "outline" : "default"}
                        onClick={handleLeaveCommunity}
                      >
                        {isAdmin ? "Выйти из сообщества" : "Покинуть сообщество"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 my-4">
                {community.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {community.topics && community.topics.map((topic, index) => (
                  <Badge key={index} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Создано {format(new Date(community.created_at), 'dd MMMM yyyy', { locale: ru })}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {community.members_count || 0} участников
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {community.posts_count || 0} публикаций
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Основной контент */}
        <Tabs defaultValue="posts" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="posts">Публикации</TabsTrigger>
              <TabsTrigger value="members">Участники</TabsTrigger>
              <TabsTrigger value="about">О сообществе</TabsTrigger>
            </TabsList>
            
            {isMember && (
              <Button onClick={() => navigate(`/communities/${community.id}/post/create`)}>
                <PenSquare className="h-4 w-4 mr-2" />
                Создать публикацию
              </Button>
            )}
          </div>
          
          <TabsContent value="posts">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map(post => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={post.profiles?.avatar_url || undefined} />
                            <AvatarFallback>
                              {(post.profiles?.username || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{post.profiles?.full_name || post.profiles?.username || 'Пользователь'}</span>
                            <p className="text-xs text-gray-500">
                              {format(new Date(post.created_at), 'dd MMMM yyyy', { locale: ru })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Link to={`/communities/${community.id}/posts/${post.id}`}>
                        <h3 className="text-xl font-semibold mb-2 hover:text-devhub-purple">{post.title}</h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{post.content}</p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <span>{post.likes_count || 0} лайков</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{post.comments_count || 0} комментариев</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">В этом сообществе пока нет публикаций</p>
                  {isMember && (
                    <Button onClick={() => navigate(`/communities/${community.id}/post/create`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать первую публикацию
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="members">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(member => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(member.profiles?.username || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <Link to={`/user/${member.profiles?.username}`}>
                            <p className="font-semibold hover:text-devhub-purple">
                              {member.profiles?.full_name || member.profiles?.username || 'Пользователь'}
                            </p>
                          </Link>
                          <Badge variant={member.role === 'admin' ? "default" : "outline"}>
                            {member.role === 'admin' ? 'Админ' : member.role === 'moderator' ? 'Модератор' : 'Участник'}
                          </Badge>
                        </div>
                        {member.profiles?.username && (
                          <p className="text-sm text-gray-500">@{member.profiles.username}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="about">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">О сообществе</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-wrap">{community.description}</p>
                
                <h4 className="font-semibold text-lg mb-2">Создатель сообщества</h4>
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={community.creator?.avatar_url || undefined} />
                    <AvatarFallback>
                      {(community.creator?.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Link to={`/user/${community.creator?.username}`}>
                    <p className="hover:text-devhub-purple">
                      {community.creator?.full_name || community.creator?.username || 'Пользователь'}
                    </p>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Темы</h4>
                    <div className="flex flex-wrap gap-2">
                      {community.topics && community.topics.map((topic, index) => (
                        <Badge key={index} variant="outline">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Статистика</h4>
                    <div className="space-y-2 text-gray-600 dark:text-gray-300">
                      <p>Количество участников: {community.members_count || 0}</p>
                      <p>Количество публикаций: {community.posts_count || 0}</p>
                      <p>Дата создания: {format(new Date(community.created_at), 'dd MMMM yyyy', { locale: ru })}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default CommunityDetailPage;
