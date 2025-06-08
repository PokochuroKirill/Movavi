
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Code, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfileLink from './UserProfileLink';
import { Snippet } from '@/types/database';

interface SnippetCardProps {
  id?: string;
  title?: string;
  description?: string;
  language?: string;
  tags?: string[];
  viewsCount?: number;
  likesCount?: number;
  authorName?: string;
  authorAvatar?: string;
  authorId?: string;
  authorUsername?: string;
  createdAt?: string;
  snippet?: Snippet;
  showDeleteButton?: boolean;
  onDelete?: (snippetId: string) => void;
}

const SnippetCard = ({ 
  id, 
  title, 
  description, 
  language, 
  tags = [], 
  viewsCount = 0,
  likesCount = 0,
  authorName,
  authorAvatar,
  authorId,
  authorUsername,
  createdAt,
  snippet,
  showDeleteButton = false,
  onDelete
}: SnippetCardProps) => {
  // If snippet is provided, extract properties from it
  const snippetId = snippet?.id || id;
  const snippetTitle = snippet?.title || title;
  const snippetDescription = snippet?.description || description;
  const snippetLanguage = snippet?.language || language;
  const snippetTags = snippet?.tags || tags;
  const snippetViewsCount = viewsCount || 0; // Use props viewsCount since views_count doesn't exist on Snippet type
  
  // Extract author info from snippet if available
  const author = authorName || (snippet?.profiles?.full_name || snippet?.profiles?.username);
  const avatar = authorAvatar || snippet?.profiles?.avatar_url;
  const userId = authorId || snippet?.user_id;
  const username = authorUsername || snippet?.profiles?.username;
  const dateCreated = createdAt || snippet?.created_at;
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 relative">
      {showDeleteButton && onDelete && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 p-2 h-auto z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(snippetId || '');
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      <Link to={`/snippets/${snippetId}`} className="block">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
          {snippetTitle}
        </h3>
      </Link>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
        {snippetDescription}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {snippetLanguage && (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0 flex items-center">
            <Code className="mr-1 h-3 w-3" />
            {snippetLanguage}
          </Badge>
        )}
        
        {snippetTags && snippetTags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {snippetTags && snippetTags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{snippetTags.length - 3}
          </Badge>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <UserProfileLink 
          username={username}
          fullName={author}
          avatarUrl={avatar}
          userId={userId}
          className="text-sm"
        />
        
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {snippetViewsCount > 0 && (
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {snippetViewsCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;
