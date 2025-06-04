
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import UserProfileLink from './UserProfileLink';

interface SnippetCardProps {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  created_at?: string;
  author?: string;
  authorAvatar?: string;
  authorId?: string;
  authorUsername?: string;
  likes?: number;
  comments?: number;
  views?: number;
  onClick?: () => void;
}

const SnippetCard = ({ 
  id, 
  title, 
  description, 
  language, 
  tags, 
  created_at, 
  author,
  authorAvatar,
  authorId,
  authorUsername,
  likes = 0,
  comments = 0,
  views = 0,
  onClick
}: SnippetCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Link to={`/snippets/${id}`}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>
          
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 ml-2 shrink-0">
            {language}
          </Badge>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {author && (
              <UserProfileLink 
                username={authorUsername}
                fullName={author}
                avatarUrl={authorAvatar}
                userId={authorId}
                className="text-xs"
              />
            )}
            
            {created_at && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(created_at)}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;
