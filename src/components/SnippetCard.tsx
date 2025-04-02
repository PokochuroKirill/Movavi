
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Code2 } from 'lucide-react';

interface SnippetCardProps {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  author: string;
  authorAvatar?: string;
  onClick?: () => void;
}

const SnippetCard = ({
  id,
  title,
  description,
  language,
  tags,
  author,
  authorAvatar,
  onClick
}: SnippetCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-center mb-3">
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {language}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-devhub-purple/10 text-devhub-purple border-devhub-purple/20">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center mt-4">
          <img 
            src={authorAvatar || "/placeholder.svg"} 
            alt={author} 
            className="w-8 h-8 rounded-full mr-2 object-cover"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">{author}</span>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;
