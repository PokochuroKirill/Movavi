
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, X } from 'lucide-react';
import { Community } from '@/types/database';

interface CommunityEditFormProps {
  community: Community;
  onUpdate: () => void;
  onCancel: () => void;
}

const CommunityEditForm: React.FC<CommunityEditFormProps> = ({
  community,
  onUpdate,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: community.name,
    description: community.description,
    topics: community.topics?.join(', ') || ''
  });
  const [avatar, setAvatar] = useState(community.avatar_url);
  const [banner, setBanner] = useState(community.banner_url);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `avatars/${community.id}-${Date.now()}.${fileExt}`;
    
    setUploading(true);
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);
      
      setAvatar(data.publicUrl);
      
      toast({
        title: "Аватар загружен",
        description: "Аватар сообщества успешно обновлен"
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить аватар",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `banners/${community.id}-${Date.now()}.${fileExt}`;
    
    setUploading(true);
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);
      
      setBanner(data.publicUrl);
      
      toast({
        title: "Баннер загружен",
        description: "Баннер сообщества успешно обновлен"
      });
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить баннер",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Заполните все поля",
        description: "Название и описание обязательны",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);

    try {
      const topics = formData.topics
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);

      const { error } = await supabase
        .from('communities')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim(),
          topics: topics.length > 0 ? topics : null,
          avatar_url: avatar,
          banner_url: banner,
          updated_at: new Date().toISOString()
        })
        .eq('id', community.id);

      if (error) throw error;

      toast({
        title: "Сообщество обновлено",
        description: "Изменения были успешно сохранены"
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error updating community:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить сообщество",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактировать сообщество</CardTitle>
        <CardDescription>
          Измените информацию о вашем сообществе
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="avatar">Аватар сообщества</Label>
              <div className="mt-2 space-y-2">
                {avatar && (
                  <img 
                    src={avatar} 
                    alt="Аватар сообщества" 
                    className="w-20 h-20 rounded-full object-cover" 
                  />
                )}
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="banner">Баннер сообщества</Label>
              <div className="mt-2 space-y-2">
                {banner && (
                  <img 
                    src={banner} 
                    alt="Баннер сообщества" 
                    className="w-full h-20 rounded-md object-cover" 
                  />
                )}
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Название сообщества</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Введите название сообщества"
              disabled={updating}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Опишите ваше сообщество"
              className="min-h-[100px]"
              disabled={updating}
              required
            />
          </div>

          <div>
            <Label htmlFor="topics">Темы (через запятую)</Label>
            <Input
              id="topics"
              name="topics"
              value={formData.topics}
              onChange={handleInputChange}
              placeholder="JavaScript, React, Web Development"
              disabled={updating}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={updating}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={updating || uploading}
              className="gradient-bg text-white"
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
      </CardContent>
    </Card>
  );
};

export default CommunityEditForm;
