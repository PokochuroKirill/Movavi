
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, MapPin, UserCheck, UserX, Calendar, Globe, Mail } from 'lucide-react';
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
        className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden relative"
      >
        {profile?.banner_url && (
          <img 
            src={profile.banner_url} 
            alt="Баннер профиля" 
            className="w-full h-full object-cover absolute inset-0"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      <CardHeader className="flex flex-col md:flex-row gap-4 md:items-end relative pb-6">
        <div className="absolute -top-16 left-6 rounded-full bg-white dark:bg-gray-900 p-1.5 shadow-xl">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'Пользователь'} />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {(profile?.username?.[0] || 'П').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {(profile?.is_verified || profile?.is_pro) && (
            <div className="absolute bottom-1.5 right-1.5 rounded-full bg-white dark:bg-gray-900 p-1">
              <Check className={`h-5 w-5 ${profile.is_pro ? "text-purple-500" : "text-blue-500"}`} />
            </div>
          )}
        </div>
        
        <div className="mt-12 md:mt-0 flex-grow">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profile?.full_name || profile?.username || 'Анонимный пользователь'}
            </h2>
            {profile?.is_verified && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700">
                <Check className="h-3 w-3 mr-1" /> Подтвержден
              </Badge>
            )}
            {profile?.is_pro && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white">
                PRO
              </Badge>
            )}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">@{profile?.username}</div>
          {profile?.location && (
            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
              <MapPin className="h-4 w-4 mr-2" /> {profile.location}
            </div>
          )}
        </div>
        
        {!isCurrentUser && user && (
          <div className="flex gap-2">
            {isFollowing ? (
              <Button 
                variant="outline"
                className="gap-2"
                onClick={onUnfollow}
                disabled={isLoading}
              >
                <UserX className="h-4 w-4" />
                Отписаться
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2"
                onClick={onFollow}
                disabled={isLoading}
              >
                <UserCheck className="h-4 w-4" />
                Подписаться
              </Button>
            )}
          </div>
        )}
        {isCurrentUser && (
          <Button
            variant="outline"
            onClick={() => window.location.href = '/profile'}
            className="gap-2"
          >
            Редактировать профиль
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Подписчики</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{followersCount}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Подписки</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{followingCount}</div>
          </div>
        </div>
        
        {profile?.bio && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">О пользователе</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {profile.bio}
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile?.website && (
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Globe className="h-5 w-5 text-gray-500 mr-3" />
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline truncate"
              >
                {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
          
          {profile?.created_at && (
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">
                Регистрация: {formatDate(profile.created_at)}
              </span>
            </div>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Социальные сети</CardTitle>
          </CardHeader>
          <CardContent>
            <SocialMediaLinks
              github={profile?.github}
              twitter={profile?.twitter}
              linkedin={profile?.linkedin}
              telegram={profile?.telegram}
              discord={profile?.discord}
              website={profile?.website}
            />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default UserProfileView;
