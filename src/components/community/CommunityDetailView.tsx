
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Users, Plus, MessageCircle, Heart, Settings } from 'lucide-react';
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
  const [postComments, setPostComments] = useState<{ [key: string]: any[] }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});
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
        [postId]: [...(prev[postId] || []), data]
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
      [postId]: prev[postId]?.filter(comment => comment.id !== commentId) || []
    }));
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Community Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {community.avatar_url && (
                <img
                  src={community.avatar_url}
                  alt={community.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {community.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {community.description}
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    {community.members_count || 0} участников
                  </Badge>
                  <Badge variant="secondary">
                    {community.posts_count || 0} постов
                  </Badge>
                  {!community.is_public && (
                    <Badge variant="outline">Приватное</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isMember ? (
                <>
                  <Button 
                    onClick={() => setShowCreatePost(true)}
                    className="bg-blue-600 hover:bg-blue-700"
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
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Присоединиться
                </Button>
              )}
              
              {isCreator && (
                <>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <CommunityManagementActions
                    communityId={community.id}
                    onRefresh={onRefresh}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Topics */}
        {community.topics && community.topics.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Темы сообщества
            </h3>
            <div className="flex flex-wrap gap-2">
              {community.topics.map((topic, index) => (
                <Badge key={index} variant="outline">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Участники ({members.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMembers(true)}
            >
              Показать всех
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 8).map((member) => (
              <UserProfileLink
                key={member.id}
                userId={member.user_id}
                username={member.profiles?.username}
                fullName={member.profiles?.full_name}
                avatarUrl={member.profiles?.avatar_url}
                className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              />
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Посты сообщества
          </h3>
          
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Пока что здесь нет постов
              </p>
              {isMember && (
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать первый пост
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const postAuthor = post.profiles;
                const isPostExpanded = expandedPosts.has(post.id);
                const comments = postComments[post.id] || [];
                const isLoadingPostComments = loadingComments[post.id];
                
                return (
                  <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <UserProfileLink
                          userId={post.user_id}
                          username={postAuthor?.username}
                          fullName={postAuthor?.full_name}
                          avatarUrl={postAuthor?.avatar_url}
                          verificationType={postAuthor?.verification_type}
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
                    
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {post.title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{post.likes_count || 0}</span>
                        </button>
                        <button
                          onClick={() => togglePostExpansion(post.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.comments_count || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {isPostExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {isLoadingPostComments ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {comments.map((comment) => (
                              <div key={comment.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <UserProfileLink
                                      userId={comment.user_id}
                                      username={comment.profiles?.username}
                                      fullName={comment.profiles?.full_name}
                                      avatarUrl={comment.profiles?.avatar_url}
                                      verificationType={comment.profiles?.verification_type}
                                      className="text-sm"
                                    />
                                    <div className="flex items-center gap-2">
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
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const formData = new FormData(e.currentTarget);
                                  const content = formData.get('content') as string;
                                  if (content.trim()) {
                                    handleCommentSubmit(post.id, content.trim());
                                    e.currentTarget.reset();
                                  }
                                }}
                                className="mt-3"
                              >
                                <div className="flex space-x-2">
                                  <input
                                    name="content"
                                    placeholder="Написать комментарий..."
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                  />
                                  <Button 
                                    type="submit" 
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
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
                  </div>
                );
              })}
            </div>
          )}
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
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <UserProfileLink
                    userId={member.user_id}
                    username={member.profiles?.username}
                    fullName={member.profiles?.full_name}
                    avatarUrl={member.profiles?.avatar_url}
                  />
                  <Badge variant={member.role === 'admin' ? 'default' : member.role === 'moderator' ? 'secondary' : 'outline'}>
                    {member.role === 'admin' ? 'Администратор' : 
                     member.role === 'moderator' ? 'Модератор' : 'Участник'}
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
