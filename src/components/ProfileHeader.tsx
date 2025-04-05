
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, Calendar, MapPin, Link as LinkIcon, Twitter, Github, MessageCircle, Hash, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Profile } from "@/types/database";

interface ProfileHeaderProps {
  profile: Profile;
  isCurrentUser: boolean;
  onEditClick: () => void;
  followersCount?: number;
  followingCount?: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const ProfileHeader = ({ 
  profile, 
  isCurrentUser, 
  onEditClick,
  followersCount = 0,
  followingCount = 0,
  onFollowersClick,
  onFollowingClick
}: ProfileHeaderProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return format(date, "LLLL yyyy", { locale: ru });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
      {/* Banner */}
      <div 
        className="h-32 bg-gradient-to-r from-blue-400 to-devhub-purple"
        style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      ></div>
      
      {/* Avatar and edit button */}
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
        
        {/* User info */}
        <div className="py-4">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">
              {profile.full_name || 'User'}
            </h2>
            {profile.is_verified && (
              <Badge className="ml-2 gradient-bg text-white">
                <Check className="h-3 w-3 mr-1" />
                Верифицирован
              </Badge>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            @{profile.username || 'username'}
          </p>
          
          {/* Follow stats */}
          {(followersCount > 0 || followingCount > 0) && (
            <div className="flex space-x-4 mt-2">
              {onFollowersClick && (
                <button 
                  onClick={onFollowersClick}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                >
                  <span className="font-bold">{followersCount}</span> Followers
                </button>
              )}
              
              {onFollowingClick && (
                <button 
                  onClick={onFollowingClick}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                >
                  <span className="font-bold">{followingCount}</span> Following
                </button>
              )}
            </div>
          )}
          
          {profile.bio && (
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              {profile.bio}
            </p>
          )}
          
          {/* Additional info */}
          <div className="flex flex-wrap mt-4 gap-y-2">
            <div className="flex items-center text-gray-500 dark:text-gray-400 mr-6">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">Регистрация {formatDate(profile.created_at)}</span>
            </div>
            
            {profile.birthdate && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">Дата рождения {formatDate(profile.birthdate)}</span>
              </div>
            )}
          </div>
          
          {/* Social links */}
          <div className="flex flex-wrap mt-3 gap-3">
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-devhub-purple hover:underline"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">Website</span>
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
            
            {profile.discord && (
              <a 
                href={`https://discord.com/users/${profile.discord}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-devhub-purple hover:underline"
              >
                <Hash className="h-4 w-4 mr-1" />
                <span className="text-sm">Discord</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
