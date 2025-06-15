
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from '@/components/AvatarUpload';

const DAY_MS = 24 * 60 * 60 * 1000;

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
    avatar_url: '',
  });
  const { toast } = useToast();

  // --- Username change logic
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [nextChangeDate, setNextChangeDate] = useState<Date | null>(null);

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
        avatar_url: profile.avatar_url || '',
      });

      const lastChange = profile.last_username_change ? new Date(profile.last_username_change) : null;
      if (lastChange) {
        const now = new Date();
        const diff = now.getTime() - lastChange.getTime();
        if (diff < 14 * DAY_MS) {
          setCanChangeUsername(false);
          setNextChangeDate(new Date(lastChange.getTime() + 14 * DAY_MS));
        } else {
          setCanChangeUsername(true);
          setNextChangeDate(null);
        }
      } else {
        setCanChangeUsername(true);
        setNextChangeDate(null);
      }
    }
  }, [profile]);

  const handleAvatarUpdate = (url: string) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: url || '',
    }));
  };

  // New: Helper to compare usernames
  const isUsernameChanged = () =>
    profile &&
    formData.username.trim() !== (profile.username ?? '').trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // username может быть изменён, только если доступно изменение
    let payload: any = {
      ...profile,
      username: formData.username,
      full_name: formData.full_name,
      bio: formData.bio,
      github: formData.github,
      linkedin: formData.linkedin,
      twitter: formData.twitter,
      discord: formData.discord,
      website: formData.website,
      avatar_url: formData.avatar_url || null,
    };

    // Если попытка изменить username когда нельзя — игнорируем и возвращаем прошлое значение
    if (!canChangeUsername && isUsernameChanged()) {
      toast({
        title: "Изменение имени пользователя недоступно",
        description: "Вы можете менять имя пользователя только раз в 14 дней.",
        variant: "destructive"
      });
      setFormData(prev => ({
        ...prev,
        username: profile?.username || ''
      }));
      return;
    }

    // Если username меняется, добавим last_username_change = now
    if (canChangeUsername && isUsernameChanged()) {
      payload.last_username_change = new Date().toISOString();
    }

    onSave(payload as Profile);

    toast({
      title: "Профиль обновлен",
      description: "Ваш профиль был успешно обновлен.",
    });
  };

  // Форматирование даты для подсказки
  const formatDate = (date?: Date | null) =>
    date
      ? date
          .toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
      : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Редактировать профиль
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* AVATAR BLOCK */}
            <div className="flex justify-center mb-8">
              {profile && (
                <AvatarUpload
                  userId={profile.id}
                  avatarUrl={formData.avatar_url}
                  onAvatarUpdate={handleAvatarUpdate}
                  className="w-32 h-32"
                />
              )}
            </div>
            {/* END AVATAR BLOCK */}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    Имя пользователя
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="username"
                    className="mt-2 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg"
                    required
                    disabled={!canChangeUsername}
                  />
                  {!canChangeUsername && (
                    <div className="text-xs text-orange-600 mt-1">
                      Имя пользователя можно менять 1 раз в 14 дней.
                      <br />
                      Следующая возможность &mdash; <span className="font-bold">{formatDate(nextChangeDate)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="full_name" className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    Полное имя
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Иван Иванов"
                    className="mt-2 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="bio" className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    О себе
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Расскажите немного о себе..."
                    className="mt-2 min-h-[100px] border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg resize-none"
                    rows={4}
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Социальные сети
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="github" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      value={formData.github}
                      onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="https://github.com/username"
                      className="mt-1 h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1 h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      X
                    </Label>
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://x.com/username"
                      className="mt-1 h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="discord" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Discord
                    </Label>
                    <Input
                      id="discord"
                      value={formData.discord}
                      onChange={(e) => setFormData(prev => ({ ...prev, discord: e.target.value }))}
                      placeholder="https://discord.gg/invite или username#1234"
                      className="mt-1 h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Веб-сайт
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                      className="mt-1 h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-600">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onCancel}
                  className="px-8 py-3 text-base font-medium"
                >
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  className="px-8 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  Сохранить изменения
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfileForm;
