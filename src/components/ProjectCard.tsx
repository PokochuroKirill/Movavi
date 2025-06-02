
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart } from 'lucide-react';
import UserProfileLink from './UserProfileLink';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar?: string;
  likes?: number;
  comments?: number;
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
  likes = 0,
  comments = 0,
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
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
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
          {technologies.map((tech) => (
            <Badge key={tech} variant="outline" className="bg-devhub-purple/10 text-devhub-purple border-devhub-purple/20">
              {tech}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <UserProfileLink 
            username={authorUsername}
            fullName={author}
            avatarUrl={authorAvatar}
            userId={authorId}
          />
          
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

export default ProjectCard;
