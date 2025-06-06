import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Snippet } from '@/types/database';
import { Search, Filter, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import SnippetCard from '@/components/SnippetCard';

const PROGRAMMING_LANGUAGES = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'TypeScript', 'Swift', 'Kotlin', 'Dart', 'HTML', 'CSS', 'SQL', 'Bash', 'PowerShell'
];

const SnippetsPage = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSnippets();
  }, []);

  useEffect(() => {
    filterSnippets();
  }, [snippets, searchTerm, selectedLanguage, selectedTags]);

  const fetchSnippets = async () => {
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSnippets(data || []);
      
      // Собираем все уникальные теги
      const tags = new Set<string>();
      data?.forEach(snippet => {
        snippet.tags?.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags).sort());
      
    } catch (error: any) {
      console.error('Error fetching snippets:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сниппеты',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSnippets = () => {
    let filtered = snippets;

    // Поиск по названию и описанию
    if (searchTerm) {
      filtered = filtered.filter(snippet =>
        snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по языку программирования
    if (selectedLanguage) {
      filtered = filtered.filter(snippet =>
        snippet.language.toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    // Фильтр по тегам
    if (selectedTags.length > 0) {
      filtered = filtered.filter(snippet =>
        selectedTags.some(tag =>
          snippet.tags?.includes(tag)
        )
      );
    }

    setFilteredSnippets(filtered);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('');
    setSelectedTags([]);
  };

  const handleSnippetClick = (snippetId: string) => {
    navigate(`/snippets/${snippetId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-7xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl py-24 mt-8">
        <div className="space-y-8">
          {/* Заголовок и кнопка создания */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Сниппеты кода
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Коллекция полезных фрагментов кода от сообщества разработчиков
              </p>
            </div>
            {user && (
              <Link to="/snippets/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Создать сниппет
                </Button>
              </Link>
            )}
          </div>

          {/* Поиск и фильтры */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Поиск сниппетов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Язык программирования" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все языки</SelectItem>
                    {PROGRAMMING_LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Теги
                  </Button>
                  {(searchTerm || selectedLanguage || selectedTags.length > 0) && (
                    <Button variant="outline" onClick={clearFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Очистить
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {showFilters && (
              <CardContent className="border-t">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Результаты поиска */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Найдено сниппетов: {filteredSnippets.length}
            </h2>
          </div>

          {/* Список сниппетов */}
          {filteredSnippets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {snippets.length === 0 
                    ? 'Пока нет сниппетов' 
                    : 'Сниппеты не найдены. Попробуйте изменить параметры поиска.'
                  }
                </p>
                {user && snippets.length === 0 && (
                  <Link to="/snippets/create">
                    <Button>Создать первый сниппет</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  id={snippet.id}
                  title={snippet.title}
                  description={snippet.description}
                  language={snippet.language}
                  tags={snippet.tags || []}
                  author={snippet.profiles?.full_name || snippet.profiles?.username || 'Аноним'}
                  authorAvatar={snippet.profiles?.avatar_url}
                  authorId={snippet.user_id}
                  authorUsername={snippet.profiles?.username}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SnippetsPage;
