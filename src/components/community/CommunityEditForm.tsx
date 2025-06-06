
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Community } from '@/types/database';

interface CommunityEditFormProps {
  community: Community;
  onUpdate: () => void;
}

const CommunityEditForm: React.FC<CommunityEditFormProps> = ({
  community,
  onUpdate
}) => {
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [topics, setTopics] = useState<string[]>(community.topics || []);
  const [newTopic, setNewTopic] = useState('');
  const [isPublic, setIsPublic] = useState(community.is_public);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      let avatarUrl = community.avatar_url;
      let bannerUrl = community.banner_url;

      // Загружаем новые файлы если они выбраны
      if (avatarFile) {
        avatarUrl = await uploadFile(avatarFile, 'community-avatars');
      }

      if (bannerFile) {
        bannerUrl = await uploadFile(bannerFile, 'community-banners');
      }

      setUploading(false);

      const { error } = await supabase
        .from('communities')
        .update({
          name: name.trim(),
          description: description.trim(),
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          topics,
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', community.id);

      if (error) throw error;

      toast({
        title: "Сообщество обновлено",
        description: "Изменения сохранены успешно"
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error updating community:', error);
      toast({
        title: "Ошибка обновления",
        description: error.message || "Не удалось обновить сообщество",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Название сообщества</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Введите название сообщества"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Опишите ваше сообщество"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="avatar">Аватар сообщества</Label>
          <div className="space-y-2">
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
            {community.avatar_url && !avatarFile && (
              <div className="flex items-center gap-2">
                <img 
                  src={community.avatar_url} 
                  alt="Текущий аватар" 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <span className="text-sm text-gray-500">Текущий аватар</span>
              </div>
            )}
            {avatarFile && (
              <div className="flex items-center gap-2">
                <img 
                  src={URL.createObjectURL(avatarFile)} 
                  alt="Новый аватар" 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <span className="text-sm text-green-600">Новый аватар</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner">Баннер сообщества</Label>
          <div className="space-y-2">
            <Input
              id="banner"
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
            {community.banner_url && !bannerFile && (
              <div className="space-y-1">
                <img 
                  src={community.banner_url} 
                  alt="Текущий баннер" 
                  className="w-full h-20 rounded-md object-cover" 
                />
                <span className="text-sm text-gray-500">Текущий баннер</span>
              </div>
            )}
            {bannerFile && (
              <div className="space-y-1">
                <img 
                  src={URL.createObjectURL(bannerFile)} 
                  alt="Новый баннер" 
                  className="w-full h-20 rounded-md object-cover" 
                />
                <span className="text-sm text-green-600">Новый баннер</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Темы</Label>
        <div className="flex gap-2">
          <Input
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            placeholder="Добавить тему"
            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTopic())}
          />
          <Button type="button" onClick={addTopic} variant="outline">
            Добавить
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {topics.map(topic => (
            <Badge key={topic} variant="secondary" className="flex items-center gap-1">
              {topic}
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={loading} 
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploading ? 'Загрузка файлов...' : 'Сохранение...'}
            </>
          ) : (
            'Сохранить изменения'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CommunityEditForm;
