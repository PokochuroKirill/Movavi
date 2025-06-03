
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProjectCreationLimits } from '@/hooks/useProjectQueries';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const CreateProjectPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkProjectLimit } = useProjectCreationLimits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !content) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    if (title.length > 100) {
      toast({
        title: "Ошибка",
        description: "Название не должно превышать 100 символов",
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

    // Проверяем лимит проектов
    const canCreate = await checkProjectLimit(user!.id);
    if (!canCreate) {
      return;
    }

    try {
      setIsSubmitting(true);

      const techArray = technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech !== '');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          content,
          technologies: techArray.length ? techArray : null,
          image_url: imageUrl || null,
          github_url: githubUrl || null,
          live_url: liveUrl || null,
          user_id: user!.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Проект создан",
        description: "Ваш проект успешно опубликован"
      });
      
      navigate(`/projects/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать проект",
        variant: "destructive"
      });
      console.error("Ошибка при создании проекта:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Создать проект</h1>
          
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Название (макс. 100 символов)</Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="Введите название проекта"
                      maxLength={100}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Краткое описание (макс. 500 символов)</Label>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Краткое описание проекта"
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Подробное описание</Label>
                    <Textarea 
                      id="content" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[200px]"
                      placeholder="Подробное описание проекта, технических решений, проблем которые он решает..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="technologies">Технологии (через запятую)</Label>
                    <Input 
                      id="technologies" 
                      value={technologies} 
                      onChange={(e) => setTechnologies(e.target.value)} 
                      placeholder="React, TypeScript, Node.js"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">URL изображения</Label>
                    <Input 
                      id="imageUrl" 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)} 
                      placeholder="https://example.com/image.png"
                      type="url"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input 
                      id="githubUrl" 
                      value={githubUrl} 
                      onChange={(e) => setGithubUrl(e.target.value)} 
                      placeholder="https://github.com/username/repo"
                      type="url"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="liveUrl">Live Demo URL</Label>
                    <Input 
                      id="liveUrl" 
                      value={liveUrl} 
                      onChange={(e) => setLiveUrl(e.target.value)} 
                      placeholder="https://myproject.com"
                      type="url"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/projects')}
                      className="mr-2"
                      disabled={isSubmitting}
                    >
                      Отмена
                    </Button>
                    <Button 
                      type="submit"
                      className="gradient-bg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Создание...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Создать проект
                        </>
                      )}
                    </Button>
                  </div>
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

export default CreateProjectPage;
