
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import UserProfileLink from './UserProfileLink';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar?: string;
  technologies?: string[];
  imageUrl?: string;
  authorId?: string;
  authorUsername?: string;
}

const ProjectCard = ({
  id,
  title,
  description,
  author,
  authorAvatar,
  technologies = [],
  imageUrl,
  authorId,
  authorUsername,
}: ProjectCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      {imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <Link to={`/projects/${id}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 line-clamp-2">
            {title}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 text-xs">
              {tech}
            </Badge>
          ))}
          {technologies.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{technologies.length - 3}
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
  );
};

export default ProjectCard;
