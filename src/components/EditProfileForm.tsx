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
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    discord_url: '',
    website_url: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        twitter_url: profile.twitter_url || '',
        discord_url: profile.discord_url || '',
        website_url: profile.website_url || '',
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
      github_url: formData.github_url,
      linkedin_url: formData.linkedin_url,
      twitter_url: formData.twitter_url,
      discord_url: formData.discord_url,
      website_url: formData.website_url,
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
          <Label htmlFor="github_url" className="text-sm">GitHub</Label>
          <Input
            id="github_url"
            value={formData.github_url}
            onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
            placeholder="https://github.com/username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin_url" className="text-sm">LinkedIn</Label>
          <Input
            id="linkedin_url"
            value={formData.linkedin_url}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter_url" className="text-sm">X</Label>
          <Input
            id="twitter_url"
            value={formData.twitter_url}
            onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
            placeholder="https://x.com/username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discord_url" className="text-sm">Discord</Label>
          <Input
            id="discord_url"
            value={formData.discord_url}
            onChange={(e) => setFormData(prev => ({ ...prev, discord_url: e.target.value }))}
            placeholder="https://discord.gg/invite или username#1234"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_url" className="text-sm">Веб-сайт</Label>
          <Input
            id="website_url"
            value={formData.website_url}
            onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
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
