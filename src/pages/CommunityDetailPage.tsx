
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
import {
  Loader2,
  Users,
  MessageSquare,
  CalendarIcon,
  Plus,
  PenSquare,
  Heart,
  Settings,
  AlertCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Community, CommunityPost, CommunityMember } from '@/types/database';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchCommunityData();
    }
  }, [id, user]);
  
  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      // Загрузка данных сообщества
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select(`
          *,
          profiles:creator_id (username, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();
        
      if (communityError) throw communityError;
      
      setCommunity(communityData as unknown as Community);
      
      // Загрузка публикаций сообщества
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('community_id', id)
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      
      setPosts(postsData as unknown as CommunityPost[]);
      
      // Загрузка участников сообщества
      const { data: membersData, error: membersError } = await supabase
        .from('community_members')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('community_id', id)
        .order('created_at', { ascending: false });
        
      if (membersError) throw membersError;
      
      setMembers(membersData as unknown as CommunityMember[]);
      
      // Проверяем, является ли текущий пользователь участником сообщества
      if (user) {
        const { data: memberData, error: memberError } = await supabase
          .from('community_members')
          .select('role')
          .eq('community_id', id)
          .eq('user_id', user.id)
          .single();
          
        if (!memberError && memberData) {
          setIsMember(true);
          setIsAdmin(memberData.role === 'admin' || memberData.role === 'moderator');
        } else {
          setIsMember(false);
          setIsAdmin(false);
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
      // Добавляем пользователя в участники сообщества
      const { data, error } = await supabase
        .from('community_members')
        .insert({
          user_id: user.id,
          community_id: id,
          role: 'member'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Обновляем счетчик участников в сообществе
      await supabase
        .from('communities')
        .update({ members_count: supabase.rpc('increment', { row_id: id, table_name: 'communities', column_name: 'members_count' }) })
        .eq('id', id);
      
      setIsMember(true);
      setMembers([data as unknown as CommunityMember, ...members]);
      
      toast({
        description: 'Вы успешно присоединились к сообществу'
      });
      
      // Обновляем данные сообщества
      fetchCommunityData();
      
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
      // Удаляем пользователя из участников сообщества
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Обновляем счетчик участников в сообществе
      await supabase
        .from('communities')
        .update({ members_count: supabase.rpc('decrement', { row_id: id, table_name: 'communities', column_name: 'members_count' }) })
        .eq('id', id);
      
      setIsMember(false);
      setIsAdmin(false);
      setMembers(members.filter(member => member.user_id !== user.id));
      
      toast({
        description: 'Вы покинули сообщество'
      });
      
      setConfirmLeaveOpen(false);
      
      // Обновляем данные сообщества
      fetchCommunityData();
      
    } catch (error: any) {
      console.error('Error leaving community:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось покинуть сообщество',
        variant: 'destructive',
      });
      setConfirmLeaveOpen(false);
    }
  };
  
  const handleToggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для оценки публикации необходимо войти',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    try {
      if (isLiked) {
        // Убираем лайк
        await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        // Обновляем счетчик лайков публикации
        await supabase
          .from('community_posts')
          .update({ likes_count: supabase.rpc('decrement', { row_id: postId, table_name: 'community_posts', column_name: 'likes_count' }) })
          .eq('id', postId);
      } else {
        // Добавляем лайк
        await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });
          
        // Обновляем счетчик лайков публикации
        await supabase
          .from('community_posts')
          .update({ likes_count: supabase.rpc('increment', { row_id: postId, table_name: 'community_posts', column_name: 'likes_count' }) })
          .eq('id', postId);
      }
      
      // Обновляем данные публикаций
      fetchCommunityData();
      
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить оценку',
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
                          <Settings className="h-4 w-4 mr-2" />
                          Управление
                        </Button>
                      )}
                      <Button 
                        variant={isAdmin ? "outline" : "default"}
                        onClick={() => setConfirmLeaveOpen(true)}
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
              <Button onClick={() => navigate(`/communities/${community.id}/post/create`)} className="gradient-bg text-white">
                <PenSquare className="h-4 w-4 mr-2" />
                Создать публикацию
              </Button>
            )}
          </div>
          
          <TabsContent value="posts">
            <div className="space-y-6">
              {!isMember && (
                <Alert variant="warning" className="mb-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="ml-2">
                    Присоединитесь к сообществу, чтобы создавать публикации и общаться с другими участниками.
                  </AlertDescription>
                </Alert>
              )}
              
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
                      <Link to={`/communities/${community.id}/post/${post.id}`}>
                        <h3 className="text-xl font-semibold mb-2 hover:text-devhub-purple">{post.title}</h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{post.content}</p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <button 
                          className="flex items-center hover:text-red-500 transition-colors focus:outline-none"
                          onClick={() => handleToggleLike(post.id, false)}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          <span>{post.likes_count || 0} лайков</span>
                        </button>
                        <Link to={`/communities/${community.id}/post/${post.id}`} className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{post.comments_count || 0} комментариев</span>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">В этом сообществе пока нет публикаций</p>
                  {isMember && (
                    <Button onClick={() => navigate(`/communities/${community.id}/post/create`)} className="gradient-bg text-white">
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
              {members.length > 0 ? (
                members.map(member => (
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
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">В этом сообществе пока нет участников</p>
                </div>
              )}
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
      
      {/* Диалог подтверждения выхода из сообщества */}
      <AlertDialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Покинуть сообщество?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите покинуть это сообщество? Вы всегда можете присоединиться снова позже.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveCommunity}>
              Покинуть сообщество
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommunityDetailPage;
