
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const languageOptions = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "rust",
  "html",
  "css",
  "sql"
];

const CreateSnippetPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !code || !language) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const { error } = await supabase
        .from('snippets')
        .insert({
          title,
          description,
          code,
          language,
          tags: tagsArray.length ? tagsArray : null,
          user_id: user!.id
        });

      if (error) throw error;

      toast({
        title: "Фрагмент кода создан",
        description: "Ваш фрагмент кода успешно сохранен"
      });
      
      navigate('/snippets');
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать фрагмент кода",
        variant: "destructive"
      });
      console.error("Ошибка при создании фрагмента кода:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Создание фрагмента кода</h1>
          
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Название</Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="Введите название фрагмента кода"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Опишите фрагмент кода и его использование"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Язык программирования</Label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      {languageOptions.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="code">Код</Label>
                    <Textarea 
                      id="code" 
                      value={code} 
                      onChange={(e) => setCode(e.target.value)}
                      className="font-mono min-h-[200px]"
                      placeholder="// Вставьте ваш код здесь"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Теги (через запятую)</Label>
                    <Input 
                      id="tags" 
                      value={tags} 
                      onChange={(e) => setTags(e.target.value)} 
                      placeholder="react, hooks, typescript"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/snippets')}
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
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Сохранить фрагмент
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

export default CreateSnippetPage;
