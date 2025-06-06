
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SnippetCard from '@/components/SnippetCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Snippet } from '@/types/database';

const SnippetsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: snippets, isLoading } = useQuery({
    queryKey: ['snippets', debouncedSearchTerm, selectedLanguage, selectedTag, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('snippets')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `);

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(`title.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`);
      }

      // Apply language filter
      if (selectedLanguage !== 'all') {
        query = query.eq('language', selectedLanguage);
      }

      // Apply tag filter
      if (selectedTag !== 'all') {
        query = query.contains('tags', [selectedTag]);
      }

      // Apply sorting
      if (sortBy === 'views_count') {
        query = query.order('views_count', { ascending: false });
      } else if (sortBy === 'title') {
        query = query.order('title', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Snippet[];
    }
  });

  // Get unique languages from snippets for filter
  const { data: languages } = useQuery({
    queryKey: ['snippet-languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snippets')
        .select('language')
        .not('language', 'is', null);

      if (error) throw error;
      
      const uniqueLanguages = [...new Set(data.map(item => item.language))];
      return uniqueLanguages.sort();
    }
  });

  // Get unique tags from snippets for filter
  const { data: tags } = useQuery({
    queryKey: ['snippet-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snippets')
        .select('tags')
        .not('tags', 'is', null);

      if (error) throw error;
      
      const allTags = data.flatMap(item => item.tags || []);
      const uniqueTags = [...new Set(allTags)];
      return uniqueTags.sort();
    }
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('all');
    setSelectedTag('all');
    setSortBy('created_at');
  };

  const hasActiveFilters = searchTerm || selectedLanguage !== 'all' || selectedTag !== 'all' || sortBy !== 'created_at';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Сниппеты кода
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Найдите полезные фрагменты кода от сообщества
            </p>
          </div>
          <Button 
            onClick={() => navigate('/snippets/create')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4 md:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Создать сниппет
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по названию или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Language Filter */}
            <div className="w-full lg:w-48">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Язык" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все языки</SelectItem>
                  {languages?.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            <div className="w-full lg:w-48">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Тег" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все теги</SelectItem>
                  {tags?.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Новые</SelectItem>
                  <SelectItem value="views_count">Популярные</SelectItem>
                  <SelectItem value="title">По названию</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Filter className="mr-1 h-3 w-3" />
                Активные фильтры:
              </span>
              
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Поиск: "{searchTerm}"
                </Badge>
              )}
              
              {selectedLanguage !== 'all' && (
                <Badge variant="secondary">
                  Язык: {selectedLanguage}
                </Badge>
              )}
              
              {selectedTag !== 'all' && (
                <Badge variant="secondary">
                  Тег: {selectedTag}
                </Badge>
              )}
              
              {sortBy !== 'created_at' && (
                <Badge variant="secondary">
                  Сортировка: {sortBy === 'views_count' ? 'Популярные' : 'По названию'}
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

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : snippets && snippets.length > 0 ? (
          <div className="space-y-6">
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                id={snippet.id}
                title={snippet.title}
                description={snippet.description}
                language={snippet.language}
                tags={snippet.tags}
                authorName={snippet.profiles?.full_name || snippet.profiles?.username}
                authorAvatar={snippet.profiles?.avatar_url}
                authorId={snippet.user_id}
                authorUsername={snippet.profiles?.username}
                createdAt={snippet.created_at}
                viewsCount={snippet.views_count || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <Search className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Сниппеты не найдены
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {hasActiveFilters 
                  ? 'Попробуйте изменить фильтры поиска'
                  : 'Станьте первым, кто поделится сниппетом!'
                }
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Очистить фильтры
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/snippets/create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Создать сниппет
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SnippetsPage;
