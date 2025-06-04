
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, ArrowLeft, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/utils/dateUtils';
import UserProfileLink from '@/components/UserProfileLink';
import { CommunityPost, CommunityComment } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const CommunityPostDetailPage = () => {
  const { communityId, postId } = useParams<{ communityId: string; postId: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
      if (user) {
        checkIfLiked();
      }
    }
  }, [postId, user]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пост",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkIfLiked = async () => {
    if (!user || !postId) return;

    try {
      const { data, error } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !post) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) throw error;

        await supabase
          .from('community_posts')
          .update({ likes_count: Math.max(0, (post.likes_count || 0) - 1) })
          .eq('id', post.id);

        setIsLiked(false);
        setPost(prev => prev ? { ...prev, likes_count: Math.max(0, (prev.likes_count || 0) - 1) } : null);
      } else {
        const { error } = await supabase
          .from('community_post_likes')
          .insert({ post_id: post.id, user_id: user.id });

        if (error) throw error;

        await supabase
          .from('community_posts')
          .update({ likes_count: (post.likes_count || 0) + 1 })
          .eq('id', post.id);

        setIsLiked(true);
        setPost(prev => prev ? { ...prev, likes_count: (prev.likes_count || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось поставить лайк",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async () => {
    if (!user || !post || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('community_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      await supabase
        .from('community_posts')
        .update({ comments_count: (post.comments_count || 0) + 1 })
        .eq('id', post.id);

      setNewComment('');
      await fetchComments();
      setPost(prev => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : null);

      toast({
        title: "Комментарий добавлен",
        description: "Ваш комментарий был успешно добавлен"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить комментарий",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Пост не найден
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Возможно, пост был удален или у вас нет доступа к нему.
            </p>
            <Link to={`/communities/${communityId}`}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Вернуться к сообществу
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-24 mt-8 space-y-6">
        {/* Навигация */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link to={`/communities/${communityId}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Сообщество
          </Link>
          <span>/</span>
          <span>Пост</span>
        </div>

        {/* Основной пост */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-4 flex-1">
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  {post.title}
                </CardTitle>
                
                <div className="flex items-center gap-4">
                  <UserProfileLink 
                    username={post.profiles?.username}
                    fullName={post.profiles?.full_name}
                    avatarUrl={post.profiles?.avatar_url}
                    userId={post.user_id}
                    className="text-sm"
                  />
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    {formatDate(post.created_at)}
                  </div>
                </div>
              </div>

              <Link to={`/communities/${communityId}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </Button>
              </Link>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="flex items-center gap-6 pt-4 border-t">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                disabled={!user}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                {post.likes_count || 0} лайков
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-4 w-4" />
                {post.comments_count || 0} комментариев
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Добавить комментарий */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Добавить комментарий</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишите ваш комментарий..."
                rows={3}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmittingComment ? 'Отправка...' : 'Добавить комментарий'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Комментарии */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Комментарии ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Пока нет комментариев
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <UserProfileLink 
                        username={comment.profiles?.username}
                        fullName={comment.profiles?.full_name}
                        avatarUrl={comment.profiles?.avatar_url}
                        userId={comment.user_id}
                        className="text-sm"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {comment.content}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CommunityPostDetailPage;
