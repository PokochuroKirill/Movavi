
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/database';

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  useEffect(() => {
    fetchBlogPosts();
  }, []);
  
  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles:author_id(username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMorePosts = () => {
    setVisiblePosts(prev => prev + 4);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setActiveCategory(null);
  };
  
  const filterByCategory = (category: string) => {
    setActiveCategory(category === activeCategory ? null : category);
    setSearchQuery('');
  };
  
  // Get unique categories
  const categories = [...new Set(blogPosts.map(post => post.category))];
  
  // Filter posts by search query and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = activeCategory === null || post.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  }).slice(0, visiblePosts);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-2">DevHub Blog</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Latest news, guides, and tips for developers
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="w-full md:w-2/3">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/3 flex flex-wrap gap-2 justify-start md:justify-end">
              {categories.map(category => (
                <Button 
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => filterByCategory(category)}
                  className={activeCategory === category ? "gradient-bg text-white" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mr-2" />
              <span>Loading articles...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 dark:text-gray-300">No articles found</p>
              {(searchQuery || activeCategory) && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory(null);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {filteredPosts.map((post) => (
                  <Link to={`/blog/${post.id}`} key={post.id}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="text-sm text-muted-foreground mb-2">{post.category} • {formatDate(post.created_at)}</div>
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <CardDescription>{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-between">
                        <div className="text-sm text-muted-foreground flex items-center">
                          {post.profiles?.avatar_url && (
                            <img 
                              src={post.profiles.avatar_url} 
                              alt={post.profiles.full_name || post.profiles.username || ''}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          )}
                          {post.profiles?.full_name || post.profiles?.username || 'DevHub Team'}
                        </div>
                        <Button variant="ghost" className="text-devhub-purple hover:text-devhub-purple/80">
                          Read
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
              
              {filteredPosts.length < blogPosts.length && (
                <div className="text-center mt-12">
                  <Button 
                    className="gradient-bg text-white"
                    onClick={loadMorePosts}
                  >
                    Load More Articles
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;
