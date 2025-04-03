
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Clock, CheckCircle2, Mail } from 'lucide-react';
import { BlogPost, SupportRequest } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  
  // Blog post form state
  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
  });
  const [submittingBlog, setSubmittingBlog] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/');
        return;
      }
      
      try {
        // Check if user is admin
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (error || !data || !data.is_admin) {
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        
        // Fetch blog posts
        fetchBlogPosts();
        
        // Fetch support requests
        fetchSupportRequests();
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [user, navigate]);
  
  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles:author_id(username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setBlogPosts(data as BlogPost[]);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    }
  };
  
  const fetchSupportRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSupportRequests(data as SupportRequest[]);
    } catch (error) {
      console.error('Error fetching support requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support requests',
        variant: 'destructive',
      });
    }
  };
  
  const handleBlogFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blogForm.title || !blogForm.excerpt || !blogForm.content || !blogForm.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmittingBlog(true);
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: blogForm.title,
          excerpt: blogForm.excerpt,
          content: blogForm.content,
          category: blogForm.category,
          author_id: user!.id,
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Blog post created successfully',
      });
      
      setBlogForm({
        title: '',
        excerpt: '',
        content: '',
        category: '',
      });
      
      fetchBlogPosts();
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post',
        variant: 'destructive',
      });
    } finally {
      setSubmittingBlog(false);
    }
  };
  
  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      });
      
      fetchBlogPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateSupportRequest = async (id: string, status: 'pending' | 'reviewed' | 'answered') => {
    try {
      const { error } = await supabase
        .from('support_requests')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Support request updated successfully',
      });
      
      fetchSupportRequests();
    } catch (error) {
      console.error('Error updating support request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update support request',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
          <span className="ml-2 text-lg">Loading admin panel...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Should never render this as we redirect non-admins
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-8 mt-8">Admin Panel</h1>

        <Tabs defaultValue="blogs" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="blogs">Blog Management</TabsTrigger>
            <TabsTrigger value="support">Support Requests</TabsTrigger>
          </TabsList>
          
          {/* Blog Management */}
          <TabsContent value="blogs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Create Blog Post Form */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Blog Post
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBlogSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={blogForm.title}
                        onChange={handleBlogFormChange}
                        placeholder="Blog post title"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        name="category"
                        value={blogForm.category}
                        onChange={handleBlogFormChange}
                        placeholder="e.g. JavaScript, API, TypeScript"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        name="excerpt"
                        value={blogForm.excerpt}
                        onChange={handleBlogFormChange}
                        placeholder="Brief summary of the blog post"
                        rows={2}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        name="content"
                        value={blogForm.content}
                        onChange={handleBlogFormChange}
                        placeholder="Full blog post content"
                        rows={10}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="gradient-bg text-white w-full" 
                      disabled={submittingBlog}
                    >
                      {submittingBlog ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Blog Post'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Blog Posts List */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Blog Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {blogPosts.length === 0 ? (
                      <p className="text-center py-6 text-gray-500">No blog posts found</p>
                    ) : (
                      <div className="space-y-6">
                        {blogPosts.map(post => (
                          <div key={post.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{post.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(post.created_at).toLocaleDateString()} • {post.profiles?.full_name || post.profiles?.username}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteBlog(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="mt-2 text-gray-700 dark:text-gray-300">{post.excerpt}</p>
                            <Badge className="mt-2 bg-gray-100 text-gray-800 hover:bg-gray-200">{post.category}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Support Requests */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {supportRequests.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">No support requests found</p>
                ) : (
                  <div className="space-y-6">
                    {supportRequests.map(request => (
                      <div key={request.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{request.subject}</h3>
                            <p className="text-sm text-gray-500">
                              From: {request.name} ({request.email})
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge 
                            className={
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        
                        <p className="mt-3 border-t pt-3">{request.message}</p>
                        
                        <div className="mt-4 flex space-x-2">
                          {request.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateSupportRequest(request.id, 'reviewed')}
                            >
                              <Clock className="mr-1 h-4 w-4" />
                              Mark as Reviewed
                            </Button>
                          )}
                          
                          {(request.status === 'pending' || request.status === 'reviewed') && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateSupportRequest(request.id, 'answered')}
                              className="gradient-bg text-white"
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Mark as Answered
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = `mailto:${request.email}?subject=Re: ${request.subject}`}
                          >
                            <Mail className="mr-1 h-4 w-4" />
                            Reply via Email
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
