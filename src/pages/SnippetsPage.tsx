
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
import { useToast } from '@/components/ui/use-toast';

type Snippet = {
  id: string;
  title: string;
  code: string;
  language: string;
  author: string;
  authorAvatar?: string;
  likes: number;
  tags: string[];
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
            code, 
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
            code: item.code,
            language: item.language,
            author: item.profiles?.full_name || item.profiles?.username || 'Неизвестный автор',
            authorAvatar: item.profiles?.avatar_url,
            likes: Math.floor(Math.random() * 100), // Временно, пока нет реальных данных
            tags: item.tags || []
          }));
          setSnippets(formattedSnippets);
          setFilteredSnippets(formattedSnippets);
        }
      } catch (error: any) {
        console.error('Ошибка при загрузке сниппетов:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить сниппеты',
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
        snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredSnippets(filtered);
  };

  const handleAddSnippet = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для создания сниппета необходимо войти в систему",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    // В будущем здесь будет переход на страницу создания сниппета
    toast({
      title: "Функция в разработке",
      description: "Создание сниппетов будет доступно в ближайшее время",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Сниппеты кода</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Просматривайте и делитесь полезными фрагментами кода
              </p>
            </div>
            
            <Button 
              className="gradient-bg text-white mt-4 md:mt-0"
              onClick={handleAddSnippet}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить сниппет
            </Button>
          </div>
          
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Поиск сниппетов..." 
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
              <span className="ml-2 text-lg">Загрузка сниппетов...</span>
            </div>
          ) : filteredSnippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  id={snippet.id}
                  title={snippet.title}
                  code={snippet.code}
                  language={snippet.language}
                  author={snippet.author}
                  authorAvatar={snippet.authorAvatar}
                  likes={snippet.likes}
                  tags={snippet.tags}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                {searchQuery ? 
                  'Сниппеты не найдены. Попробуйте изменить параметры поиска.' : 
                  'Сниппетов пока нет. Добавьте первый сниппет!'}
              </p>
              {!searchQuery && (
                <Button 
                  className="gradient-bg text-white"
                  onClick={handleAddSnippet}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать сниппет
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
