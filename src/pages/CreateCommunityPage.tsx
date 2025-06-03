
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCommunityCreationLimit } from '@/hooks/useCommunityCreationLimit';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const CreateCommunityPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkCommunityLimit } = useCommunityCreationLimit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    if (name.length > 50) {
      toast({
        title: "Ошибка",
        description: "Название не должно превышать 50 символов",
        variant: "destructive"
      });
      return;
    }

    if (description.length > 500) {
      toast({
        title: "Ошибка",
        description: "Описание не должно превышать 500 символов",
        variant: "destructive"
      });
      return;
    }

    // Проверяем лимит сообществ
    const canCreate = await checkCommunityLimit(user!.id);
    if (!canCreate) {
      return;
    }

    setIsCreating(true);

    try {
      const topicsArray = topics
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic !== '');

      const { data, error } = await supabase
        .from('communities')
        .insert({
          name: name.trim(),
          description: description.trim(),
          topics: topicsArray.length ? topicsArray : [],
          is_public: isPublic,
          creator_id: user!.id,
          members_count: 1,
          posts_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Автоматически добавляем создателя как админа
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          user_id: user!.id,
          community_id: data.id,
          role: 'admin'
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
      }

      toast({
        title: "Сообщество создано",
        description: "Ваше сообщество успешно создано"
      });

      navigate(`/communities/${data.id}`);
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать сообщество",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Создать сообщество</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Новое сообщество</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Название сообщества (макс. 50 символов)</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите название сообщества"
                    maxLength={50}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{name.length}/50</p>
                </div>

                <div>
                  <Label htmlFor="description">Описание (макс. 500 символов)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Опишите ваше сообщество"
                    className="min-h-[100px]"
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
                </div>

                <div>
                  <Label htmlFor="topics">Темы (через запятую)</Label>
                  <Input
                    id="topics"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="React, JavaScript, WebDev"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">Публичное сообщество</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/communities')}
                    disabled={isCreating}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="gradient-bg text-white"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Создание...
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
      </main>

      <Footer />
    </div>
  );
};

export default CreateCommunityPage;
