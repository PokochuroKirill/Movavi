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
import { Users, Calendar, MessageCircle, Search } from 'lucide-react';
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
      <div className="container py-24 mt-8">
        {/* Header and Filters */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Сообщества</h1>
            <p className="text-gray-500">
              Найдите сообщества по интересам и общайтесь с единомышленниками
            </p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Поиск сообществ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="sort" className="text-sm text-gray-500">
                Сортировать:
              </Label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded px-4 py-2 text-sm"
              >
                <option value="recent">Недавно созданные</option>
                <option value="name">По названию</option>
                <option value="members">По количеству участников</option>
              </select>
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Link key={community.id} to={`/communities/${community.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                {community.banner_url && (
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={community.banner_url} 
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar>
                      <AvatarImage src={community.avatar_url || undefined} />
                      <AvatarFallback>
                        {community.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 truncate">
                        {community.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Создатель: {community.creator?.full_name || community.creator?.username || 'Пользователь'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {community.description}
                  </p>
                  
                  {community.topics && community.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {community.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {community.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{community.topics.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{community.members_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{community.posts_count || 0}</span>
                      </div>
                    </div>
                    <span>
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

        {/* Empty State */}
        {communities && communities.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">
              Сообществ пока нет
            </h2>
            <p className="text-gray-500">
              Будьте первым, кто создаст сообщество!
            </p>
            <Button>
              <Link to="/communities/create">Создать сообщество</Link>
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CommunitiesPage;
