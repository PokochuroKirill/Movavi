
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit, CheckCheck, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Profile } from '@/types/database';

interface ProfileHeaderProps {
  profile: Profile;
  isCurrentUser?: boolean;
  onEditClick?: () => void;
  followersCount?: number;
  followingCount?: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const ProfileHeader = ({
  profile,
  isCurrentUser = false,
  onEditClick,
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick
}: ProfileHeaderProps) => {
  const joinedDate = new Date(profile.created_at);
  const timeAgo = formatDistance(joinedDate, new Date(), { addSuffix: true });
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Banner */}
      <div 
        className="h-32 md:h-48 bg-gradient-to-r from-blue-500 to-devhub-purple flex items-center justify-center text-white"
        style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!profile.banner_url && <span className="text-lg opacity-50">Баннер профиля</span>}
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-12">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 
                 profile.username ? profile.username.substring(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Name and Username */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {profile.full_name || profile.username || 'Пользователь'}
              </h2>
              
              {profile.is_verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-gradient-to-r from-blue-500 to-devhub-purple text-white">
                        <CheckCheck className="h-4 w-4" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Подтвержденный аккаунт</p>
                      <p className="text-xs text-gray-500">Подтвержден {new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {profile.username && (
              <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
            )}
          </div>
          
          {/* Edit Button (only shown for own profile) */}
          {isCurrentUser && onEditClick && (
            <Button onClick={onEditClick} variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> 
              Редактировать
            </Button>
          )}
        </div>
        
        {/* Bio Section */}
        {profile.bio && (
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            {profile.bio}
          </p>
        )}
        
        {/* Stats */}
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          {profile.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Присоединился {timeAgo}</span>
          </div>
          
          {profile.website && (
            <a 
              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-devhub-purple hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Сайт</span>
            </a>
          )}
        </div>
        
        {/* Followers/Following */}
        {(typeof followersCount !== 'undefined' || typeof followingCount !== 'undefined') && (
          <div className="mt-4 flex items-center space-x-6 text-sm">
            {typeof followersCount !== 'undefined' && (
              <button 
                onClick={onFollowersClick} 
                className="hover:text-devhub-purple transition-colors"
              >
                <span className="font-bold">{followersCount}</span> подписчиков
              </button>
            )}
            
            {typeof followingCount !== 'undefined' && (
              <button 
                onClick={onFollowingClick} 
                className="hover:text-devhub-purple transition-colors"
              >
                <span className="font-bold">{followingCount}</span> подписок
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
