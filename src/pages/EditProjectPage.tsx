
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const EditProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    technologies: '',
    github_url: '',
    live_url: '',
    image_url: ''
  });

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (project.user_id !== user?.id) {
        toast({
          title: 'Ошибка доступа',
          description: 'Вы не можете редактировать этот проект',
          variant: 'destructive'
        });
        navigate('/projects');
        return;
      }

      setFormData({
        title: project.title || '',
        description: project.description || '',
        content: project.content || '',
        technologies: project.technologies ? project.technologies.join(', ') : '',
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        image_url: project.image_url || ''
      });
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить проект',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо войти в систему',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const technologies = formData.technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

      const { error } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          technologies,
          github_url: formData.github_url || null,
          live_url: formData.live_url || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Проект обновлен',
        description: 'Ваш проект был успешно обновлен'
      });

      navigate(`/projects/${id}`);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить проект',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-2xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-24 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Редактировать проект</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Название проекта</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название проекта"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Краткое описание проекта"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Подробное описание</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Подробное описание проекта, функций, технических решений..."
                  rows={8}
                  required
                />
              </div>

              <div>
                <Label htmlFor="technologies">Технологии</Label>
                <Input
                  id="technologies"
                  value={formData.technologies}
                  onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                  placeholder="React, TypeScript, Node.js (через запятую)"
                />
              </div>

              <div>
                <Label htmlFor="github_url">GitHub URL (необязательно)</Label>
                <Input
                  id="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <Label htmlFor="live_url">Live Demo URL (необязательно)</Label>
                <Input
                  id="live_url"
                  type="url"
                  value={formData.live_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, live_url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL изображения (необязательно)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/projects/${id}`)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {saving ? (
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
      </div>
    </Layout>
  );
};

export default EditProjectPage;
