
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import Layout from '@/components/Layout';
import SnippetCard from '@/components/SnippetCard';
import { Snippet } from '@/types/database';

const SnippetsPage = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSnippets(data as Snippet[]);
    } catch (error: any) {
      console.error('Error loading snippets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load snippets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSnippets = React.useMemo(() => {
    let filtered = snippets.filter(snippet => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return snippet.title.toLowerCase().includes(searchLower) ||
               snippet.description.toLowerCase().includes(searchLower) ||
               snippet.language.toLowerCase().includes(searchLower) ||
               snippet.tags?.some(tag => 
                 tag.toLowerCase().includes(searchLower)
               ) ||
               (snippet.profiles?.username?.toLowerCase().includes(searchLower)) ||
               (snippet.profiles?.full_name?.toLowerCase().includes(searchLower));
      }
      
      return true;
    });

    // Language filter
    if (selectedLanguage && selectedLanguage !== 'all') {
      filtered = filtered.filter(snippet => 
        snippet.language.toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    // Tag filter
    if (selectedTag && selectedTag !== 'all') {
      filtered = filtered.filter(snippet => 
        snippet.tags?.some(tag => 
          tag.toLowerCase() === selectedTag.toLowerCase()
        )
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [snippets, searchTerm, selectedLanguage, selectedTag, sortBy]);

  const languages = useMemo(() => {
    const uniqueLanguages = new Set<string>();
    snippets.forEach(snippet => uniqueLanguages.add(snippet.language));
    return Array.from(uniqueLanguages);
  }, [snippets]);

  const tags = useMemo(() => {
    const uniqueTags = new Set<string>();
    snippets.forEach(snippet => {
      snippet.tags?.forEach(tag => uniqueTags.add(tag));
    });
    return Array.from(uniqueTags);
  }, [snippets]);

  return (
    <Layout>
      <div className="container py-24 mt-8">
        {/* Header and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Коллекция сниппетов
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Полезные фрагменты кода для ваших проектов
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <Button onClick={() => navigate('/snippets/create')}>
                Создать сниппет
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search Input */}
          <div className="md:col-span-1">
            <Label htmlFor="search">Поиск</Label>
            <div className="relative">
              <Input
                id="search"
                type="search"
                placeholder="Поиск по названию, описанию, языку..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute top-2.5 right-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          {/* Language Filter */}
          <div className="md:col-span-1">
            <Label htmlFor="language">Язык</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Все языки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все языки</SelectItem>
                {languages.map(language => (
                  <SelectItem key={language} value={language}>{language}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tag Filter */}
          <div className="md:col-span-1">
            <Label htmlFor="tag">Тэг</Label>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Все тэги" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все тэги</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sort By */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredSnippets.length} сниппетов
          </p>
          <div className="flex items-center space-x-2">
            <Label htmlFor="sort" className="text-sm text-gray-500 dark:text-gray-400">
              Сортировать по:
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Новые</SelectItem>
                <SelectItem value="oldest">Старые</SelectItem>
                <SelectItem value="alphabetical">Алфавиту</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <>
              <Skeleton className="w-full h-48" />
              <Skeleton className="w-full h-48" />
              <Skeleton className="w-full h-48" />
            </>
          ) : filteredSnippets.length > 0 ? (
            filteredSnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Сниппеты не найдены
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SnippetsPage;
