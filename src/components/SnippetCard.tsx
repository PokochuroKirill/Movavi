
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Eye, Code } from 'lucide-react';
import { Snippet } from '@/types/database';
import UserProfileLink from './UserProfileLink';

interface SnippetCardProps {
  snippet: Snippet;
}

const SnippetCard = ({ snippet }: SnippetCardProps) => {
  return (
    <Card className="h-full flex flex-col transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">
            <Link
              to={`/snippets/${snippet.id}`}
              className="hover:text-devhub-purple transition-colors"
            >
              {snippet.title}
            </Link>
          </CardTitle>
          <Badge variant="outline" className="ml-2 flex-shrink-0">
            <Code className="h-3 w-3 mr-1" />
            {snippet.language}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <UserProfileLink
            username={snippet.profiles?.username}
            fullName={snippet.profiles?.full_name}
            avatarUrl={snippet.profiles?.avatar_url}
            userId={snippet.user_id}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {snippet.description}
        </p>
        
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {snippet.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {snippet.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{snippet.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{snippet.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{snippet.comments || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{snippet.views_count || 0}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SnippetCard;
