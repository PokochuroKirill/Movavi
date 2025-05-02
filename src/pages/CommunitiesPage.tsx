
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, Users } from 'lucide-react';
import { Community } from '@/types/database';

const CommunitiesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [popularCommunities, setPopularCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

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
        .slice(0, 5);
      setPopularCommunities(popular);
      
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

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (community.topics && community.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 mt-8">
          <div>
            <h1 className="text-3xl font-bold">Сообщества</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Присоединяйтесь к сообществам по интересам и общайтесь с единомышленниками
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/communities/create')} 
            className="mt-4 lg:mt-0 gradient-bg text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать сообщество
          </Button>
        </div>
        
        <div className="mb-8">
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

        <Tabs defaultValue="discover" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="discover">Открыть</TabsTrigger>
            {user && <TabsTrigger value="my">Мои сообщества</TabsTrigger>}
            <TabsTrigger value="popular">Популярные</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
                <span className="ml-2 text-lg">Загрузка сообществ...</span>
              </div>
            ) : filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map(community => (
                  <Link to={`/communities/${community.id}`} key={community.id}>
                    <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
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
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={community.avatar_url || undefined} />
                            <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <CardTitle className="text-xl">{community.name}</CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">{community.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {community.topics && community.topics.map((topic, index) => (
                            <Badge key={index} variant="outline">{topic}</Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{community.members_count || 0} участников</span>
                          <span className="mx-2">•</span>
                          <span>{community.posts_count || 0} публикаций</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'Сообществ по вашему запросу не найдено' : 'Сообществ пока нет'}
                </p>
              </div>
            )}
          </TabsContent>
          
          {user && (
            <TabsContent value="my">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
                  <span className="ml-2 text-lg">Загрузка ваших сообществ...</span>
                </div>
              ) : myCommunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCommunities.map(community => (
                    <Link to={`/communities/${community.id}`} key={community.id}>
                      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
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
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={community.avatar_url || undefined} />
                              <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl">{community.name}</CardTitle>
                          </div>
                          <CardDescription className="line-clamp-2">{community.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {community.topics && community.topics.map((topic, index) => (
                              <Badge key={index} variant="outline">{topic}</Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{community.members_count || 0} участников</span>
                            <span className="mx-2">•</span>
                            <span>{community.posts_count || 0} публикаций</span>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
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
                <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
                <span className="ml-2 text-lg">Загрузка популярных сообществ...</span>
              </div>
            ) : popularCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularCommunities.map(community => (
                  <Link to={`/communities/${community.id}`} key={community.id}>
                    <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
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
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={community.avatar_url || undefined} />
                            <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <CardTitle className="text-xl">{community.name}</CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">{community.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {community.topics && community.topics.map((topic, index) => (
                            <Badge key={index} variant="outline">{topic}</Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{community.members_count || 0} участников</span>
                          <span className="mx-2">•</span>
                          <span>{community.posts_count || 0} публикаций</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  Популярных сообществ пока нет
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default CommunitiesPage;
