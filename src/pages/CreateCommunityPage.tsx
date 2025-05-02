
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [topics, setTopics] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для создания сообщества необходимо войти в систему',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }
    
    if (!name.trim() || !description.trim()) {
      setError('Пожалуйста, заполните обязательные поля');
      return;
    }
    
    const topicsArray = topics
      .split(',')
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);
    
    setLoading(true);
    setError(null);
    
    try {
      // Создаем сообщество
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: name.trim(),
          description: description.trim(),
          creator_id: user.id,
          avatar_url: avatarUrl.trim() || null,
          banner_url: bannerUrl.trim() || null,
          topics: topicsArray.length > 0 ? topicsArray : null,
          is_public: isPublic,
          members_count: 1, // Создатель сразу становится участником
        })
        .select()
        .single();
        
      if (communityError) throw communityError;
      
      // Добавляем создателя как админа сообщества
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: communityData.id,
          user_id: user.id,
          role: 'admin'
        });
        
      if (memberError) throw memberError;
      
      toast({
        description: 'Сообщество успешно создано',
      });
      
      navigate(`/communities/${communityData.id}`);
      
    } catch (error: any) {
      console.error('Error creating community:', error);
      setError(error.message || 'Не удалось создать сообщество');
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать сообщество',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Создать сообщество</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Новое сообщество</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Название сообщества *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите название сообщества"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Описание *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Расскажите о вашем сообществе"
                    className="min-h-[120px]"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="topics">Темы (разделите запятыми)</Label>
                  <Input
                    id="topics"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="Например: JavaScript, React, TypeScript"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">URL аватара сообщества</Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">URL изображения для аватара сообщества</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bannerUrl">URL баннера сообщества</Label>
                  <Input
                    id="bannerUrl"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">URL изображения для баннера сообщества</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    disabled={loading}
                  />
                  <Label htmlFor="isPublic">Публичное сообщество</Label>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/communities')}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit"
                    className="gradient-bg text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Создание...
                      </>
                    ) : "Создать сообщество"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateCommunityPage;
