import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/database';
import { formatFullDateInRussian } from '@/utils/dateUtils';
import { 
  User, 
  MapPin, 
  Globe, 
  Calendar, 
  Edit, 
  Github, 
  Twitter, 
  Linkedin, 
  MessageSquare, 
  Users
} from 'lucide-react';

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
  followersCount = 0,
  followingCount = 0,
  onFollowersClick,
  onFollowingClick
}: ProfileHeaderProps) => {
  const [activeTab, setActiveTab] = useState<string>('about');
  
  const hasSocialLinks = profile.github || profile.twitter || profile.linkedin || profile.discord;
  const hasLocation = profile.location;
  const hasWebsite = profile.website;
  
  return (
    <Card className="overflow-hidden">
      {profile.banner_url && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={profile.banner_url} 
            alt="Profile banner" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className={`p-6 ${profile.banner_url ? '-mt-12' : ''}`}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start">
            <Avatar className={`${profile.banner_url ? 'h-24 w-24 border-4 border-white dark:border-gray-900' : 'h-24 w-24'}`}>
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.full_name?.[0] || profile.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="mt-4 text-center md:text-left">
              <h2 className="text-2xl font-bold">
                {profile.full_name || profile.username || 'Unnamed User'}
              </h2>
              {profile.username && (
                <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
              )}
              
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Аккаунт создан: {formatFullDateInRussian(profile.created_at)}</span>
              </div>
              
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={onFollowersClick}
                  className="flex items-center hover:text-devhub-purple transition-colors"
                >
                  <span className="font-bold mr-1">{followersCount}</span> 
                  <span className="text-gray-500 dark:text-gray-400">подписчиков</span>
                </button>
                <button 
                  onClick={onFollowingClick}
                  className="flex items-center hover:text-devhub-purple transition-colors"
                >
                  <span className="font-bold mr-1">{followingCount}</span> 
                  <span className="text-gray-500 dark:text-gray-400">подписок</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-grow">
            <Tabs 
              defaultValue="about" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="about">О пользователе</TabsTrigger>
                {hasSocialLinks && <TabsTrigger value="social">Социальные сети</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                {profile.bio && (
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  </div>
                )}
                
                {(hasLocation || hasWebsite) && (
                  <div className="space-y-2">
                    {hasLocation && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    
                    {hasWebsite && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Globe className="h-4 w-4 mr-2" />
                        <a 
                          href={profile.website?.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-devhub-purple hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                {profile.is_verified && (
                  <div className="mt-2">
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                      Verified
                    </Badge>
                  </div>
                )}
                
                {profile.is_admin && (
                  <div className="mt-2">
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                      Admin
                    </Badge>
                  </div>
                )}
              </TabsContent>
              
              {hasSocialLinks && (
                <TabsContent value="social" className="space-y-3">
                  {profile.github && (
                    <div className="flex items-center">
                      <Github className="h-5 w-5 mr-3 text-gray-700 dark:text-gray-300" />
                      <a 
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-devhub-purple hover:underline"
                      >
                        {profile.github}
                      </a>
                    </div>
                  )}
                  
                  {profile.twitter && (
                    <div className="flex items-center">
                      <Twitter className="h-5 w-5 mr-3 text-gray-700 dark:text-gray-300" />
                      <a 
                        href={`https://twitter.com/${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-devhub-purple hover:underline"
                      >
                        @{profile.twitter}
                      </a>
                    </div>
                  )}
                  
                  {profile.linkedin && (
                    <div className="flex items-center">
                      <Linkedin className="h-5 w-5 mr-3 text-gray-700 dark:text-gray-300" />
                      <a 
                        href={`https://linkedin.com/in/${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-devhub-purple hover:underline"
                      >
                        {profile.linkedin}
                      </a>
                    </div>
                  )}
                  
                  {profile.discord && (
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-3 text-gray-700 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Discord: {profile.discord}
                      </span>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
          
          {isCurrentUser && onEditClick && (
            <div className="mt-4 md:mt-0">
              <Button onClick={onEditClick} variant="outline" className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Редактировать профиль
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
