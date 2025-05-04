
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Clock, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import * as CommunityQueries from '@/hooks/useCommunityQueries';
import CommunityPostActions from '@/components/community/CommunityPostActions';

const CommunityPostDetailPage = () => {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [community, setCommunity] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [isPostAuthor, setIsPostAuthor] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { likesCount, userLiked, loadLikes, toggleLike } = CommunityQueries.usePostLikes(postId || '');

  useEffect(() => {
    if (!id || !postId) return;
    
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Fetch post
        const postData = await CommunityQueries.fetchPostById(postId);
        if (!postData) {
          toast({
            title: 'Пост не найден',
            description: 'Запрашиваемый пост не существует или был удален',
            variant: 'destructive',
          });
          navigate(`/communities/${id}`);
          return;
        }
        setPost(postData);
        
        // Check if user is post author
        setIsPostAuthor(user?.id === postData.user_id);
        
        // Fetch community
        const communityData = await CommunityQueries.fetchCommunityById(id);
        setCommunity(communityData);
        
        // Fetch comments
        const commentsData = await CommunityQueries.fetchPostComments(postId);
        setComments(commentsData);
        
        // Check if user is a member and their role
        if (user) {
          const { data: memberData } = await supabase
            .from('community_members')
            .select('role')
            .eq('community_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          setIsMember(!!memberData);
          setIsModerator(memberData?.role === 'admin' || memberData?.role === 'moderator');
        }
        
        // Load likes
        loadLikes();
      } catch (error) {
        console.error('Error loading post data:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные поста',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, postId, user, navigate, toast, loadLikes]);
  
  const handleAddComment = async () => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для публикации комментария необходимо войти',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Комментарий не может быть пустым',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const comment = await CommunityQueries.createPostComment(
        postId as string,
        user.id,
        newComment
      );
      
      if (comment) {
        setComments([...comments, comment]);
        setNewComment('');
        toast({
          title: 'Комментарий опубликован',
          description: 'Ваш комментарий успешно добавлен',
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось опубликовать комментарий',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleJoinCommunity = async () => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для вступления в сообщество необходимо войти',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const success = await CommunityQueries.joinCommunity(id as string, user.id);
      
      if (success) {
        setIsMember(true);
        toast({
          title: 'Успешно',
          description: 'Вы присоединились к сообществу',
        });
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось присоединиться к сообществу',
        variant: 'destructive',
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  const handleLikeToggle = async () => {
    await toggleLike();
  };
  
  const handlePostDeleted = () => {
    navigate(`/communities/${id}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
          <span className="ml-2">Загрузка...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post || !community) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Card className="max-w-md w-full">
              <CardContent className="text-center p-6">
                <h2 className="text-2xl font-bold mb-4">Пост не найден</h2>
                <p className="text-gray-500 mb-4">
                  Возможно, пост был удален или не существует.
                </p>
                <Button
                  asChild
                  className="gradient-bg text-white"
                >
                  <Link to={`/communities/${id}`}>
                    Вернуться в сообщество
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <Link to={`/communities/${id}`} className="inline-flex items-center mb-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Вернуться в сообщество</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8 mr-3">
                      <AvatarImage src={post.profiles?.avatar_url || undefined} alt={post.profiles?.username || 'User'} />
                      <AvatarFallback>{post.profiles?.username ? post.profiles?.username[0].toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link to={`/user/${post.profiles?.username}`} className="font-semibold hover:underline">
                        {post.profiles?.full_name || post.profiles?.username || 'User'}
                      </Link>
                      <p className="text-gray-500 text-sm">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Post actions */}
                  <CommunityPostActions 
                    postId={post.id}
                    communityId={community.id}
                    isAuthor={isPostAuthor}
                    isModerator={isModerator}
                    onPostDeleted={handlePostDeleted}
                  />
                </div>
                
                <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                
                <Separator className="my-6" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleLikeToggle}
                      className="flex items-center text-gray-500 hover:text-devhub-purple focus:outline-none"
                    >
                      <ThumbsUp className={`h-5 w-5 mr-1 ${userLiked ? 'text-devhub-purple' : ''}`} />
                      <span>{likesCount}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-devhub-purple focus:outline-none">
                      <MessageSquare className="h-5 w-5 mr-1" />
                      <span>{comments.length}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-devhub-purple focus:outline-none">
                      <Share2 className="h-5 w-5 mr-1" />
                      <span>Поделиться</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Comments Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Комментарии</h2>
                
                {/* Add Comment Form */}
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url || undefined} alt={user?.user_metadata?.username || 'User'} />
                      <AvatarFallback>{user?.user_metadata?.username ? user?.user_metadata?.username[0].toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                      <Textarea
                        placeholder="Напишите свой комментарий..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full rounded-md border-gray-200 dark:border-gray-700 shadow-sm focus:border-devhub-purple focus:ring-devhub-purple"
                      />
                      <div className="text-right mt-2">
                        <Button
                          onClick={handleAddComment}
                          disabled={submitting}
                          className="gradient-bg text-white"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Отправка...
                            </>
                          ) : (
                            'Отправить'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Comment List */}
                <div>
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="py-4 border-b last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.profiles?.avatar_url || undefined} alt={comment.profiles?.username || 'User'} />
                            <AvatarFallback>{comment.profiles?.username ? comment.profiles?.username[0].toUpperCase() : 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold">
                              {comment.profiles?.full_name || comment.profiles?.username || 'User'}
                            </div>
                            <div className="text-gray-500 text-xs mb-1">
                              {formatDate(comment.created_at)}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Пока нет комментариев.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">О сообществе</h2>
                <div className="flex items-center mb-4">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarImage src={community.avatar_url || undefined} alt={community.name} />
                    <AvatarFallback>{community.name ? community.name[0].toUpperCase() : 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="font-semibold">{community.name}</div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{community.description}</p>
                
                <div className="flex items-center text-gray-500 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  Создано: {formatDate(community.created_at)}
                </div>
                
                {isMember ? (
                  <Button variant="destructive" className="w-full">
                    Покинуть сообщество
                  </Button>
                ) : (
                  <Button className="w-full gradient-bg text-white" onClick={handleJoinCommunity}>
                    Присоединиться
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CommunityPostDetailPage;
