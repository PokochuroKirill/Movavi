
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
import { Search, Users, MessageCircle, Plus, Code, Filter } from 'lucide-react';
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
               snippet.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
               snippet.profiles?.username?.toLowerCase().includes(searchLower) ||
               snippet.profiles?.full_name?.toLowerCase().includes(searchLower);
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
        snippet.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container py-8 pt-24">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Коллекция сниппетов
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Полезные фрагменты кода для ваших проектов
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Filter className="h-5 w-5" />
              <span className="font-medium">
                {filteredSnippets.length} из {snippets.length} сниппетов
              </span>
            </div>
            
            {user && (
              <Button 
                onClick={() => navigate('/snippets/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать сниппет
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Search */}
                <div className="md:col-span-2">
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Поиск
                  </Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="search"
                      placeholder="Поиск по названию, описанию, языку..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Language Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Язык
                  </Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="mt-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
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
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Тэг
                  </Label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="mt-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
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
            </CardContent>
          </Card>

          {/* Snippets Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filteredSnippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSnippets.map(snippet => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                  <Code className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Сниппеты не найдены
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Попробуйте изменить параметры поиска
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLanguage('all');
                    setSelectedTag('all');
                  }}
                  variant="outline"
                >
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SnippetsPage;
