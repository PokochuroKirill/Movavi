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
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const CreateProjectPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    checkProjectLimit
  } = useProjectCreationLimits();
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
      const techArray = technologies.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
      const {
        data,
        error
      } = await supabase.from('projects').insert({
        title,
        description,
        content,
        technologies: techArray.length ? techArray : null,
        image_url: imageUrl || null,
        github_url: githubUrl || null,
        live_url: liveUrl || null,
        user_id: user!.id
      }).select().single();
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
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/projects')} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к проектам
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Создать проект
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Поделитесь своим проектом с сообществом разработчиков
            </p>
          </div>
          
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Новый проект</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-base font-medium">
                      Название (макс. 100 символов)
                    </Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Введите название проекта" maxLength={100} required className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-base font-medium">
                      Краткое описание (макс. 500 символов)
                    </Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Краткое описание проекта" maxLength={500} required className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="content" className="text-base font-medium">
                      Подробное описание
                    </Label>
                    <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} className="min-h-[200px] mt-2" placeholder="Подробное описание проекта, технических решений, проблем которые он решает..." required />
                  </div>
                  
                  <div>
                    <Label htmlFor="technologies" className="text-base font-medium">
                      Технологии (через запятую)
                    </Label>
                    <Input id="technologies" value={technologies} onChange={e => setTechnologies(e.target.value)} placeholder="React, TypeScript, Node.js" className="mt-2" />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl" className="text-base font-medium">
                      URL изображения
                    </Label>
                    <Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" type="url" className="mt-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="githubUrl" className="text-base font-medium">
                        GitHub URL
                      </Label>
                      <Input id="githubUrl" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/username/repo" type="url" className="mt-2" />
                    </div>
                    
                    <div>
                      <Label htmlFor="liveUrl" className="text-base font-medium">
                        Live Demo URL
                      </Label>
                      <Input id="liveUrl" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://myproject.com" type="url" className="mt-2" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-6 space-x-4">
                    
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={isSubmitting}>
                      {isSubmitting ? <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Создание...
                        </> : <>
                          <Save className="mr-2 h-4 w-4" />
                          Создать проект
                        </>}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>;
};
export default CreateProjectPage;