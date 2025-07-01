
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Users, Plus, MessageCircle, Heart, Settings, Edit3 } from 'lucide-react';
import { Community, CommunityMember, CommunityPost } from '@/types/database';
import UserProfileLink from '@/components/UserProfileLink';
import CommunityManagementActions from './CommunityManagementActions';
import CreateCommunityPostDialog from './CreateCommunityPostDialog';
import CommunityPostActions from './CommunityPostActions';
import CommentActions from './CommentActions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityDetailViewProps {
  community: Community | null;
  currentUserMembership: CommunityMember | null;
  members: CommunityMember[];
  posts: CommunityPost[];
  loading: boolean;
  onJoinCommunity: () => Promise<void>;
  onLeaveCommunity: () => Promise<void>;
  onRefresh: () => Promise<void>;
  canManage: boolean;
  userId?: string;
}

const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({
  community,
  currentUserMembership,
  members,
  posts,
  loading,
  onJoinCommunity,
  onLeaveCommunity,
  onRefresh,
  canManage,
  userId
}) => {
  const [showMembers, setShowMembers] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [postComments, setPostComments] = useState<{
    [key: string]: any[];
  }>({});
  const [loadingComments, setLoadingComments] = useState<{
    [key: string]: boolean;
  }>({});
  const [postLikes, setPostLikes] = useState<{
    [key: string]: { count: number; userLiked: boolean };
  }>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const togglePostExpansion = async (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      await loadComments(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const loadComments = async (postId: string) => {
    if (postComments[postId]) return;
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('community_comments')
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
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPostComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить комментарии',
        variant: 'destructive'
      });
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const loadPostLikes = async (postId: string) => {
    try {
      const { count, error: countError } = await supabase
        .from('community_post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (countError) throw countError;

      let userLiked = false;
      if (user) {
        const { data, error: likeError } = await supabase
          .from('community_post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (likeError) throw likeError;
        userLiked = !!data;
      }

      setPostLikes(prev => ({
        ...prev,
        [postId]: { count: count || 0, userLiked }
      }));
    } catch (error) {
      console.error('Error loading post likes:', error);
    }
  };

  const loadCommentsCount = async (postId: string) => {
    try {
      const { count, error } = await supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      
      setPostComments(prev => ({
        ...prev,
        [`${postId}_count`]: count || 0
      }));
    } catch (error) {
      console.error('Error loading comments count:', error);
    }
  };

  const togglePostLike = async (postId: string) => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для оценки поста необходимо войти в систему',
        variant: 'destructive'
      });
      return;
    }

    const currentLikes = postLikes[postId] || { count: 0, userLiked: false };
    
    try {
      if (currentLikes.userLiked) {
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setPostLikes(prev => ({
          ...prev,
          [postId]: {
            count: Math.max(0, currentLikes.count - 1),
            userLiked: false
          }
        }));
      } else {
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;

        setPostLikes(prev => ({
          ...prev,
          [postId]: {
            count: currentLikes.count + 1,
            userLiked: true
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить оценку поста',
        variant: 'destructive'
      });
    }
  };

  const handleCommentSubmit = async (postId: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content
        })
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
        .single();

      if (error) throw error;

      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data],
        [`${postId}_count`]: (prev[`${postId}_count`] || 0) + 1
      }));

      toast({
        title: 'Комментарий добавлен',
        description: 'Ваш комментарий был успешно опубликован'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive'
      });
    }
  };

  const handleCommentDelete = (postId: string, commentId: string) => {
    setPostComments(prev => ({
      ...prev,
      [postId]: prev[postId]?.filter(comment => comment.id !== commentId) || [],
      [`${postId}_count`]: Math.max(0, (prev[`${postId}_count`] || 0) - 1)
    }));
  };

  // Load likes and comments count for all posts when component mounts
  React.useEffect(() => {
    posts.forEach(post => {
      loadPostLikes(post.id);
      loadCommentsCount(post.id);
    });
  }, [posts, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Сообщество не найдено
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Запрашиваемое сообщество не существует или было удалено.
        </p>
      </div>
    );
  }

  const isMember = !!currentUserMembership;
  const isCreator = userId === community.creator_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Community Header */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {community.avatar_url && (
                  <img 
                    src={community.avatar_url} 
                    alt={community.name} 
                    className="w-20 h-20 rounded-xl object-cover shadow-lg" 
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    {community.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                    {community.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      <Users className="w-4 h-4 mr-2" />
                      {community.members_count || 0} участников
                    </Badge>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {community.posts_count || 0} постов
                    </Badge>
                    {!community.is_public && (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        Приватное
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {isMember ? (
                  <>
                    <Button 
                      onClick={() => setShowCreatePost(true)} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Создать пост
                    </Button>
                    {!isCreator && (
                      <Button variant="outline" onClick={onLeaveCommunity}>
                        Покинуть
                      </Button>
                    )}
                  </>
                ) : (
                  <Button 
                    onClick={onJoinCommunity} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    Присоединиться
                  </Button>
                )}
                
                {isCreator && (
                  <CommunityManagementActions 
                    communityId={community.id} 
                    onRefresh={onRefresh} 
                  />
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Posts */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Посты сообщества
                </CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                      Пока что здесь нет постов
                    </p>
                    {isMember && (
                      <Button 
                        onClick={() => setShowCreatePost(true)} 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Создать первый пост
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(post => {
                      const postAuthor = post.profiles;
                      const isPostExpanded = expandedPosts.has(post.id);
                      const comments = postComments[post.id] || [];
                      const commentsCount = postComments[`${post.id}_count`] || 0;
                      const isLoadingPostComments = loadingComments[post.id];
                      const likes = postLikes[post.id] || { count: 0, userLiked: false };

                      return (
                        <Card key={post.id} className="border border-gray-200 dark:border-gray-700 shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <UserProfileLink 
                                  userId={post.user_id} 
                                  username={postAuthor?.username} 
                                  fullName={postAuthor?.full_name} 
                                  avatarUrl={postAuthor?.avatar_url} 
                                  verificationType={postAuthor?.verification_type}
                                  className="flex items-center space-x-3"
                                />
                                <span className="text-sm text-gray-500">
                                  {new Date(post.created_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                              {(userId === post.user_id || isCreator) && (
                                <CommunityPostActions 
                                  postId={post.id} 
                                  communityId={post.community_id} 
                                  isAuthor={userId === post.user_id} 
                                  isModerator={isCreator} 
                                  onPostDeleted={onRefresh} 
                                />
                              )}
                            </div>
                            
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                              {post.title}
                            </h3>
                            <div className="prose dark:prose-invert max-w-none mb-6">
                              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {post.content}
                              </p>
                            </div>
                            
                            {/* Post Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center space-x-6">
                                <button 
                                  onClick={() => togglePostLike(post.id)}
                                  className={`flex items-center space-x-2 transition-colors ${
                                    likes.userLiked 
                                      ? 'text-red-500 hover:text-red-600' 
                                      : 'text-gray-500 hover:text-red-500'
                                  }`}
                                >
                                  <Heart className={`w-5 h-5 ${likes.userLiked ? 'fill-current' : ''}`} />
                                  <span className="font-medium">{likes.count}</span>
                                </button>
                                
                                <button 
                                  onClick={() => togglePostExpansion(post.id)}
                                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                                >
                                  <MessageCircle className="w-5 h-5" />
                                  <span className="font-medium">{commentsCount}</span>
                                </button>
                              </div>
                            </div>

                            {/* Comments Section */}
                            {isPostExpanded && (
                              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                {isLoadingPostComments ? (
                                  <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {comments.map(comment => (
                                      <div key={comment.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-2">
                                            <UserProfileLink 
                                              userId={comment.user_id} 
                                              username={comment.profiles?.username} 
                                              fullName={comment.profiles?.full_name} 
                                              avatarUrl={comment.profiles?.avatar_url} 
                                              verificationType={comment.profiles?.verification_type}
                                              className="text-sm"
                                            />
                                            <div className="flex items-center gap-3">
                                              <span className="text-xs text-gray-500">
                                                {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                                              </span>
                                              {userId === comment.user_id && (
                                                <CommentActions 
                                                  commentId={comment.id} 
                                                  isAuthor={userId === comment.user_id} 
                                                  isModerator={false} 
                                                  onCommentDeleted={() => handleCommentDelete(post.id, comment.id)} 
                                                />
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {comment.content}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    {isMember && (
                                      <form 
                                        onSubmit={e => {
                                          e.preventDefault();
                                          const formData = new FormData(e.currentTarget);
                                          const content = formData.get('content') as string;
                                          if (content.trim()) {
                                            handleCommentSubmit(post.id, content.trim());
                                            e.currentTarget.reset();
                                          }
                                        }} 
                                        className="mt-4"
                                      >
                                        <div className="flex space-x-3">
                                          <input 
                                            name="content" 
                                            placeholder="Написать комментарий..." 
                                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            required 
                                          />
                                          <Button 
                                            type="submit" 
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                                          >
                                            Отправить
                                          </Button>
                                        </div>
                                      </form>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Topics */}
            {community.topics && community.topics.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Темы сообщества
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {community.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Members */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Участники ({members.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowMembers(true)}>
                    Показать всех
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.slice(0, 5).map(member => (
                    <UserProfileLink 
                      key={member.id} 
                      userId={member.user_id} 
                      username={member.profiles?.username} 
                      fullName={member.profiles?.full_name} 
                      avatarUrl={member.profiles?.avatar_url}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Members Modal */}
      <Dialog open={showMembers} onOpenChange={setShowMembers}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Участники сообщества</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <UserProfileLink 
                    userId={member.user_id} 
                    username={member.profiles?.username} 
                    fullName={member.profiles?.full_name} 
                    avatarUrl={member.profiles?.avatar_url} 
                  />
                  <Badge variant={member.role === 'admin' ? 'default' : member.role === 'moderator' ? 'secondary' : 'outline'}>
                    {member.role === 'admin' ? 'Администратор' : member.role === 'moderator' ? 'Модератор' : 'Участник'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <CreateCommunityPostDialog 
        open={showCreatePost} 
        onClose={() => setShowCreatePost(false)} 
        communityId={community.id} 
        onPostCreated={onRefresh} 
      />
    </div>
  );
};

export default CommunityDetailView;
