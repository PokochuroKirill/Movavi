
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommunityPost } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Heart, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import UserProfileLink from '@/components/UserProfileLink';
import { useCommunityPostInteractions } from '@/hooks/useCommunityPostInteractions';

const CommunityPostDetailPage = () => {
  const { communityId, postId } = useParams<{ communityId: string; postId: string }>();
  const { likes, isLiked, toggleLike } = useCommunityPostInteractions(postId || '');

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['community-post', postId],
    queryFn: async (): Promise<CommunityPost> => {
      if (!postId) throw new Error('Post ID is required');
      
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      return data as CommunityPost;
    },
    enabled: !!postId,
  });

  const { data: community } = useQuery({
    queryKey: ['community', communityId],
    queryFn: async () => {
      if (!communityId) throw new Error('Community ID is required');
      
      const { data, error } = await supabase
        .from('communities')
        .select('name')
        .eq('id', communityId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!communityId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-40 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-2">Пост не найден</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Запрошенный пост не существует или был удален.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to={`/communities/${communityId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к сообществу
          </Link>
        </Button>
        {community && (
          <div className="text-sm text-gray-500">
            в сообществе <span className="font-medium">{community.name}</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl mb-4">{post.title}</CardTitle>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <UserProfileLink
              username={post.profiles?.username}
              fullName={post.profiles?.full_name}
              avatarUrl={post.profiles?.avatar_url}
              userId={post.user_id}
            />
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(post.created_at), 'dd MMMM yyyy в HH:mm', { locale: ru })}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
              <span>{likes} лайков</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count || 0} комментариев</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {post.content}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={toggleLike}
              variant={isLiked ? "default" : "outline"}
              className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Убрать лайк' : 'Лайк'} ({likes})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityPostDetailPage;
