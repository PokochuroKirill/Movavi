
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart } from 'lucide-react';
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
        <div className="flex justify-between items-start mb-2">
          <Link to={`/snippets/${id}`}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              {title}
            </h3>
          </Link>
          
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            {language}
          </Badge>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-devhub-purple/10 text-devhub-purple border-devhub-purple/20 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {author && (
              <div className="flex items-center mr-3">
                <UserProfileLink 
                  username={authorUsername}
                  fullName={author}
                  avatarUrl={authorAvatar}
                  userId={authorId}
                  className="text-xs"
                />
              </div>
            )}
            
            {created_at && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(created_at)}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Heart className="h-4 w-4 mr-1" />
              <span className="text-xs">{likes || 0}</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">{comments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;
