
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Calendar } from 'lucide-react';
import { CommunityPost } from '@/types/database';
import UserProfileLink from '../UserProfileLink';
import { useCommunityPostInteractions } from '@/hooks/useCommunityPostInteractions';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CommunityPostCardProps {
  post: CommunityPost;
  communityId: string;
}

const CommunityPostCard = ({ post, communityId }: CommunityPostCardProps) => {
  const { likes, isLiked, toggleLike } = useCommunityPostInteractions(post.id);

  return (
    <Card className="transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              to={`/communities/${communityId}/posts/${post.id}`}
              className="text-lg font-semibold hover:text-devhub-purple transition-colors line-clamp-2"
            >
              {post.title}
            </Link>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <UserProfileLink
                username={post.profiles?.username}
                fullName={post.profiles?.full_name}
                avatarUrl={post.profiles?.avatar_url}
                userId={post.user_id}
              />
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(post.created_at), 'dd MMM yyyy', { locale: ru })}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
          {post.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLike}
              className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </Button>
            
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count || 0}</span>
            </div>
          </div>
          
          <Link
            to={`/communities/${communityId}/posts/${post.id}`}
            className="text-sm text-devhub-purple hover:underline"
          >
            Читать далее
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityPostCard;
