
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, User, Globe, MessageSquare, Github, Twitter, Linkedin, ExternalLink, AlertCircle } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import { Profile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { canChangeUsername } from '@/hooks/useProfileQueries';
import { Alert, AlertDescription } from './ui/alert';

interface EditProfileFormProps {
  profile: Profile;
  onUpdate: (data: Partial<Profile>) => Promise<void>;
}

const EditProfileForm = ({ profile, onUpdate }: EditProfileFormProps) => {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    website: profile.website || '',
    twitter: profile.twitter || '',
    github: profile.github || '',
    discord: profile.discord || '',
    linkedin: profile.linkedin || '',
  });
  
  const [canEditUsername, setCanEditUsername] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [banner, setBanner] = useState(profile.banner_url);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkUsernameEditability = async () => {
      const result = await canChangeUsername(profile.id);
      setCanEditUsername(result.canChange);
      setDaysRemaining(result.daysRemaining);
    };
    
    checkUsernameEditability();
  }, [profile.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      // Check if username is being changed
      if (formData.username !== profile.username && !canEditUsername) {
        toast({
          title: "Ограничение изменения",
          description: `Вы сможете изменить имя пользователя через ${daysRemaining} дней`,
          variant: "destructive"
        });
        setUpdating(false);
        return;
      }
      
      await onUpdate({
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
        website: formData.website,
        twitter: formData.twitter,
        github: formData.github,
        discord: formData.discord,
        linkedin: formData.linkedin,
        banner_url: banner,
      });
      
      toast({
        title: "Профиль обновлен",
        description: "Изменения были успешно сохранены",
      });
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setAvatar(url);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `banners/${profile.id}-${Date.now()}.${fileExt}`;
    
    setUploading(true);
    
    try {
      // Upload the file to Supabase storage in the profiles bucket
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);
      
      setBanner(data.publicUrl);
      
      toast({
        title: "Баннер загружен",
        description: "Баннер профиля успешно обновлен"
      });
    } catch (error: any) {
      console.error('Ошибка при загрузке баннера:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить баннер профиля: " + (error.message || "Неизвестная ошибка"),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    setUploading(true);
    
    try {
      // If the profile has a banner, attempt to delete it from storage
      if (banner) {
        // Extract filename from URL
        const bannerPath = banner.split('/').pop();
        
        if (bannerPath) {
          // Remove file from storage
          await supabase.storage
            .from('profiles')
            .remove([`banners/${bannerPath}`]);
        }
      }
      
      setBanner(null);
      
      toast({
        title: "Баннер удален",
        description: "Баннер профиля был успешно удален"
      });
    } catch (error: any) {
      console.error("Ошибка при удалении баннера:", error);
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
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Редактирование профиля</CardTitle>
          <CardDescription>
            Настройте свой профиль для лучшего представления в сообществе
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="general" className="w-full">
          <CardContent className="pt-6">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="general">Основная информация</TabsTrigger>
              <TabsTrigger value="social">Социальные сети</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="flex flex-col items-center space-y-4 mb-6">
                <AvatarUpload 
                  userId={profile.id} 
                  avatarUrl={avatar || null} 
                  onAvatarUpdate={handleAvatarUpdate}
                  className="h-24 w-24" 
                />
                <p className="text-sm text-gray-500">Изменить фото профиля</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner" className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Баннер профиля
                </Label>
                <div className="flex flex-col space-y-4">
                  {banner && (
                    <div className="w-full h-32 rounded-md overflow-hidden">
                      <img 
                        src={banner} 
                        alt="Баннер профиля" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Input
                      id="banner"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('banner')?.click()}
                      disabled={uploading}
                      className="flex-1"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {banner ? "Изменить баннер" : "Загрузить баннер"}
                        </>
                      )}
                    </Button>
                    
                    {banner && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleRemoveBanner}
                        disabled={uploading}
                      >
                        Удалить баннер
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Имя пользователя
                </Label>
                {!canEditUsername && (
                  <Alert variant="warning" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Имя пользователя можно изменять только раз в 30 дней. Осталось дней: {daysRemaining}
                    </AlertDescription>
                  </Alert>
                )}
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="username"
                  className="bg-gray-50 dark:bg-gray-800"
                  disabled={!canEditUsername}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Полное имя
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Иван Иванов"
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  О себе
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Расскажите о себе"
                  rows={3}
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Личный сайт
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Label>
                <Input
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="username"
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center">
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="username (без @)"
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="username"
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discord" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discord
                </Label>
                <Input
                  id="discord"
                  name="discord"
                  value={formData.discord}
                  onChange={handleInputChange}
                  placeholder="username#0000 или ID"
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="flex justify-end pt-4">
          <Button 
            type="submit" 
            className="gradient-bg text-white px-8" 
            disabled={updating}
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить изменения'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default EditProfileForm;
