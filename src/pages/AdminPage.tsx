
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BlogPost, SupportRequest } from '@/types/database';
import { fetchAllBlogPosts, createBlogPost, deleteBlogPost } from '@/hooks/useBlogQueries';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  
  // Blog post form state
  const [blogTitle, setBlogTitle] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategory, setBlogCategory] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/');
        return;
      }
      
      try {
        // Check if user is an admin
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (!profileData?.is_admin) {
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        await loadAdminData();
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [user, navigate]);
  
  const loadAdminData = async () => {
    try {
      // Load blog posts
      const posts = await fetchAllBlogPosts();
      setBlogPosts(posts);
      
      // Load support requests
      const { data: requests, error: requestsError } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (requestsError) throw requestsError;
      
      setSupportRequests(requests as SupportRequest[]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    }
  };
  
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blogTitle || !blogExcerpt || !blogContent || !blogCategory) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const blogData = {
        title: blogTitle,
        excerpt: blogExcerpt,
        content: blogContent,
        category: blogCategory,
        image_url: blogImageUrl || null
      };
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...blogData,
          author_id: user!.id
        })
        .select('id')
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Успех',
        description: 'Запись блога успешно создана'
      });
      
      // Reset form
      setBlogTitle('');
      setBlogExcerpt('');
      setBlogContent('');
      setBlogCategory('');
      setBlogImageUrl('');
      
      // Reload blogs
      await loadAdminData();
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать запись блога',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteBlog = async (postId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись блога?')) return;
    
    try {
      const success = await deleteBlogPost(postId);
      
      if (success) {
        // Remove from state
        setBlogPosts(blogPosts.filter(post => post.id !== postId));
        toast({
          title: 'Успех',
          description: 'Запись блога успешно удалена'
        });
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить запись блога',
        variant: 'destructive'
      });
    }
  };
  
  const handleUpdateSupportRequest = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_requests')
        .update({ status })
        .eq('id', requestId);
        
      if (error) throw error;
      
      // Update local state
      setSupportRequests(
        supportRequests.map(request => 
          request.id === requestId ? { ...request, status } : request
        )
      );
      
      toast({
        title: 'Успех',
        description: 'Статус обращения обновлен'
      });
    } catch (error) {
      console.error('Error updating support request:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус обращения',
        variant: 'destructive'
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mr-2" />
          <span>Загрузка...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Should never reach here due to navigate in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-8 mt-8">Панель администратора</h1>
        
        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="blog">Управление блогом</TabsTrigger>
            <TabsTrigger value="support">Обращения в поддержку</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blog">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Создать новую запись</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateBlog} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Заголовок</Label>
                      <Input 
                        id="title"
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="excerpt">Краткое описание</Label>
                      <Textarea 
                        id="excerpt"
                        value={blogExcerpt}
                        onChange={(e) => setBlogExcerpt(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Содержание</Label>
                      <Textarea 
                        id="content"
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        rows={10}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Категория</Label>
                      <Input 
                        id="category"
                        value={blogCategory}
                        onChange={(e) => setBlogCategory(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="imageUrl">URL изображения (необязательно)</Label>
                      <Input 
                        id="imageUrl"
                        value={blogImageUrl}
                        onChange={(e) => setBlogImageUrl(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="gradient-bg text-white w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Создание...
                        </>
                      ) : (
                        'Опубликовать'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Опубликованные записи</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                  {blogPosts.length > 0 ? (
                    blogPosts.map(post => (
                      <div 
                        key={post.id} 
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <h3 className="font-bold">{post.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {formatDate(post.created_at)} • {post.category}
                        </p>
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {post.excerpt}
                        </p>
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBlog(post.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      Нет опубликованных записей
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Обращения в поддержку</CardTitle>
              </CardHeader>
              <CardContent>
                {supportRequests.length > 0 ? (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {supportRequests.map(request => (
                      <div 
                        key={request.id} 
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold">{request.subject}</h3>
                            <p className="text-sm">
                              От: {request.name} ({request.email})
                            </p>
                          </div>
                          <div>
                            <span 
                              className={`px-2 py-1 text-xs rounded-full ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {request.status === 'pending' ? 'В ожидании' : 
                               request.status === 'in_progress' ? 'В обработке' :
                               request.status === 'resolved' ? 'Решено' : 'Отклонено'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {formatDate(request.created_at)}
                        </p>
                        <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
                          {request.message}
                        </p>
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant={request.status === 'in_progress' ? 'default' : 'outline'}
                            className={request.status === 'in_progress' ? 'bg-blue-500' : ''}
                            onClick={() => handleUpdateSupportRequest(request.id, 'in_progress')}
                          >
                            В обработке
                          </Button>
                          <Button
                            size="sm"
                            variant={request.status === 'resolved' ? 'default' : 'outline'}
                            className={request.status === 'resolved' ? 'bg-green-500' : ''}
                            onClick={() => handleUpdateSupportRequest(request.id, 'resolved')}
                          >
                            Решено
                          </Button>
                          <Button
                            size="sm"
                            variant={request.status === 'rejected' ? 'destructive' : 'outline'}
                            onClick={() => handleUpdateSupportRequest(request.id, 'rejected')}
                          >
                            Отклонено
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    Нет обращений в поддержку
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
