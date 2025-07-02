import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import SnippetCard from '@/components/SnippetCard';
import { Snippet } from '@/types/database';
import LoaderSpinner from '@/components/ui/LoaderSpinner';
const SnippetsPage = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadSnippets();
  }, []);
  const loadSnippets = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from('snippets').select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `).order('created_at', {
        ascending: false
      });
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
        return snippet.title.toLowerCase().includes(searchLower) || snippet.description.toLowerCase().includes(searchLower) || snippet.language.toLowerCase().includes(searchLower) || snippet.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || snippet.profiles?.username?.toLowerCase().includes(searchLower) || snippet.profiles?.full_name?.toLowerCase().includes(searchLower);
      }
      return true;
    });

    // Language filter
    if (selectedLanguage && selectedLanguage !== 'all') {
      filtered = filtered.filter(snippet => snippet.language.toLowerCase() === selectedLanguage.toLowerCase());
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
  }, [snippets, searchTerm, selectedLanguage, sortBy]);
  const languages = useMemo(() => {
    const uniqueLanguages = new Set<string>();
    snippets.forEach(snippet => uniqueLanguages.add(snippet.language));
    return Array.from(uniqueLanguages);
  }, [snippets]);
  return <Layout>
      <div className="container py-24 mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Коллекция сниппетов
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Полезные фрагменты кода для ваших проектов
            </p>
          </div>
          
          {user && <Button onClick={() => navigate('/snippets/create')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Создать сниппет
            </Button>}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input type="search" placeholder="Поиск сниппетов..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Все языки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все языки</SelectItem>
              {languages.map(language => <SelectItem key={language} value={language}>{language}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Сортировать по: Новые" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="oldest">Сначала старые</SelectItem>
              <SelectItem value="alphabetical">По алфавиту</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Snippets Grid */}
        {loading ? <div className="flex justify-center items-center min-h-[200px]">
            <LoaderSpinner />
          </div> : filteredSnippets.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSnippets.map(snippet => <SnippetCard key={snippet.id} snippet={snippet} />)}
          </div> : <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Сниппеты не найдены
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Попробуйте изменить параметры поиска
            </p>
            
          </div>}
      </div>
    </Layout>;
};
export default SnippetsPage;