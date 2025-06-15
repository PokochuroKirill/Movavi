
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface EditProfileFormProps {
  profile: Profile | null;
  onSave: (data: Profile) => void;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    github: '',
    linkedin: '',
    twitter: '',
    discord: '',
    website: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        discord: profile.discord || '',
        website: profile.website || '',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      username: formData.username,
      full_name: formData.full_name,
      bio: formData.bio,
      github: formData.github,
      linkedin: formData.linkedin,
      twitter: formData.twitter,
      discord: formData.discord,
      website: formData.website,
    } as Profile);
    toast({
      title: "Профиль обновлен",
      description: "Ваш профиль был успешно обновлен.",
    })
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-base font-medium">Имя пользователя</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="username"
          required
        />
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-base font-medium">Полное имя</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          placeholder="Иван Иванов"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-base font-medium">О себе</Label>
        <Input
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Расскажите немного о себе"
        />
      </div>

      {/* Social Media Links */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Социальные сети</Label>
        
        <div className="space-y-2">
          <Label htmlFor="github" className="text-sm">GitHub</Label>
          <Input
            id="github"
            value={formData.github}
            onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
            placeholder="https://github.com/username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
          <Input
            id="linkedin"
            value={formData.linkedin}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter" className="text-sm">X</Label>
          <Input
            id="twitter"
            value={formData.twitter}
            onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
            placeholder="https://x.com/username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discord" className="text-sm">Discord</Label>
          <Input
            id="discord"
            value={formData.discord}
            onChange={(e) => setFormData(prev => ({ ...prev, discord: e.target.value }))}
            placeholder="https://discord.gg/invite или username#1234"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm">Веб-сайт</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>Отмена</Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  );
};

export default EditProfileForm;
