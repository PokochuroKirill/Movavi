
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, MapPin, UserCheck, UserX, Mail, Calendar, Globe, Briefcase } from 'lucide-react';
import { Profile } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import SocialMediaLinks from './SocialMediaLinks';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UserProfileViewProps {
  profile: Profile;
  isLoading: boolean;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  onFollow: () => void;
  onUnfollow: () => void;
  isCurrentUser: boolean;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  isLoading,
  isFollowing,
  followersCount,
  followingCount,
  onFollow,
  onUnfollow,
  isCurrentUser
}) => {
  const { user } = useAuth();
  
  const formatDate = (date: string | Date | null) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: ru });
    } catch (e) {
      return '';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-48 bg-gradient-to-r from-blue-500 to-devhub-purple overflow-hidden relative"
      >
        {profile?.banner_url && (
          <img 
            src={profile.banner_url} 
            alt="Profile banner" 
            className="w-full h-full object-cover absolute inset-0"
          />
        )}
      </div>
      
      <CardHeader className="flex flex-col md:flex-row gap-4 md:items-end relative">
        <div className="absolute -top-16 left-6 rounded-full bg-white dark:bg-gray-900 p-1.5 shadow-lg">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'User'} />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              {(profile?.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {(profile?.is_verified || profile?.is_pro) && (
            <div className="absolute bottom-1.5 right-1.5 rounded-full bg-white dark:bg-gray-900 p-1">
              <Check className={`h-5 w-5 ${profile.is_pro ? "text-purple-500" : "text-blue-500"}`} />
            </div>
          )}
        </div>
        
        <div className="mt-10 md:mt-0 flex-grow">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold">
              {profile?.full_name || profile?.username || 'Anonymous User'}
            </h2>
            {profile?.is_verified && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700">
                <Check className="h-3 w-3 mr-1" /> Verified
              </Badge>
            )}
            {profile?.is_pro && (
              <Badge className="bg-gradient-to-r from-blue-500 to-devhub-purple border-0">
                PRO
              </Badge>
            )}
          </div>
          <div className="text-gray-500 dark:text-gray-400">@{profile?.username}</div>
          {profile?.location && (
            <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1" /> {profile.location}
            </div>
          )}
        </div>
        
        {!isCurrentUser && user && (
          isFollowing ? (
            <Button 
              variant="outline"
              className="whitespace-nowrap"
              onClick={onUnfollow}
              disabled={isLoading}
            >
              <UserX className="h-4 w-4 mr-1.5" />
              Отписаться
            </Button>
          ) : (
            <Button
              className="whitespace-nowrap bg-gradient-to-r from-blue-600 to-devhub-purple hover:opacity-90"
              onClick={onFollow}
              disabled={isLoading}
            >
              <UserCheck className="h-4 w-4 mr-1.5" />
              Подписаться
            </Button>
          )
        )}
        {isCurrentUser && (
          <Button
            variant="outline"
            className="whitespace-nowrap"
            onClick={() => window.location.href = '/profile'}
          >
            Редактировать профиль
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-6 mb-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center px-4 py-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">Подписчики</div>
            <div className="text-xl font-bold">{followersCount}</div>
          </div>
          <div className="text-center px-4 py-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">Подписки</div>
            <div className="text-xl font-bold">{followingCount}</div>
          </div>
        </div>
        
        {profile?.bio && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-2">О пользователе</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {profile?.website && (
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-gray-500 mr-2" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
          
          {profile?.location && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-500 mr-2" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
        
        {/* Social media links with icons */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Социальные сети</h3>
          <SocialMediaLinks
            github={profile?.github}
            twitter={profile?.twitter}
            linkedin={profile?.linkedin}
            telegram={profile?.telegram}
            discord={profile?.discord}
            website={profile?.website}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileView;
