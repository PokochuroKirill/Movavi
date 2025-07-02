import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchPostById, 
  fetchPostComments, 
  addCommentToPost, 
  usePostLikes 
} from '@/hooks/useCommunityQueries';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { CommunityPost, CommunityComment } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import CommunityPostActions from '@/components/community/CommunityPostActions';
import LoaderSpinner from '@/components/ui/LoaderSpinner';

const CommunityPostDetailPage = () => {
  const { communityId, postId } = useParams<{ communityId: string; postId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Новый стейт для ID создателя сообщества
  const [communityCreatorId, setCommunityCreatorId] = useState<string | undefined>(undefined);
  
  const {
    likesCount,
    userLiked,
    loading: likesLoading,
    loadLikes,
    toggleLike
  } = usePostLikes(postId || '');

  useEffect(() => {
    if (postId) {
      loadPostData();
      loadLikes();
    }
  }, [postId]);

  const loadPostData = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const [postData, commentsData] = await Promise.all([
        fetchPostById(postId),
        fetchPostComments(postId)
      ]);

      setPost(postData);
      setComments(commentsData);

      // Получим ID создателя сообщества (один раз)
      if (postData?.community_id) {
        const { data: commData, error } = await import('@/integrations/supabase/client').then(({ supabase }) =>
          supabase
            .from('communities')
            .select('creator_id')
            .eq('id', postData.community_id)
            .single()
        );
        if (!error && commData?.creator_id) {
          setCommunityCreatorId(commData.creator_id);
        }
      }
    } catch (error) {
      console.error('Error loading post data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пост',
        variant: 'destructive'
      });
      navigate('/communities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !postId || !newComment.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Для добавления комментария необходимо войти',
        variant: 'destructive'
      });
      return;
    }

    setSubmittingComment(true);
    try {
      const success = await addCommentToPost(postId, user.id, newComment);
      if (success) {
        setNewComment('');
        await loadPostData(); // Перезагружаем комментарии
        toast({
          title: 'Комментарий добавлен',
          description: 'Ваш комментарий был успешно добавлен'
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive'
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post?.title || 'Пост в сообществе',
        url: window.location.href
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Ссылка скопирована',
        description: 'Ссылка на пост скопирована в буфер обмена'
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoaderSpinner />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Пост не найден</h1>
            <p className="text-gray-600 mt-2">Возможно, пост был удален</p>
            <Button 
              onClick={() => navigate('/communities')}
              className="mt-4"
            >
              Вернуться к сообществам
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // определим: автор, модератор, пользователь
  const isAuthor = user && user.id === post.user_id;
  // для простоты оставим isModerator = false (реальных ролей модераторов нет)
  // поддерживаем только автора и владельца
  const currentUserId = user?.id;

  return (
    <Layout>
      <div className="container max-w-4xl py-24 mt-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/communities/${communityId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться в сообщество
        </Button>

        {/* Основной пост */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {post.profiles?.full_name?.substring(0, 2) || 
                   post.profiles?.username?.substring(0, 2) || 'UN'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">
                    {post.profiles?.full_name || post.profiles?.username || 'Пользователь'}
                  </h3>
                  {post.profiles?.username && (
                    <span className="text-gray-500">@{post.profiles.username}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { 
                    addSuffix: true, 
                    locale: ru 
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            <div className="prose dark:prose-invert max-w-none mb-6">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* === Действия с постом (like/share/delete/edit/report) ==== */}
            <div className="flex items-center gap-6 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLike}
                disabled={likesLoading}
                className={`gap-2 ${userLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`h-4 w-4 ${userLiked ? 'fill-current' : ''}`} />
                {likesCount}
              </Button>
              
              <div className="flex items-center gap-2 text-gray-500">
                <MessageCircle className="h-4 w-4" />
                {comments.length}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="gap-2 text-gray-500"
              >
                <Share2 className="h-4 w-4" />
                Поделиться
              </Button>

              {/* ВАЖНО: Действия управления постом — только если user есть*/}
              {user && (
                <CommunityPostActions
                  postId={post.id}
                  communityId={post.community_id}
                  isAuthor={isAuthor}
                  isModerator={false}
                  communityCreatorId={communityCreatorId}
                  currentUserId={currentUserId}
                  onPostDeleted={() => navigate(`/communities/${communityId}`)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Форма добавления комментария */}
        {user && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user.user_metadata?.full_name?.substring(0, 2) || 'UN'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Напишите комментарий..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {submittingComment ? (
                      <LoaderSpinner size="sm" className="mr-2 border-white" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Отправить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Комментарии */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Комментарии ({comments.length})
          </h2>
          
          {comments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Пока нет комментариев. Станьте первым!
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {comment.profiles?.full_name?.substring(0, 2) || 
                         comment.profiles?.username?.substring(0, 2) || 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">
                          {comment.profiles?.full_name || comment.profiles?.username || 'Пользователь'}
                        </h4>
                        {comment.profiles?.username && (
                          <span className="text-gray-500 text-sm">@{comment.profiles.username}</span>
                        )}
                        <span className="text-gray-500 text-sm">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: ru 
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CommunityPostDetailPage;
