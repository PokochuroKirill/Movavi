
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Copy, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SnippetCardProps {
  id: string;
  title: string;
  code: string;
  language: string;
  author: string;
  authorAvatar: string;
  likes: number;
  tags: string[];
}

const SnippetCard = ({
  id,
  title,
  code,
  language,
  author,
  authorAvatar,
  likes,
  tags,
}: SnippetCardProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    // Можно добавить тост для уведомления
    console.log('Code copied to clipboard');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Link to={`/snippets/${id}`}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              {title}
            </h3>
          </Link>
          <Badge variant="outline" className="bg-devhub-blue/10 text-devhub-blue border-devhub-blue/20">
            {language}
          </Badge>
        </div>
        
        <div className="code-block relative mb-4 group">
          <pre className="line-clamp-3">{code}</pre>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-devhub-purple/10 text-devhub-purple border-devhub-purple/20">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <img 
              src={authorAvatar} 
              alt={author} 
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{author}</span>
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Heart className="h-4 w-4 mr-1 text-red-500" />
            <span className="text-xs">{likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;
