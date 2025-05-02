
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';

const CreateCommunityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isPublic: checked }));
  };
  
  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topicInput.trim()) {
      e.preventDefault();
      addTopic();
    }
  };
  
  const addTopic = () => {
    const trimmedTopic = topicInput.trim();
    if (!trimmedTopic) return;
    
    if (!topics.includes(trimmedTopic)) {
      setTopics([...topics, trimmedTopic]);
    }
    
    setTopicInput('');
  };
  
  const removeTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Ошибка',
        description: 'Вы должны быть авторизованы для создания сообщества',
        variant: 'destructive'
      });
      return;
    }
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Создаем сообщество
      const { data, error } = await supabase
        .from('communities')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim(),
          creator_id: user.id,
          is_public: formData.isPublic,
          topics: topics.length > 0 ? topics : null
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      if (!data) {
        throw new Error('Не удалось создать сообщество');
      }
      
      // Автоматически добавляем создателя как администратора сообщества
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          user_id: user.id,
          community_id: data.id,
          role: 'admin'
        });
      
      if (memberError) {
        console.error('Ошибка при добавлении создателя как админа:', memberError);
        // Не прерываем выполнение, так как сообщество всё равно создано
      }
      
      toast({
        title: 'Сообщество создано',
        description: 'Ваше сообщество было успешно создано'
      });
      
      navigate(`/communities/${data.id}`);
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать сообщество',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-8">Создание сообщества</h1>
        
        <div className="max-w-3xl mx-auto">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Информация о сообществе</CardTitle>
                <CardDescription>
                  Создайте сообщество, чтобы объединить людей с общими интересами
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Название сообщества <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name"
                    name="name"
                    placeholder="Название вашего сообщества"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Описание <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="description"
                    name="description"
                    placeholder="Расскажите о вашем сообществе"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="topics">Темы и технологии</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="topics"
                      placeholder="Добавьте темы и нажмите Enter"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleTopicKeyDown}
                    />
                    <Button type="button" onClick={addTopic} variant="outline">
                      Добавить
                    </Button>
                  </div>
                  
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1.5">
                          {topic}
                          <button 
                            type="button" 
                            onClick={() => removeTopic(topic)} 
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isPublic" 
                    checked={formData.isPublic} 
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="isPublic">Публичное сообщество</Label>
                </div>
                <p className="text-sm text-gray-500">
                  {formData.isPublic 
                    ? "Публичное сообщество видно всем пользователям и доступно для поиска." 
                    : "Приватное сообщество видно только его участникам и доступно по приглашению."}
                </p>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/communities')}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  className="gradient-bg text-white" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    'Создать сообщество'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateCommunityPage;
