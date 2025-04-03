
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/database';

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
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
        
        if (data && data.length > 0) {
          // Convert to proper type and set posts
          const typedData = data as unknown as BlogPost[];
          setPosts(typedData);
          
          // Set first post as featured post
          setFeaturedPost(typedData[0]);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const getPostReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const readingTimeMinutes = Math.ceil(words / wordsPerMinute);
    return readingTimeMinutes;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mr-2" />
          <span>Loading blog posts...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">DevHub Blog</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest news, tutorials, and insights from the developer community
          </p>
        </div>
        
        {featuredPost && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-8">
                  <Badge className="mb-4">{featuredPost.category}</Badge>
                  <h3 className="text-3xl font-bold mb-3">
                    <Link to={`/blog/${featuredPost.id}`} className="hover:text-devhub-purple">
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{featuredPost.excerpt}</p>
                  
                  <div className="flex items-center mb-6">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={featuredPost.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {(featuredPost.profiles?.full_name || featuredPost.profiles?.username || 'DH').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{featuredPost.profiles?.full_name || featuredPost.profiles?.username || 'DevHub Team'}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(featuredPost.created_at)}
                        <span className="mx-2">•</span>
                        <Clock className="mr-1 h-3 w-3" />
                        {getPostReadingTime(featuredPost.content)} min read
                      </div>
                    </div>
                  </div>
                  
                  <Link to={`/blog/${featuredPost.id}`}>
                    <Button>
                      Read Article <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                {featuredPost.image_url && (
                  <div className="bg-cover bg-center h-full min-h-[300px]" style={{ backgroundImage: `url(${featuredPost.image_url})` }} />
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(featuredPost ? 1 : 0).map((post) => (
              <Card key={post.id} className="overflow-hidden h-full flex flex-col">
                {post.image_url && (
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${post.image_url})` }} />
                )}
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <Badge>{post.category}</Badge>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {getPostReadingTime(post.content)} min read
                    </div>
                  </div>
                  <CardTitle className="text-xl">
                    <Link to={`/blog/${post.id}`} className="hover:text-devhub-purple">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={post.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {(post.profiles?.full_name || post.profiles?.username || 'DH').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {post.profiles?.full_name || post.profiles?.username || 'DevHub Team'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDate(post.created_at)}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;
