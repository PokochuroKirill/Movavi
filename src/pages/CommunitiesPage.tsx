import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Calendar, MessageCircle, Search, Plus, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Community } from '@/types/database';
const CommunitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const {
    toast
  } = useToast();
  const {
    data: communities,
    isLoading,
    error
  } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('communities').select(`
          *,
          creator:creator_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `).order('created_at', {
        ascending: false
      });
      if (error) {
        throw error;
      }
      return data as Community[];
    }
  });
  const filteredCommunities = React.useMemo(() => {
    if (!communities) {
      return [];
    }
    let filtered = communities.filter(community => {
      if (searchTerm) {
        return community.name.toLowerCase().includes(searchTerm.toLowerCase()) || community.description.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'members') {
      filtered.sort((a, b) => (b.members_count || 0) - (a.members_count || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return filtered;
  }, [communities, searchTerm, sortBy]);
  return <Layout>
      <div className="container py-24 mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Сообщества
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Найдите сообщества по интересам и общайтесь с единомышленниками
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link to="/communities/create" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Создать сообщество
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input type="text" placeholder="Поиск сообществ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

          <div></div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Сортировать по: Новые" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="oldest">Сначала старые</SelectItem>
              <SelectItem value="members">По участникам</SelectItem>
              <SelectItem value="name">По алфавиту</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Communities Grid */}
        {isLoading ? <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div> : filteredCommunities.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map(community => <Link key={community.id} to={`/communities/${community.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {community.banner_url && <div className="h-32 overflow-hidden rounded-t-lg">
                      <img src={community.banner_url} alt={community.name} className="w-full h-full object-cover" />
                    </div>}
                  
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={community.avatar_url || undefined} />
                        <AvatarFallback>
                          {community.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1 truncate">
                          {community.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {community.creator?.full_name || community.creator?.username || 'Пользователь'}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {community.description}
                    </p>
                    
                    {community.topics && community.topics.length > 0 && <div className="flex flex-wrap gap-1 mb-4">
                        {community.topics.slice(0, 3).map((topic, index) => <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>)}
                        {community.topics.length > 3 && <Badge variant="outline" className="text-xs">
                            +{community.topics.length - 3}
                          </Badge>}
                      </div>}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{community.members_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{community.posts_count || 0}</span>
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {formatDistanceToNow(new Date(community.created_at), {
                    addSuffix: true,
                    locale: ru
                  })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>)}
          </div> : <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {communities && communities.length === 0 ? 'Сообществ пока нет' : 'Сообщества не найдены'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {communities && communities.length === 0 ? 'Будьте первым, кто создаст сообщество!' : 'Попробуйте изменить параметры поиска'}
            </p>
            
          </div>}
      </div>
    </Layout>;
};
export default CommunitiesPage;