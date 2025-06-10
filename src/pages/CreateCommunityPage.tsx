
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
import { Loader2, Upload, Users, Sparkles } from 'lucide-react';
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

    // Check community creation limit
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

      // Upload files if present
      if (avatar) {
        avatarUrl = await uploadFile(avatar, 'community-avatars');
      }

      if (banner) {
        bannerUrl = await uploadFile(banner, 'community-banners');
      }

      setUploading(false);

      // Process topics
      const topics = formData.topics
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);

      // Create community
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim(),
          creator_id: user.id,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          topics: topics.length > 0 ? topics : null,
          is_public: true,
          members_count: 1,
          posts_count: 0
        })
        .select()
        .single();

      if (communityError) throw communityError;

      // Add creator as admin
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-24">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full text-sm font-medium text-blue-800 dark:text-blue-200 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Создание сообщества
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Создать новое сообщество
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Объедините разработчиков вокруг общих интересов
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Детали сообщества
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="text-gray-700 dark:text-gray-300">Аватар сообщества</Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'avatar')}
                      disabled={submitting}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                    {avatar && (
                      <div className="mt-3">
                        <img 
                          src={URL.createObjectURL(avatar)} 
                          alt="Превью аватара" 
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" 
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner" className="text-gray-700 dark:text-gray-300">Баннер сообщества</Label>
                    <Input
                      id="banner"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'banner')}
                      disabled={submitting}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                    {banner && (
                      <div className="mt-3">
                        <img 
                          src={URL.createObjectURL(banner)} 
                          alt="Превью баннера" 
                          className="w-full h-24 rounded-lg object-cover border-4 border-white shadow-lg" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Название сообщества</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Введите название сообщества"
                    disabled={submitting}
                    required
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Описание</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Опишите ваше сообщество"
                    className="min-h-[120px] bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topics" className="text-gray-700 dark:text-gray-300">Темы (через запятую)</Label>
                  <Input
                    id="topics"
                    name="topics"
                    value={formData.topics}
                    onChange={handleInputChange}
                    placeholder="JavaScript, React, Web Development"
                    disabled={submitting}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Укажите основные темы вашего сообщества для лучшего поиска
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/communities')}
                    disabled={submitting}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || limitLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploading ? 'Загрузка файлов...' : 'Создание...'}
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Создать сообщество
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCommunityPage;
