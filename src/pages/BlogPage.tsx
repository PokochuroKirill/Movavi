
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/types/database';

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.rpc('get_all_blog_posts');
        
        if (error) throw error;
        
        setPosts(data as BlogPost[] || []);
      } catch (error: any) {
        console.error('Ошибка при загрузке записей блога:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить записи блога',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-8 mt-8">Блог DevHub</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl">
          Статьи, руководства и новости о веб-разработке, технологиях и нашей платформе.
        </p>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-devhub-purple mr-2" />
            <span className="text-lg">Загрузка статей...</span>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="flex flex-col h-full">
                {post.image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="flex-grow pt-6">
                  <Badge className="mb-2">{post.category}</Badge>
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDate(post.created_at)}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/blog/${post.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Читать статью
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 mb-4">
              В настоящее время нет опубликованных статей.
            </p>
            <p className="text-gray-500">
              Новые статьи будут добавлены в ближайшее время.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPage;
