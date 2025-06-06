import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
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
  const [avatarUrl, setAvatarUrl] = useState(community.avatar_url || '');
  const [bannerUrl, setBannerUrl] = useState(community.banner_url || '');
  const [topics, setTopics] = useState<string[]>(community.topics || []);
  const [newTopic, setNewTopic] = useState('');
  const [isPublic, setIsPublic] = useState(community.is_public);
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };
  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('communities').update({
        name: name.trim(),
        description: description.trim(),
        avatar_url: avatarUrl.trim() || null,
        banner_url: bannerUrl.trim() || null,
        topics,
        is_public: isPublic,
        updated_at: new Date().toISOString()
      }).eq('id', community.id);
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
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Название сообщества</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Введите название сообщества" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Опишите ваше сообщество" rows={3} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">URL аватара</Label>
        <Input id="avatarUrl" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" type="url" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bannerUrl">URL баннера</Label>
        <Input id="bannerUrl" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="https://example.com/banner.jpg" type="url" />
      </div>

      <div className="space-y-2">
        <Label>Темы</Label>
        <div className="flex gap-2">
          <Input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Добавить тему" onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTopic())} />
          <Button type="button" onClick={addTopic} variant="outline">
            Добавить
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {topics.map(topic => <Badge key={topic} variant="secondary" className="flex items-center gap-1">
              {topic}
              <button type="button" onClick={() => removeTopic(topic)} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>)}
        </div>
      </div>

      

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </div>
    </form>;
};
export default CommunityEditForm;