
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Star, GitFork, Eye } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  stars: number;
  forks: number;
  views: number;
  tags: string[];
}

const ProjectCard = ({
  id,
  title,
  description,
  author,
  authorAvatar,
  stars,
  forks,
  views,
  tags,
}: ProjectCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <Link to={`/projects/${id}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors mb-2">
            {title}
          </h3>
        </Link>
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
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <img 
              src={authorAvatar} 
              alt={author} 
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{author}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Star className="h-4 w-4 mr-1" />
              <span className="text-xs">{stars}</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <GitFork className="h-4 w-4 mr-1" />
              <span className="text-xs">{forks}</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-xs">{views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
