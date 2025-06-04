
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import CommunityPostActions from '@/components/community/CommunityPostActions';
import UserProfileLink from '@/components/UserProfileLink';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CommunityPostDetailPage = () => {
  const { id: communityId, postId } = useParams<{ id: string; postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  
  useEffect(() => {
    if (!communityId || !postId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('community_posts')
          .select(`
            *,
            profiles(username, full_name, avatar_url)
          `)
          .eq('id', postId)
          .eq('community_id', communityId)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          setNotFound(true);
        } else {
          setPost(data);
          setLikesCount(data.likes_count || 0);
          
          // Check if user liked this post
          if (user) {
            const { data: likeData } = await supabase
              .from('community_post_likes')
              .select('id')
              .eq('post_id', postId)
              .eq('user_id', user.id)
              .maybeSingle();
            
            setUserLiked(!!likeData);
          }
        }
      } catch (error: any) {
        console.error('Error fetching community post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [communityId, postId, user]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для оценки поста необходимо войти",
        variant: "destructive"
      });
      return;
    }

    setLikeLoading(true);
    try {
      if (userLiked) {
        // Remove like
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        setLikesCount(Math.max(0, likesCount - 1));
        setUserLiked(false);
      } else {
        // Add like
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
          
        if (error) throw error;
        setLikesCount(likesCount + 1);
        setUserLiked(true);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить оценку поста",
        variant: "destructive"
      });
    } finally {
      setLikeLoading(false);
    }
  };
  
  if (notFound) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <Card>
            <CardContent className="text-center py-8">
              <h1 className="text-2xl font-bold mb-4">Пост не найден</h1>
              <p className="text-gray-500">Возможно, пост был удален или не существует.</p>
              <Button onClick={() => navigate(`/communities/${communityId}`)}>
                Вернуться в сообщество
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/communities/${communityId}`)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться в сообщество
        </Button>
        
        <Card>
          <CardContent className="space-y-6 p-8">
            {loading ? (
              <>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
                  
                  <div className="flex items-center justify-between">
                    <UserProfileLink 
                      username={post.profiles?.username}
                      fullName={post.profiles?.full_name}
                      avatarUrl={post.profiles?.avatar_url}
                      userId={post.user_id}
                      className="text-base"
                    />
                    
                    <p className="text-gray-500 dark:text-gray-400">
                      Опубликовано {format(new Date(post.created_at), 'dd MMMM yyyy в HH:mm', { locale: ru })}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={userLiked ? "default" : "outline"}
                      size="sm"
                      onClick={handleLike}
                      disabled={likeLoading || !user}
                      className={`gap-2 ${userLiked ? 'bg-red-500 hover:bg-red-600' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${userLiked ? 'fill-current' : ''}`} />
                      {likesCount} лайков
                    </Button>
                    
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments_count || 0} комментариев</span>
                    </div>
                  </div>

                  {user && (
                    <CommunityPostActions 
                      communityId={communityId!}
                      postId={postId!}
                      isAuthor={post.user_id === user.id}
                      isModerator={false}
                      onPostDeleted={() => navigate(`/communities/${communityId}`)}
                    />
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CommunityPostDetailPage;
