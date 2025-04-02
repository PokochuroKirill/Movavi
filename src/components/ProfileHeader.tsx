
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Calendar, MapPin, Link as LinkIcon, Twitter, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Profile } from "@/types/database";

interface ProfileHeaderProps {
  profile: Profile;
  isCurrentUser: boolean;
  onEditClick: () => void;
}

const ProfileHeader = ({ profile, isCurrentUser, onEditClick }: ProfileHeaderProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return format(date, "LLLL yyyy", { locale: ru });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-6">
      {/* Шапка профиля */}
      <div className="h-32 bg-gradient-to-r from-blue-400 to-devhub-purple"></div>
      
      {/* Аватар и кнопка редактирования */}
      <div className="px-6 relative">
        <div className="flex justify-between items-end">
          <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 -mt-12 shadow-md">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-xl">
              {(profile.full_name || profile.username || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {isCurrentUser && (
            <Button 
              onClick={onEditClick} 
              variant="outline" 
              size="sm"
              className="mb-4"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Редактировать
            </Button>
          )}
        </div>
        
        {/* Информация о пользователе */}
        <div className="py-4">
          <h2 className="text-xl font-bold">
            {profile.full_name || 'Пользователь'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            @{profile.username || 'username'}
          </p>
          
          {profile.bio && (
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              {profile.bio}
            </p>
          )}
          
          {/* Дополнительная информация */}
          <div className="flex flex-wrap mt-4 gap-y-2">
            {profile.location && (
              <div className="flex items-center text-gray-500 dark:text-gray-400 mr-6">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
            
            <div className="flex items-center text-gray-500 dark:text-gray-400 mr-6">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">Присоединился {formatDate(profile.created_at)}</span>
            </div>
            
            {profile.birthdate && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">Родился {formatDate(profile.birthdate)}</span>
              </div>
            )}
          </div>
          
          {/* Социальные сети */}
          <div className="flex flex-wrap mt-3 gap-3">
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-devhub-purple hover:underline"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">Сайт</span>
              </a>
            )}
            
            {profile.twitter && (
              <a 
                href={`https://twitter.com/${profile.twitter.replace('@', '')}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-devhub-purple hover:underline"
              >
                <Twitter className="h-4 w-4 mr-1" />
                <span className="text-sm">Twitter</span>
              </a>
            )}
            
            {profile.github && (
              <a 
                href={`https://github.com/${profile.github}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-devhub-purple hover:underline"
              >
                <Github className="h-4 w-4 mr-1" />
                <span className="text-sm">GitHub</span>
              </a>
            )}
            
            {profile.linkedin && (
              <a 
                href={`https://linkedin.com/in/${profile.linkedin}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-devhub-purple hover:underline"
              >
                <Linkedin className="h-4 w-4 mr-1" />
                <span className="text-sm">LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
