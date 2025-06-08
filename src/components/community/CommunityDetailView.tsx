
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Plus, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Community, CommunityPost, CommunityMember } from '@/types/database';
import { 
  fetchCommunityById, 
  fetchCommunityMembers, 
  isUserMember, 
  joinCommunity, 
  leaveCommunity,
  usePostLikes,
  fetchPostComments,
  useCreateCommunityComment
} from '@/hooks/useCommunityQueries';
import UserProfileLink from '@/components/UserProfileLink';
import CommunityPostActions from './CommunityPostActions';
import CommentActions from './CommentActions';

interface CommunityDetailViewProps {
  communityId: string;
}

const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({ communityId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningCommunity, setJoiningCommunity] = useState(false);

  const createCommentMutation = useCreateCommunityComment();

  const { data: communityPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['community-posts', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            verification_type
          )
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!communityId
  });

  useEffect(() => {
    if (communityPosts) {
      setPosts(communityPosts);
    }
  }, [communityPosts]);

  useEffect(() => {
    loadCommunityData();
  }, [communityId, user]);

  const loadCommunityData = async () => {
    setIsLoading(true);
    try {
      const communityData = await fetchCommunityById(communityId);
      if (communityData) {
        setCommunity(communityData);
      }

      const membersData = await fetchCommunityMembers(communityId);
      setMembers(membersData);

      if (user) {
        const memberStatus = await isUserMember(communityId, user.id);
        setIsMember(memberStatus);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные сообщества',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для вступления в сообщество необходимо войти',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    setJoiningCommunity(true);
    try {
      let success = false;
      
      if (isMember) {
        success = await leaveCommunity(communityId, user.id);
        if (success) {
          setIsMember(false);
          toast({
            title: 'Вы покинули сообщество',
            description: 'Вы успешно покинули сообщество'
          });
        }
      } else {
        success = await joinCommunity(communityId, user.id);
        if (success) {
          setIsMember(true);
          toast({
            title: 'Добро пожаловать!',
            description: 'Вы успешно вступили в сообщество'
          });
        }
      }

      if (success) {
        await loadCommunityData();
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось выполнить действие',
        variant: 'destructive'
      });
    } finally {
      setJoiningCommunity(false);
    }
  };

  const isCreator = user && community?.creator_id === user.id;
  const isModerator = members.some(member => 
    member.user_id === user?.id && (member.role === 'admin' || member.role === 'moderator')
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Сообщество не найдено
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={community.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {community.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {community.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{community.members_count || 0} участников</span>
                </div>
                <span>
                  Создано {formatDistanceToNow(new Date(community.created_at), { 
                    addSuffix: true, 
                    locale: ru 
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isCreator && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/communities/${communityId}/edit`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Управление
                </Button>
              )}
              
              {user && !isCreator && (
                <Button 
                  onClick={handleJoinLeave}
                  disabled={joiningCommunity}
                  variant={isMember ? "outline" : "default"}
                  className={!isMember ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : ""}
                >
                  {joiningCommunity ? (
                    'Загрузка...'
                  ) : isMember ? (
                    'Покинуть'
                  ) : (
                    'Вступить'
                  )}
                </Button>
              )}
              
              {isMember && (
                <Button onClick={() => navigate(`/communities/${communityId}/create-post`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать пост
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={user?.id}
              isAuthor={post.user_id === user?.id}
              isModerator={isModerator || isCreator}
              onPostDeleted={() => refetchPosts()}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Пока нет постов
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Будьте первым, кто создаст пост в этом сообществе!
              </p>
              {isMember && (
                <Button onClick={() => navigate(`/communities/${communityId}/create-post`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать первый пост
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

interface PostCardProps {
  post: CommunityPost & {
    profiles: {
      id: string;
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
      verification_type?: number | null;
    };
  };
  currentUserId?: string;
  isAuthor: boolean;
  isModerator: boolean;
  onPostDeleted: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUserId, 
  isAuthor, 
  isModerator,
  onPostDeleted 
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  
  const { likesCount, userLiked, toggleLike } = usePostLikes(post.id);
  const createCommentMutation = useCreateCommunityComment();

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    setLoadingComments(true);
    try {
      const commentsData = await fetchPostComments(post.id);
      setComments(commentsData);
      setShowComments(true);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await createCommentMutation.mutateAsync({
        postId: post.id,
        content: newComment
      });
      
      setNewComment('');
      // Reload comments
      const commentsData = await fetchPostComments(post.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentDeleted = async () => {
    // Reload comments after deletion
    const commentsData = await fetchPostComments(post.id);
    setComments(commentsData);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <UserProfileLink
            userId={post.profiles.id}
            username={post.profiles.username || undefined}
            fullName={post.profiles.full_name || undefined}
            avatarUrl={post.profiles.avatar_url || undefined}
            verificationType={post.profiles.verification_type}
          />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { 
                addSuffix: true, 
                locale: ru 
              })}
            </span>
            <CommunityPostActions
              postId={post.id}
              communityId={post.community_id}
              isAuthor={isAuthor}
              isModerator={isModerator}
              onPostDeleted={onPostDeleted}
            />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-3">
          {post.title}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="prose max-w-none dark:prose-invert mb-4">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleLike}
            className={userLiked ? "text-red-500" : ""}
          >
            <Heart className={`h-4 w-4 mr-1 ${userLiked ? 'fill-current' : ''}`} />
            {likesCount}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={loadComments}
            disabled={loadingComments}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.comments_count || 0}
          </Button>
        </div>
        
        {showComments && (
          <div className="mt-6 space-y-4">
            {currentUserId && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>Я</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Написать комментарий..."
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      size="sm" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || createCommentMutation.isPending}
                    >
                      Отправить
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {comment.profiles?.full_name?.charAt(0) || 
                       comment.profiles?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <UserProfileLink
                        userId={comment.user_id}
                        username={comment.profiles?.username || undefined}
                        fullName={comment.profiles?.full_name || undefined}
                        avatarUrl={comment.profiles?.avatar_url || undefined}
                        verificationType={comment.profiles?.verification_type}
                        className="font-medium text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: ru 
                          })}
                        </span>
                        <CommentActions
                          commentId={comment.id}
                          isAuthor={comment.user_id === currentUserId}
                          isModerator={isModerator}
                          onCommentDeleted={handleCommentDeleted}
                        />
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityDetailView;
