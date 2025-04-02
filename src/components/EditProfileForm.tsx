
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import { Profile } from '@/types/database';

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
    linkedin: profile.linkedin || '',
    birthdate: profile.birthdate ? profile.birthdate.split('T')[0] : '',
    location: profile.location || '',
  });
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [updating, setUpdating] = useState(false);

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
        linkedin: formData.linkedin,
        birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : null,
        location: formData.location,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setAvatar(url);
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        
        <div className="space-y-2">
          <Label htmlFor="location">Местоположение</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Москва, Россия"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input
            id="twitter"
            name="twitter"
            value={formData.twitter}
            onChange={handleInputChange}
            placeholder="имя_пользователя (без @)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            placeholder="имя_пользователя"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            placeholder="имя_пользователя"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birthdate">Дата рождения</Label>
          <Input
            id="birthdate"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleInputChange}
          />
        </div>
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
