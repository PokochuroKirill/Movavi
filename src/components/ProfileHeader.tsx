import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, MapPin, Globe, Calendar, Users, Upload, Trash2, Award } from 'lucide-react';
import { Profile } from '@/types/database';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface ProfileHeaderProps {
  profile: Profile;
  isCurrentUser: boolean;
  onEditClick?: () => void;
  followersCount?: number;
  followingCount?: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}
const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isCurrentUser,
  onEditClick,
  followersCount = 0,
  followingCount = 0,
  onFollowersClick,
  onFollowingClick
}) => {
  const [uploading, setUploading] = useState(false);
  const {
    toast
  } = useToast();

  // Форматируем дату создания аккаунта в формат "месяц год" на русском языке
  const formatCreationDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'LLLL yyyy', {
        locale: ru
      });
    } catch (error) {
      return 'Дата не указана';
    }
  };
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    const fileSize = file.size / 1024 / 1024; // size in MB

    if (fileSize > 5) {
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла - 5MB",
        variant: "destructive"
      });
      return;
    }
    try {
      setUploading(true);

      // Upload banner to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-banner.${fileExt}`;
      const filePath = `banners/${fileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from('profiles').upload(filePath, file, {
        upsert: true
      });
      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data
      } = supabase.storage.from('profiles').getPublicUrl(filePath);
      const bannerUrl = data.publicUrl;

      // Update profile
      const {
        error: updateError
      } = await supabase.from('profiles').update({
        banner_url: bannerUrl
      }).eq('id', profile.id);
      if (updateError) {
        throw updateError;
      }
      toast({
        title: "Баннер обновлен",
        description: "Ваш баннер профиля был успешно обновлен"
      });

      // Reload the page to show the new banner
      window.location.reload();
    } catch (error: any) {
      console.error("Error uploading banner:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить баннер",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  const handleRemoveBanner = async () => {
    try {
      setUploading(true);

      // If the profile has a banner, attempt to delete it from storage
      if (profile.banner_url) {
        // Extract filename from URL
        const filePath = profile.banner_url.split('/').pop();
        if (filePath) {
          // Remove file from storage
          await supabase.storage.from('profiles').remove([`banners/${filePath}`]);
        }
      }

      // Update profile to remove banner URL
      const {
        error: updateError
      } = await supabase.from('profiles').update({
        banner_url: null
      }).eq('id', profile.id);
      if (updateError) {
        throw updateError;
      }
      toast({
        title: "Баннер удален",
        description: "Баннер профиля был успешно удален"
      });

      // Reload the page to show the updated profile
      window.location.reload();
    } catch (error: any) {
      console.error("Error removing banner:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить баннер",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  return (
    <Card className="mb-6 overflow-hidden">
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-devhub-purple">
        {profile.banner_url && (
          <img src={profile.banner_url} alt="Profile banner" className="w-full h-full object-cover" />
        )}
        
        {isCurrentUser && (
          <div className="absolute top-4 right-4 flex gap-2">
            <label htmlFor="banner-upload" className="cursor-pointer">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Upload className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
                disabled={uploading}
              />
            </label>
            
            {profile.banner_url && (
              <button
                onClick={handleRemoveBanner}
                disabled={uploading}
                className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </button>
            )}
          </div>
        )}
        
        <div className="absolute -bottom-16 left-8">
          <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-md">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username || 'User'} />
            <AvatarFallback className="text-4xl bg-devhub-purple text-white">
              {profile.username ? profile.username[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <CardContent className="pt-20 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center flex-wrap">
              {profile.full_name || profile.username || 'Пользователь'}
              
              <span className="inline-flex gap-2 ml-2">
                {profile.is_verified && (
                  <Badge className="bg-blue-500 text-white">Проверено</Badge>
                )}
                {profile.is_pro && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-devhub-purple text-white flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    PRO
                  </Badge>
                )}
              </span>
            </h2>
            {profile.username && (
              <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {isCurrentUser && (
              <>
                {!profile.is_pro && (
                  <Button variant="default" size="sm" className="gradient-bg text-white" asChild>
                    {/* PRO button content if needed */}
                  </Button>
                )}
                {onEditClick && (
                  <Button variant="outline" size="sm" onClick={onEditClick}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Редактировать профиль
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        {profile.bio && <p className="text-gray-700 dark:text-gray-300 mb-6">{profile.bio}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {profile.location && <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{profile.location}</span>
            </div>}
          
          {profile.website && <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Globe className="h-4 w-4 mr-2" />
              <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-devhub-purple hover:underline">
                {profile.website}
              </a>
            </div>}
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Регистрация: {formatCreationDate(profile.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button onClick={onFollowersClick} className="flex items-center text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
            <Users className="h-4 w-4 mr-1" />
            <span className="font-medium">{followersCount}</span>
            <span className="ml-1 text-gray-600 dark:text-gray-400">Подписчиков</span>
          </button>
          
          <button onClick={onFollowingClick} className="flex items-center text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
            <span className="font-medium">{followingCount}</span>
            <span className="ml-1 text-gray-600 dark:text-gray-400">Подписок</span>
          </button>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              <Badge variant="outline">GitHub</Badge>
            </a>}
          
          {profile.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              <Badge variant="outline">Twitter</Badge>
            </a>}
          
          {profile.linkedin && <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              <Badge variant="outline">LinkedIn</Badge>
            </a>}
          
          {profile.discord && <Badge variant="outline">Discord: {profile.discord}</Badge>}
          
          {profile.telegram && <a href={`https://t.me/${profile.telegram}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              <Badge variant="outline">Telegram</Badge>
            </a>}
        </div>
      </CardContent>
    </Card>
  );
};
export default ProfileHeader;
