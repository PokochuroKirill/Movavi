
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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Calendar, MessageCircle, Search, Plus, Hash, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Community } from '@/types/database';

const CommunitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const { toast } = useToast();

  const { data: communities, isLoading, error } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          creator:creator_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Community[];
    }
  });

  const filteredCommunities = React.useMemo(() => {
    // Add null check to prevent the "Cannot read properties of undefined" error
    if (!communities) {
      return [];
    }

    let filtered = communities.filter(community => {
      if (searchTerm) {
        return community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               community.description.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'members') {
      filtered.sort((a, b) => (b.members_count || 0) - (a.members_count || 0));
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [communities, searchTerm, sortBy]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container py-8 pt-24">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-6">
              <Hash className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Сообщества
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Найдите сообщества по интересам и общайтесь с единомышленниками
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Filter className="h-5 w-5" />
              <span className="font-medium">
                {filteredCommunities.length} из {communities?.length || 0} сообществ
              </span>
            </div>
            
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg">
              <Link to="/communities/create" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Создать сообщество
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Поиск сообществ
                  </Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Поиск по названию или описанию..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
                
                {/* Sort */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Сортировка
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="mt-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Недавно созданные</SelectItem>
                      <SelectItem value="name">По названию</SelectItem>
                      <SelectItem value="members">По участникам</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communities Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <Link key={community.id} to={`/communities/${community.id}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105">
                    {community.banner_url && (
                      <div className="h-32 overflow-hidden rounded-t-lg">
                        <img 
                          src={community.banner_url} 
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarImage src={community.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold">
                            {community.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1 truncate text-gray-900 dark:text-gray-100">
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
                      
                      {community.topics && community.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {community.topics.slice(0, 3).map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">
                              {topic}
                            </Badge>
                          ))}
                          {community.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800">
                              +{community.topics.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
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
                </Link>
              ))}
            </div>
          ) : (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                  <Hash className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  {communities && communities.length === 0 ? 'Сообществ пока нет' : 'Сообщества не найдены'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {communities && communities.length === 0 
                    ? 'Будьте первым, кто создаст сообщество!' 
                    : 'Попробуйте изменить параметры поиска'}
                </p>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                  <Link to="/communities/create">Создать сообщество</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CommunitiesPage;
