
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, User, Globe, MessageSquare, Github, ExternalLink } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import { Profile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditProfileFormProps {
  profile: Profile;
  onUpdate: (data: Partial<Profile>) => Promise<void>;
  onCancel?: () => void;
}

const EditProfileForm = ({
  profile,
  onUpdate,
  onCancel
}: EditProfileFormProps) => {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    website: profile.website || '',
    twitter: profile.twitter || '',
    github: profile.github || '',
    discord: profile.discord || '',
    linkedin: profile.linkedin || ''
  });
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [banner, setBanner] = useState(profile.banner_url);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await onUpdate({
        full_name: formData.full_name,
        bio: formData.bio,
        website: formData.website,
        twitter: formData.twitter,
        github: formData.github,
        discord: formData.discord,
        linkedin: formData.linkedin,
        banner_url: banner
      });
      toast({
        title: "Профиль обновлен",
        description: "Изменения были успешно сохранены"
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
      const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, file, {
        upsert: true
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
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
      if (banner) {
        const bannerPath = banner.split('/').pop();
        if (bannerPath) {
          await supabase.storage.from('profiles').remove([`banners/${bannerPath}`]);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold">Редактирование профиля</CardTitle>
              <CardDescription className="text-blue-100">
                Настройте свой профиль для лучшего представления в сообществе
              </CardDescription>
            </CardHeader>

            <Tabs defaultValue="general" className="w-full">
              <CardContent className="pt-6">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="general" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                    Основная информация
                  </TabsTrigger>
                  <TabsTrigger value="social" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                    Социальные сети
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                  <div className="flex flex-col items-center space-y-4 mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                    <AvatarUpload 
                      userId={profile.id} 
                      avatarUrl={avatar || null} 
                      onAvatarUpdate={handleAvatarUpdate} 
                      className="h-24 w-24 ring-4 ring-white shadow-lg" 
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Изменить фото профиля</p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-600" />

                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4 mr-2" />
                      Имя пользователя
                    </Label>
                    <Input 
                      id="username" 
                      name="username" 
                      value={profile.username || ''} 
                      placeholder="username" 
                      className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600" 
                      disabled 
                      readOnly 
                    />
                    <p className="text-sm text-gray-500">Имя пользователя нельзя изменить</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4 mr-2" />
                      Полное имя
                    </Label>
                    <Input 
                      id="full_name" 
                      name="full_name" 
                      value={formData.full_name} 
                      onChange={handleInputChange} 
                      placeholder="Иван Иванов" 
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center text-gray-700 dark:text-gray-300">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      О себе
                    </Label>
                    <Textarea 
                      id="bio" 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleInputChange} 
                      placeholder="Расскажите о себе" 
                      rows={4} 
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center text-gray-700 dark:text-gray-300">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Личный сайт
                    </Label>
                    <Input 
                      id="website" 
                      name="website" 
                      value={formData.website} 
                      onChange={handleInputChange} 
                      placeholder="https://example.com" 
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center text-gray-700 dark:text-gray-300">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Label>
                    <Input 
                      id="github" 
                      name="github" 
                      value={formData.github} 
                      onChange={handleInputChange} 
                      placeholder="username" 
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      X (бывший Twitter)
                    </Label>
                    <Input 
                      id="twitter" 
                      name="twitter" 
                      value={formData.twitter} 
                      onChange={handleInputChange} 
                      placeholder="username (без @)" 
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                      </svg>
                      LinkedIn
                    </Label>
                    <Input 
                      id="linkedin" 
                      name="linkedin" 
                      value={formData.linkedin} 
                      onChange={handleInputChange} 
                      placeholder="username" 
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discord" className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
                      </svg>
                      Discord
                    </Label>
                    <Input 
                      id="discord" 
                      name="discord" 
                      value={formData.discord} 
                      onChange={handleInputChange} 
                      placeholder="username#0000 или ID" 
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>

            <CardFooter className="flex justify-between pt-6 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 dark:border-gray-600">
                  Отмена
                </Button>
              )}
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8" 
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
      </div>
    </div>
  );
};

export default EditProfileForm;
