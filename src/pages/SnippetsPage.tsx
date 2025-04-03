
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SnippetCard from '@/components/SnippetCard';
import { Loader2, Plus, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Snippet } from '@/types/database';

const SnippetsPage = () => {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    fetchSnippets();
  }, []);

  useEffect(() => {
    filterSnippets();
  }, [searchTerm, languageFilter, tagFilter, snippets]);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const snippetsWithMetadata = await Promise.all((data || []).map(async (snippet) => {
        // Get likes count for each snippet
        const { data: likesCount } = await supabase
          .rpc('get_snippet_likes_count', { snippet_id: snippet.id });
        
        // Get comments count for each snippet
        const { count: commentsCount } = await supabase
          .from('snippet_comments')
          .select('id', { count: 'exact', head: true })
          .eq('snippet_id', snippet.id);
        
        return {
          ...snippet,
          author: snippet.profiles?.full_name || snippet.profiles?.username || 'Unnamed Author',
          authorAvatar: snippet.profiles?.avatar_url,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0
        };
      }));

      setSnippets(snippetsWithMetadata);

      // Extract available languages
      const languages = [...new Set(snippetsWithMetadata.map(s => s.language))].filter(Boolean);
      setAvailableLanguages(languages);

      // Extract available tags
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
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSnippets = () => {
    let filtered = [...snippets];

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (snippet) =>
          snippet.title.toLowerCase().includes(lowerSearchTerm) ||
          snippet.description.toLowerCase().includes(lowerSearchTerm) ||
          snippet.code.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Filter by language
    if (languageFilter) {
      filtered = filtered.filter(snippet => snippet.language === languageFilter);
    }

    // Filter by tag
    if (tagFilter) {
      filtered = filtered.filter(snippet => 
        snippet.tags && snippet.tags.includes(tagFilter)
      );
    }

    setFilteredSnippets(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLanguageChange = (value: string) => {
    setLanguageFilter(value);
  };

  const handleTagChange = (value: string) => {
    setTagFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLanguageFilter('');
    setTagFilter('');
  };

  const handleSnippetClick = (id: string) => {
    navigate(`/snippets/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Code Snippets</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-0">
              Discover useful code snippets shared by the community
            </p>
          </div>
          
          <Link to="/snippets/create">
            <Button className="gradient-bg text-white">
              <Plus className="mr-2 h-4 w-4" /> New Snippet
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
              <div className="mb-4">
                <Input
                  placeholder="Search snippets..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Language</label>
                <Select value={languageFilter} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All languages</SelectItem>
                    {availableLanguages.map(language => (
                      <SelectItem key={language} value={language}>{language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tag</label>
                <Select value={tagFilter} onValueChange={handleTagChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All tags</SelectItem>
                    {availableTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(searchTerm || languageFilter || tagFilter) && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              )}
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1" /> Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 10).map(tag => (
                    <Badge 
                      key={tag} 
                      className={`cursor-pointer ${tagFilter === tag ? 'gradient-bg text-white' : ''}`}
                      variant={tagFilter === tag ? "default" : "secondary"}
                      onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Snippets Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-devhub-purple mr-2" />
                <p className="text-lg">Loading snippets...</p>
              </div>
            ) : filteredSnippets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xl mb-4">No snippets found</p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || languageFilter || tagFilter
                    ? "Try adjusting your filters or search term"
                    : "Be the first to share a snippet with the community!"}
                </p>
                {(searchTerm || languageFilter || tagFilter) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
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
