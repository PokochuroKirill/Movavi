
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SnippetCard from '@/components/SnippetCard';
import { Loader2, Plus, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Snippet } from '@/types/database';

const SnippetsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    fetchSnippets();
  }, [search, sortBy, languageFilter, selectedTags]);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('snippets')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `);

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,code.ilike.%${search}%`);
      }

      if (languageFilter) {
        query = query.eq('language', languageFilter);
      }

      if (selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
      }

      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most-liked':
          query = query.order('likes_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const snippetsWithMetadata = await Promise.all((data || []).map(async (snippet) => {
        const { data: likesCount } = await supabase
          .rpc('get_snippet_likes_count', { snippet_id: snippet.id });
        
        const { count: commentsCount } = await supabase
          .from('snippet_comments')
          .select('id', { count: 'exact', head: true })
          .eq('snippet_id', snippet.id);
        
        return {
          ...snippet,
          author: snippet.profiles?.full_name || snippet.profiles?.username || 'Неизвестный автор',
          authorAvatar: snippet.profiles?.avatar_url,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0
        };
      }));

      setSnippets(snippetsWithMetadata);
      setFilteredSnippets(snippetsWithMetadata);

      const languages = [...new Set(snippetsWithMetadata.map(s => s.language))].filter(Boolean);
      setAvailableLanguages(languages);

      const allTags = snippetsWithMetadata.reduce((acc: string[], snippet) => {
        if (snippet.tags && Array.isArray(snippet.tags)) {
          snippet.tags.forEach((tag) => {
            if (!acc.includes(tag)) {
              acc.push(tag);
            }
          });
        }
        return acc;
      }, []);

      setAvailableTags(allTags);
    } catch (error) {
      console.error('Ошибка при загрузке сниппетов:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchSnippets();
  };
  
  const resetFilters = () => {
    setSearch('');
    setSortBy('newest');
    setLanguageFilter('');
    setSelectedTags([]);
    fetchSnippets();
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSnippetClick = (id: string) => {
    navigate(`/snippets/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Сниппеты</h1>
          {user && (
            <Link to="/snippets/create">
              <Button className="gradient-bg text-white">
                <Plus className="h-4 w-4 mr-2" /> Создать сниппет
              </Button>
            </Link>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 shrink-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Фильтры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sort">Сортировка</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort">
                      <SelectValue placeholder="Выберите сортировку" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="newest">Сначала новые</SelectItem>
                        <SelectItem value="oldest">Сначала старые</SelectItem>
                        <SelectItem value="most-liked">Популярные</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Язык программирования</Label>
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Все языки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="">Все языки</SelectItem>
                        {availableLanguages.map(language => (
                          <SelectItem key={language} value={language}>{language}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Теги</Label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {availableTags.map(tag => (
                      <Badge 
                        key={tag} 
                        className={`cursor-pointer ${selectedTags.includes(tag) ? 'gradient-bg text-white' : ''}`}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={applyFilters} 
                  className="w-full gradient-bg text-white"
                >
                  Применить фильтры
                </Button>
                <Button 
                  onClick={resetFilters} 
                  variant="outline" 
                  className="w-full"
                >
                  Сбросить
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full">
            <div className="mb-8 flex items-center justify-between">
              <Input
                type="search"
                placeholder="Поиск сниппетов..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
              </div>
            ) : filteredSnippets.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                Нет сниппетов для отображения.
              </p>
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
                    created_at={snippet.created_at}
                    onClick={() => handleSnippetClick(snippet.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SnippetsPage;
