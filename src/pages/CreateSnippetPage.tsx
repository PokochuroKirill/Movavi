
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
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const languageOptions = [
  "javascript", "typescript", "python", "java", "c", "cpp", "csharp", "go", "ruby", "php", 
  "swift", "kotlin", "rust", "html", "css", "sql", "lua", "bash", "powershell", "r", 
  "matlab", "scala", "perl", "dart", "elixir", "haskell", "clojure", "erlang", "f#",
  "objective-c", "assembly", "vhdl", "verilog", "cobol", "fortran", "pascal", "delphi",
  "ada", "prolog", "scheme", "racket", "crystal", "nim", "julia", "zig", "ocaml",
  "reason", "elm", "purescript", "coffeescript", "livescript", "actionscript", "solidity"
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
    try {
      setIsSubmitting(true);
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      const { data, error } = await supabase.from('snippets').insert({
        title,
        description,
        code,
        language,
        tags: tagsArray.length ? tagsArray : null,
        user_id: user!.id
      }).select().single();
      if (error) throw error;
      toast({
        title: "Фрагмент кода создан",
        description: "Ваш фрагмент кода успешно опубликован"
      });
      navigate(`/snippets/${data.id}`);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/snippets')} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к сниппетам
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Создать фрагмент кода
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Поделитесь полезным фрагментом кода с сообществом
            </p>
          </div>
          
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Новый сниппет</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-base font-medium">
                      Название (макс. 100 символов)
                    </Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="Введите название фрагмента кода" 
                      maxLength={100} 
                      required 
                      className="mt-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-base font-medium">
                      Описание (макс. 500 символов)
                    </Label>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      placeholder="Опишите фрагмент кода и его использование" 
                      maxLength={500} 
                      required 
                      className="mt-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="language" className="text-base font-medium">
                      Язык программирования
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="mt-2">
                        <SelectValue placeholder="Выберите язык программирования" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map(lang => (
                          <SelectItem key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="code" className="text-base font-medium">
                      Код
                    </Label>
                    <Textarea 
                      id="code" 
                      value={code} 
                      onChange={e => setCode(e.target.value)} 
                      className="font-mono min-h-[200px] mt-2" 
                      placeholder="// Вставьте ваш код здесь" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags" className="text-base font-medium">
                      Теги (через запятую)
                    </Label>
                    <Input 
                      id="tags" 
                      value={tags} 
                      onChange={e => setTags(e.target.value)} 
                      placeholder="react, hooks, typescript" 
                      className="mt-2" 
                    />
                  </div>
                  
                  <div className="flex justify-end pt-6 space-x-4">
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
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
                          Создать фрагмент
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
