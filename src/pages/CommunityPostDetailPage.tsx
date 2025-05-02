import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2, Heart, MessageSquare, Share2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommunityPost, CommunityComment } from '@/types/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { incrementCounter, decrementCounter } from '@/utils/dbFunctions';

const CommunityPostDetailPage = () => {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [communityName, setCommunityName] = useState('');
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id && postId) {
      fetchPostData();
      checkMembership();
      fetchComments();
    }
  }, [id, postId, user]);
  
  const fetchPostData = async () => {
    try {
      setLoadingPost(true);
      
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('id', postId)
        .single();
      
      if (postError) {
        throw postError;
      }
      
      setPost(postData as unknown as CommunityPost);
      setLikesCount(postData.likes_count || 0);
      setCommentCount(postData.comments_count || 0);
      setIsAuthor(user?.id === postData.user_id);
      
      // Get community name
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('name')
        .eq('id', id)
        .single();
      
      if (!communityError && communityData) {
        setCommunityName(communityData.name);
      }
      
      // Check if user liked this post
      if (user) {
        try {
          const { count, error } = await supabase
            .rpc('count_post_likes', { 
              post_id_param: postId,
              user_id_param: user.id 
            });
            
          setIsLiked(count > 0);
        } catch (error) {
          console.error('Error checking like status:', error);
          setIsLiked(false);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить публикацию',
        variant: 'destructive',
      });
    } finally {
      setLoadingPost(false);
    }
  };
  
  const checkMembership = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        setIsMember(false);
        setIsAdmin(false);
        return;
      }
      
      setIsMember(true);
      setIsAdmin(data.role === 'admin' || data.role === 'moderator');
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };
  
  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setComments(data as unknown as CommunityComment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для публикации комментария необходимо войти',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    if (!newComment.trim()) {
      setErrorMessage('Комментарий не может быть пустым');
      return;
    }
    
    setSubmittingComment(true);
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          content: newComment,
          post_id: postId,
          user_id: user.id,
        })
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      setComments([data as unknown as CommunityComment, ...comments]);
      setNewComment('');
      setCommentCount(prev => prev + 1);
      
      // Update post comments counter
      await incrementCounter('community_posts', 'comments_count', postId as string);
    
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось опубликовать комментарий',
        variant: 'destructive',
      });
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setComments(comments.filter(comment => comment.id !== commentId));
      setCommentCount(prev => Math.max(0, prev - 1));
      
      // Update post comments counter
      await decrementCounter('community_posts', 'comments_count', postId as string);
      
      toast({
        description: 'Комментарий успешно удален',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить комментарий',
        variant: 'destructive',
      });
    }
  };
  
  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для оценки публикации необходимо войти',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    try {
      if (isLiked) {
        // Remove like using RPC function
        await supabase.rpc('remove_post_like', {
          post_id_param: postId,
          user_id_param: user.id
        });
          
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        
        // Update post likes counter
        await decrementCounter('community_posts', 'likes_count', postId as string);
      } else {
        // Add like using RPC function
        await supabase.rpc('add_post_like', {
          post_id_param: postId,
          user_id_param: user.id
        });
          
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        
        // Update post likes counter
        await incrementCounter('community_posts', 'likes_count', postId as string);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить оценку',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeletePost = async () => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      // Update community posts counter
      await decrementCounter('communities', 'posts_count', id as string);
      
      toast({
        description: 'Публикация успешно удалена',
      });
      
      navigate(`/communities/${id}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить публикацию',
        variant: 'destructive',
      });
      setDeleteDialogOpen(false);
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      description: 'Ссылка скопирована в буфер обмена',
    });
  };
  
  if (loadingPost) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
          <span className="ml-2 text-lg">Загрузка публикации...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Публикация не найдена</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
            Запрашиваемая публикация не существует или была удалена
          </p>
          <Button onClick={() => navigate(`/communities/${id}`)}>
            Вернуться к сообществу
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Link to="/communities" className="hover:text-devhub-purple">Сообщества</Link> &gt; 
                <Link to={`/communities/${id}`} className="hover:text-devhub-purple ml-1">{communityName}</Link>
              </div>
            </div>
            
            {(isAuthor || isAdmin) && (
              <div className="mt-2 sm:mt-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Действия</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAuthor && (
                      <DropdownMenuItem onClick={() => navigate(`/communities/${id}/post/${postId}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                    )}
                    {(isAuthor || isAdmin) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          {/* Main post */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center mb-6">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={post.profiles?.avatar_url || undefined} />
                <AvatarFallback>{(post.profiles?.username?.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {post.profiles?.full_name || post.profiles?.username || 'Пользователь'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(post.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>
            </div>
            
            <div className="prose dark:prose-invert max-w-none mb-8">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            <div className="flex gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-800">
              <Button 
                variant="ghost" 
                className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
                onClick={handleLikeToggle}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <MessageSquare className="h-5 w-5" />
                <span>{commentCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
                <span>Поделиться</span>
              </Button>
            </div>
          </div>
          
          {/* Comment form */}
          <div id="comment-form" className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Оставить комментарий</h2>
            
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Напишите комментарий..." : "Авторизуйтесь для публикации комментария"}
                disabled={submittingComment || !user}
                className="min-h-[100px]"
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submittingComment || !user}
                  className="gradient-bg text-white"
                >
                  {submittingComment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : "Отправить комментарий"}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Comments list */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Комментарии ({commentCount})
            </h2>
            
            {loadingComments ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-devhub-purple" />
                <span className="ml-2">Загрузка комментариев...</span>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <Card key={comment.id} className="overflow-hidden">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                            <AvatarFallback>{(comment.profiles?.username?.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold">
                              {comment.profiles?.full_name || comment.profiles?.username || 'Пользователь'}
                            </span>
                            <p className="text-xs text-gray-500">
                              {format(new Date(comment.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                            </p>
                          </div>
                        </div>
                        
                        {user?.id === comment.user_id && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 opacity-70 hover:opacity-100"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Удалить</span>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 pb-4">
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                Пока нет комментариев. Будьте первым!
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить публикацию?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя будет отменить. Публикация будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommunityPostDetailPage;
