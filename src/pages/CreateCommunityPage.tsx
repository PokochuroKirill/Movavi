
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Upload } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCommunityCreationLimit } from '@/hooks/useCommunityCreationLimit';

const CreateCommunityPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topics: ''
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkCommunityLimit, loading: limitLoading } = useCommunityCreationLimit();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'avatar') {
        setAvatar(file);
      } else {
        setBanner(file);
      }
    }
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
    
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для создания сообщества необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }

    // Проверяем лимит создания сообществ
    const canCreate = await checkCommunityLimit(user.id);
    if (!canCreate) {
      return;
    }

    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Заполните все поля",
        description: "Название и описание сообщества обязательны",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    setUploading(true);

    try {
      let avatarUrl = null;
      let bannerUrl = null;

      // Загружаем файлы если они есть
      if (avatar) {
        avatarUrl = await uploadFile(avatar, 'community-avatars');
      }

      if (banner) {
        bannerUrl = await uploadFile(banner, 'community-banners');
      }

      setUploading(false);

      // Обрабатываем темы
      const topics = formData.topics
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);

      // Создаем сообщество
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim(),
          creator_id: user.id,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          topics: topics.length > 0 ? topics : null,
          is_public: true, // Всегда публичное
          members_count: 1,
          posts_count: 0
        })
        .select()
        .single();

      if (communityError) throw communityError;

      // Добавляем создателя как администратора
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          user_id: user.id,
          community_id: communityData.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Сообщество создано",
        description: "Ваше сообщество было успешно создано"
      });

      navigate(`/communities/${communityData.id}`);
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать сообщество",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-24 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Создать новое сообщество</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="avatar">Аватар сообщества</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                    disabled={submitting}
                  />
                  {avatar && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(avatar)} 
                        alt="Превью аватара" 
                        className="w-16 h-16 rounded-full object-cover" 
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="banner">Баннер сообщества</Label>
                  <Input
                    id="banner"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                    disabled={submitting}
                  />
                  {banner && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(banner)} 
                        alt="Превью баннера" 
                        className="w-full h-20 rounded-md object-cover" 
                      />
                    </div>
                  )}
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
                  disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Укажите основные темы вашего сообщества для лучшего поиска
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/communities')}
                  disabled={submitting}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting || limitLoading}
                  className="gradient-bg text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploading ? 'Загрузка файлов...' : 'Создание...'}
                    </>
                  ) : (
                    'Создать сообщество'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateCommunityPage;
