
// We need to update the imports to include supabase
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import CommunityPostActions from '@/components/community/CommunityPostActions';
import { supabase } from '@/integrations/supabase/client';

// Import hooks and types
import { usePostLikes } from '@/hooks/useCommunityQueries';

const CommunityPostDetailPage = () => {
  const { id: communityId, postId } = useParams<{ id: string; postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
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
        }
      } catch (error: any) {
        console.error('Error fetching community post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [communityId, postId]);
  
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
        <Card>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.username} />
                    <AvatarFallback>{post.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="font-medium">
                    {post.profiles?.username}
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold">{post.title}</h1>
                <p className="text-gray-500">
                  Опубликовано {format(new Date(post.created_at), 'dd.MM.yyyy в HH:mm')}
                </p>
                
                <Separator />
                
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                
                <Separator />
                
                {user && (
                  <CommunityPostActions 
                    communityId={communityId!}
                    postId={postId!}
                    isAuthor={post.user_id === user.id}
                    isModerator={false}
                    onPostDeleted={() => navigate(`/communities/${communityId}`)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CommunityPostDetailPage;
