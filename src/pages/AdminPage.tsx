
// We'll fix AdminPage to use the proper types for blog_posts and support_requests tables
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { BlogPost, SupportRequest } from '@/types/database';
import { Loader2, PlusCircle } from 'lucide-react';

// Form schema for blog post
const blogPostSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  excerpt: z.string().min(10, {
    message: "Excerpt must be at least 10 characters.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  image_url: z.string().optional(),
});

// Support request status schema
const supportRequestSchema = z.object({
  status: z.enum(["pending", "reviewed", "answered"])
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      category: "",
      image_url: "",
    },
  });
  
  useEffect(() => {
    if (!user) return;
    
    const checkAdminStatus = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setIsAdmin(data?.is_admin || false);
        
        if (data?.is_admin) {
          await Promise.all([
            fetchBlogPosts(),
            fetchSupportRequests(),
          ]);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles:author_id (username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setBlogPosts(data as unknown as BlogPost[] || []);
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
      
      setSupportRequests(data as SupportRequest[] || []);
    } catch (error) {
      console.error('Error fetching support requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support requests',
        variant: 'destructive',
      });
    }
  };
  
  const onSubmitBlogPost = async (values: BlogPostFormValues) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: values.title,
          excerpt: values.excerpt,
          content: values.content,
          category: values.category,
          image_url: values.image_url || null,
          author_id: user.id,
        });
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Blog post created successfully',
      });
      
      form.reset();
      fetchBlogPosts();
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post',
        variant: 'destructive',
      });
    }
  };
  
  const deleteBlogPost = async (id: string) => {
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
  
  const updateSupportRequestStatus = async (id: string, status: 'pending' | 'reviewed' | 'answered') => {
    try {
      const { error } = await supabase
        .from('support_requests')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Support request status updated',
      });
      
      fetchSupportRequests();
    } catch (error) {
      console.error('Error updating support request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update support request status',
        variant: 'destructive',
      });
    }
  };
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mr-2" />
          <span>Loading admin panel...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
            <p className="mb-4">You do not have permission to access the admin panel.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <Tabs defaultValue="blog">
          <TabsList className="mb-6">
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="support">Support Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blog">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Blog Post</CardTitle>
                    <CardDescription>Fill out the form to create a new blog post.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitBlogPost)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Blog post title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="tutorials">Tutorials</SelectItem>
                                  <SelectItem value="news">News</SelectItem>
                                  <SelectItem value="tips">Tips & Tricks</SelectItem>
                                  <SelectItem value="career">Career</SelectItem>
                                  <SelectItem value="technology">Technology</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Excerpt</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Short excerpt for the blog post" 
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Full blog post content" 
                                  {...field}
                                  rows={10}
                                />
                              </FormControl>
                              <FormDescription>
                                Use paragraphs separated by a new line.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="image_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Blog Post
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold mb-4">Blog Posts</h2>
                
                <div className="space-y-4">
                  {blogPosts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No blog posts found
                    </div>
                  ) : (
                    blogPosts.map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <div className="flex justify-between">
                            <CardTitle>{post.title}</CardTitle>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteBlogPost(post.id)}
                            >
                              Delete
                            </Button>
                          </div>
                          <CardDescription>
                            {new Date(post.created_at).toLocaleDateString()} • {post.category}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500">{post.excerpt}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="support">
            <h2 className="text-2xl font-semibold mb-4">Support Requests</h2>
            
            <div className="space-y-4">
              {supportRequests.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No support requests found
                </div>
              ) : (
                supportRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.subject}</CardTitle>
                          <CardDescription>
                            From: {request.name} ({request.email})
                          </CardDescription>
                        </div>
                        <Select
                          defaultValue={request.status}
                          onValueChange={(value) => updateSupportRequestStatus(
                            request.id, 
                            value as 'pending' | 'reviewed' | 'answered'
                          )}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="answered">Answered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{request.message}</p>
                    </CardContent>
                    <CardFooter className="text-sm text-gray-500">
                      Received: {new Date(request.created_at).toLocaleString()}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
