
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Eye, ExternalLink, Github } from 'lucide-react';
import { Project } from '@/types/database';
import UserProfileLink from './UserProfileLink';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card className="h-full flex flex-col transition-shadow duration-300 hover:shadow-lg">
      {project.image_url && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">
            <Link
              to={`/projects/${project.id}`}
              className="hover:text-devhub-purple transition-colors"
            >
              {project.title}
            </Link>
          </CardTitle>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <UserProfileLink
            username={project.profiles?.username}
            fullName={project.profiles?.full_name}
            avatarUrl={project.profiles?.avatar_url}
            userId={project.user_id}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>
        
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{project.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{project.comments_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{project.views_count || 0}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
