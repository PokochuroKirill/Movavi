
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

const BlogPostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchPost = async () => {
      try {
        setLoading(true);
        
        // Fetch the blog post
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            profiles:author_id(username, full_name, avatar_url)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setPost(data as unknown as BlogPost || null);
        
        // Fetch related posts with the same category
        if (data) {
          const { data: related, error: relatedError } = await supabase
            .from('blog_posts')
            .select(`
              *,
              profiles:author_id(username, full_name, avatar_url)
            `)
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(3);
          
          if (relatedError) throw relatedError;
          
          setRelatedPosts(related as unknown as BlogPost[] || []);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load the blog post',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, toast]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mr-2" />
          <span>Loading article...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto mt-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog">
              <Button className="gradient-bg text-white">
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto mt-12">
          <Link to="/blog" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-devhub-purple mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
          
          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center space-x-4 mb-8">
            <Avatar>
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {(post.profiles?.full_name || post.profiles?.username || 'DH').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.profiles?.full_name || post.profiles?.username || 'DevHub Team'}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-1 h-3 w-3" />
                {formatDate(post.created_at)}
              </div>
            </div>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {relatedPosts.length > 0 && (
            <div className="border-t pt-12 mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedPosts.map(related => (
                  <Link to={`/blog/${related.id}`} key={related.id} className="block">
                    <div className="border p-4 rounded-lg hover:shadow-md transition-shadow h-full">
                      <Badge className="mb-2">{related.category}</Badge>
                      <h3 className="font-bold mb-2">{related.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {related.excerpt}
                      </p>
                      <div className="flex items-center mt-4">
                        <Calendar className="mr-1 h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {formatDate(related.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPostDetailPage;
