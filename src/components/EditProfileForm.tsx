
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import { Profile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  });
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [banner, setBanner] = useState(profile.banner_url);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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
      await onUpdate({
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
        website: formData.website,
        twitter: formData.twitter,
        github: formData.github,
        discord: formData.discord,
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
      console.log("No file selected");
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-banner-${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;
    
    setUploading(true);
    
    try {
      // Upload the file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
      
      console.log("Upload result:", { uploadData, uploadError });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      console.log("Public URL:", data);
      
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center mb-4">
        <AvatarUpload 
          userId={profile.id} 
          avatarUrl={avatar || null} 
          onAvatarUpdate={handleAvatarUpdate} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="banner">Баннер профиля</Label>
        <div className="flex items-center space-x-4">
          {banner && (
            <div className="h-20 w-40 rounded-md overflow-hidden">
              <img 
                src={banner} 
                alt="Баннер профиля" 
                className="h-full w-full object-cover" 
              />
            </div>
          )}
          <div>
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
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="username">Имя пользователя</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="full_name">Полное имя</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Иван Иванов"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">О себе</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Расскажите о себе"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Личный сайт</Label>
        <Input
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          placeholder="https://example.com"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input
            id="twitter"
            name="twitter"
            value={formData.twitter}
            onChange={handleInputChange}
            placeholder="username (без @)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            placeholder="username"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="discord">Discord</Label>
        <Input
          id="discord"
          name="discord"
          value={formData.discord}
          onChange={handleInputChange}
          placeholder="username#0000 или ID"
        />
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          className="gradient-bg text-white" 
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
      </div>
    </form>
  );
};

export default EditProfileForm;
