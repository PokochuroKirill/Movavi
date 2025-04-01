
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SnippetCard from '@/components/SnippetCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';

// Моковые данные для сниппетов
const mockSnippets = [
  {
    id: '1',
    title: 'React useEffect Cleanup',
    code: `useEffect(() => {\n  const subscription = externalStore.subscribe();\n  return () => {\n    subscription.unsubscribe();\n  };\n}, [externalStore]);`,
    language: 'JavaScript',
    author: 'Алексей Петров',
    authorAvatar: 'https://i.pravatar.cc/300?img=1',
    likes: 142,
    tags: ['React', 'Hooks', 'useEffect']
  },
  {
    id: '2',
    title: 'Python List Comprehension',
    code: `# One-line creation of processed list\nsquares = [x**2 for x in range(10) if x % 2 == 0]`,
    language: 'Python',
    author: 'Мария Иванова',
    authorAvatar: 'https://i.pravatar.cc/300?img=2',
    likes: 87,
    tags: ['Python', 'List', 'Comprehension']
  },
  {
    id: '3',
    title: 'CSS Flexbox Centering',
    code: `.center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}`,
    language: 'CSS',
    author: 'Екатерина Новикова',
    authorAvatar: 'https://i.pravatar.cc/300?img=5',
    likes: 231,
    tags: ['CSS', 'Flexbox', 'Layout']
  },
  {
    id: '4',
    title: 'SQL Join Example',
    code: `SELECT orders.id, customers.name, orders.amount\nFROM orders\nINNER JOIN customers ON orders.customer_id = customers.id\nWHERE orders.amount > 100\nORDER BY orders.amount DESC;`,
    language: 'SQL',
    author: 'Дмитрий Козлов',
    authorAvatar: 'https://i.pravatar.cc/300?img=4',
    likes: 68,
    tags: ['SQL', 'Database', 'Join']
  },
  {
    id: '5',
    title: 'Git Branch Management',
    code: `# Create and switch to new branch\ngit checkout -b feature/new-feature\n\n# Push to remote\ngit push -u origin feature/new-feature`,
    language: 'Shell',
    author: 'Сергей Смирнов',
    authorAvatar: 'https://i.pravatar.cc/300?img=3',
    likes: 94,
    tags: ['Git', 'Version Control', 'Terminal']
  },
  {
    id: '6',
    title: 'TypeScript Interface',
    code: `interface User {\n  id: number;\n  name: string;\n  email: string;\n  active?: boolean;\n  roles: string[];\n}`,
    language: 'TypeScript',
    author: 'Андрей Соколов',
    authorAvatar: 'https://i.pravatar.cc/300?img=6',
    likes: 124,
    tags: ['TypeScript', 'Interface', 'Type']
  }
];

const SnippetsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSnippets, setFilteredSnippets] = useState(mockSnippets);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') {
      setFilteredSnippets(mockSnippets);
      return;
    }
    
    const filtered = mockSnippets.filter(
      snippet => 
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredSnippets(filtered);
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
            
            <Button className="gradient-bg text-white mt-4 md:mt-0">
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
          
          {filteredSnippets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Сниппеты не найдены. Попробуйте изменить параметры поиска.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SnippetsPage;
