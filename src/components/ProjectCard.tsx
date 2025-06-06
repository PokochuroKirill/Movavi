
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import UserProfileLink from './UserProfileLink';
import { Project } from '@/types/database';

interface ProjectCardProps {
  id?: string;
  title?: string;
  description?: string;
  author?: string;
  authorAvatar?: string;
  technologies?: string[];
  imageUrl?: string;
  authorId?: string;
  authorUsername?: string;
  project?: Project; // Added to support the project object directly
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
  project, // Added project prop
}: ProjectCardProps) => {
  // If project is provided, extract properties from it
  const projectId = project?.id || id;
  const projectTitle = project?.title || title;
  const projectDescription = project?.description || description;
  const projectImageUrl = project?.image_url || imageUrl;
  const projectTech = project?.technologies || technologies;
  
  // Extract author info from project if available
  const authorName = author || (project?.profiles?.full_name || project?.profiles?.username);
  const avatarUrl = authorAvatar || project?.profiles?.avatar_url;
  const userId = authorId || project?.user_id;
  const username = authorUsername || project?.profiles?.username;

  // Ensure technologies is always an array
  const techArray = Array.isArray(projectTech) ? projectTech : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      {projectImageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={projectImageUrl} 
            alt={projectTitle} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <Link to={`/projects/${projectId}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 line-clamp-2">
            {projectTitle}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {projectDescription}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {techArray.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 text-xs">
              {tech}
            </Badge>
          ))}
          {techArray.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{techArray.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <UserProfileLink 
            username={username}
            fullName={authorName}
            avatarUrl={avatarUrl}
            userId={userId}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
