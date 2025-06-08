
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Search, Users, Filter, X } from 'lucide-react';
import { Community } from '@/types/database';

const CommunitiesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [popularCommunities, setPopularCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('members_count');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);

      // Загрузка всех публичных сообществ
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select(`
          *,
          profiles:creator_id (username, full_name, avatar_url)
        `)
        .eq('is_public', true)
        .order('members_count', { ascending: false });
      
      if (communitiesError) throw communitiesError;
      setCommunities(communitiesData as unknown as Community[]);
      
      // Популярные сообщества - сортируем по количеству участников
      const popular = [...(communitiesData as unknown as Community[])]
        .sort((a, b) => (b.members_count || 0) - (a.members_count || 0))
        .slice(0, 6);
      setPopularCommunities(popular);
      
      // Собираем все уникальные темы
      const topics = new Set<string>();
      communitiesData?.forEach(community => {
        if (community.topics && Array.isArray(community.topics)) {
          community.topics.forEach(topic => {
            if (topic) topics.add(topic);
          });
        }
      });
      setAvailableTopics(Array.from(topics).sort());
      
      // Если пользователь авторизован, получаем сообщества, где он состоит
      if (user) {
        const { data: userCommunitiesData, error: userCommunitiesError } = await supabase
          .from('community_members')
          .select(`
            community_id
          `)
          .eq('user_id', user.id);

        if (userCommunitiesError) throw userCommunitiesError;
        
        if (userCommunitiesData.length > 0) {
          const communityIds = userCommunitiesData.map(item => item.community_id);
          
          const { data: myCommunitiesData, error: myCommunitiesError } = await supabase
            .from('communities')
            .select(`
              *,
              profiles:creator_id (username, full_name, avatar_url)
            `)
            .in('id', communityIds)
            .order('created_at', { ascending: false });
            
          if (myCommunitiesError) throw myCommunitiesError;
          setMyCommunities(myCommunitiesData as unknown as Community[]);
        } else {
          setMyCommunities([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching communities:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщества',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = () => {
    let filtered = communities;

    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (community.topics && community.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Фильтр по темам
    if (selectedTopic !== 'all') {
      filtered = filtered.filter(community =>
        community.topics && community.topics.includes(selectedTopic)
      );
    }

    // Сортировка
    if (sortBy === 'members_count') {
      filtered = filtered.sort((a, b) => (b.members_count || 0) - (a.members_count || 0));
    } else if (sortBy === 'posts_count') {
      filtered = filtered.sort((a, b) => (b.posts_count || 0) - (a.posts_count || 0));
    } else if (sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTopic('all');
    setSortBy('members_count');
  };

  const hasActiveFilters = searchQuery || selectedTopic !== 'all' || sortBy !== 'members_count';

  const renderCommunityCard = (community: Community) => (
    <Link to={`/communities/${community.id}`} key={community.id}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        {community.banner_url && (
          <div className="h-40 overflow-hidden">
            <img 
              src={community.banner_url} 
              alt={community.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src={community.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">{community.name}</CardTitle>
              <p className="text-sm text-gray-500">
                {community.profiles?.username && `@${community.profiles.username}`}
              </p>
            </div>
          </div>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {community.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1 mb-3">
            {community.topics && community.topics.slice(0, 3).map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
            {community.topics && community.topics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{community.topics.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{community.members_count || 0}</span>
            </div>
            <span>{community.posts_count || 0} постов</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Сообщества</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Присоединяйтесь к сообществам по интересам и общайтесь с единомышленниками
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/communities/create')} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4 lg:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать сообщество
          </Button>
        </div>

        <Tabs defaultValue="discover" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="discover">Открыть</TabsTrigger>
            {user && <TabsTrigger value="my">Мои сообщества</TabsTrigger>}
            <TabsTrigger value="popular">Популярные</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover">
            {/* Фильтры */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Поиск */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Найти сообщество..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Фильтр по темам */}
                <div className="w-full lg:w-48">
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Тема" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все темы</SelectItem>
                      {availableTopics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Сортировка */}
                <div className="w-full lg:w-48">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="members_count">По участникам</SelectItem>
                      <SelectItem value="posts_count">По активности</SelectItem>
                      <SelectItem value="created_at">Новые</SelectItem>
                      <SelectItem value="name">По названию</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Активные фильтры */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Filter className="mr-1 h-3 w-3" />
                    Активные фильтры:
                  </span>
                  
                  {searchQuery && (
                    <Badge variant="secondary">
                      Поиск: "{searchQuery}"
                    </Badge>
                  )}
                  
                  {selectedTopic !== 'all' && (
                    <Badge variant="secondary">
                      Тема: {selectedTopic}
                    </Badge>
                  )}
                  
                  {sortBy !== 'members_count' && (
                    <Badge variant="secondary">
                      Сортировка: {sortBy === 'posts_count' ? 'По активности' : sortBy === 'created_at' ? 'Новые' : 'По названию'}
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs h-6 px-2"
                  >
                    Очистить все
                  </Button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span className="text-lg">Загрузка сообществ...</span>
              </div>
            ) : filteredCommunities().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities().map(renderCommunityCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <Search className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Сообщества не найдены
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {hasActiveFilters 
                      ? 'Попробуйте изменить параметры поиска'
                      : 'Сообществ пока нет'
                    }
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>
                      Очистить фильтры
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/communities/create')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Создать сообщество
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          {user && (
            <TabsContent value="my">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <span className="text-lg">Загрузка ваших сообществ...</span>
                </div>
              ) : myCommunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCommunities.map(renderCommunityCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Вы пока не присоединились ни к одному сообществу
                  </p>
                  <Button onClick={() => setActiveTab('discover')}>
                    Найти сообщества
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="popular">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span className="text-lg">Загрузка популярных сообществ...</span>
              </div>
            ) : popularCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularCommunities.map(renderCommunityCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Популярных сообществ пока нет
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CommunitiesPage;
