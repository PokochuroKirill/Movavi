
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SnippetCard from '@/components/SnippetCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Snippet = {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  author: string;
  authorAvatar?: string;
};

const SnippetsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('snippets')
          .select(`
            id, 
            title, 
            description, 
            language, 
            tags,
            profiles(username, full_name, avatar_url)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedSnippets = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            language: item.language,
            tags: item.tags || [],
            author: item.profiles?.full_name || item.profiles?.username || 'Неизвестный автор',
            authorAvatar: item.profiles?.avatar_url
          }));
          setSnippets(formattedSnippets);
          setFilteredSnippets(formattedSnippets);
        }
      } catch (error: any) {
        console.error('Ошибка при загрузке сниппетов:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить фрагменты кода',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSnippets();
  }, [toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') {
      setFilteredSnippets(snippets);
      return;
    }
    
    const filtered = snippets.filter(
      snippet => 
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredSnippets(filtered);
  };

  const handleAddSnippet = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для создания фрагмента кода необходимо войти в систему",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    navigate('/snippets/create');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Фрагменты кода</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Полезные фрагменты кода для использования в ваших проектах
              </p>
            </div>
            
            <Button 
              className="gradient-bg text-white mt-4 md:mt-0"
              onClick={handleAddSnippet}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить фрагмент кода
            </Button>
          </div>
          
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Поиск фрагментов..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </form>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
              <span className="ml-2 text-lg">Загрузка фрагментов кода...</span>
            </div>
          ) : filteredSnippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  id={snippet.id}
                  title={snippet.title}
                  description={snippet.description}
                  language={snippet.language}
                  tags={snippet.tags}
                  author={snippet.author}
                  authorAvatar={snippet.authorAvatar}
                  onClick={() => navigate(`/snippets/${snippet.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                {searchQuery ? 
                  'Фрагменты кода не найдены. Попробуйте изменить параметры поиска.' : 
                  'Фрагментов кода пока нет. Создайте первый фрагмент!'}
              </p>
              {!searchQuery && (
                <Button 
                  className="gradient-bg text-white"
                  onClick={handleAddSnippet}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать фрагмент кода
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SnippetsPage;
