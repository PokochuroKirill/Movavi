
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import UserProfileLink from './UserProfileLink';

interface SnippetCardProps {
  id: string;
  title: string;
  description: string;
  language: string;
  author: string;
  authorAvatar?: string;
  tags?: string[];
  code?: string;
  authorId?: string;
  authorUsername?: string;
}

const SnippetCard = ({
  id,
  title,
  description,
  language,
  author,
  authorAvatar,
  tags = [],
  code,
  authorId,
  authorUsername,
}: SnippetCardProps) => {
  const { toast } = useToast();

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        toast({
          title: "Скопировано!",
          description: "Код был скопирован в буфер обмена",
        });
      } catch (err) {
        toast({
          title: "Ошибка",
          description: "Не удалось скопировать код",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Link to={`/snippets/${id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 flex-1">
              {title}
            </h3>
            {code && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {description}
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              {language}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
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
            <UserProfileLink 
              username={authorUsername}
              fullName={author}
              avatarUrl={authorAvatar}
              userId={authorId}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SnippetCard;
