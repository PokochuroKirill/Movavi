
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface SnippetCardProps {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  created_at?: string;
  authorName?: string;
  authorAvatar?: string;
  likes?: number;
  comments?: number;
}

const SnippetCard = ({ 
  id, 
  title, 
  description, 
  language, 
  tags, 
  created_at, 
  authorName,
  authorAvatar,
  likes,
  comments
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
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
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
        
        <div className="flex justify-between items-end">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-devhub-purple/10 text-devhub-purple border-devhub-purple/20 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center">
            {authorName && authorAvatar && (
              <div className="flex items-center mr-3">
                <img
                  src={authorAvatar || "/placeholder.svg"}
                  alt={authorName}
                  className="w-6 h-6 rounded-full mr-1 object-cover"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">{authorName}</span>
              </div>
            )}
            
            {created_at && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(created_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;
