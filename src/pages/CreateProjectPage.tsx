
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Loader2, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const projectSchema = z.object({
  title: z.string().min(3, { message: 'Название должно содержать минимум 3 символа' }),
  description: z.string().min(10, { message: 'Описание должно содержать минимум 10 символов' }),
  content: z.string().min(20, { message: 'Контент должен содержать минимум 20 символов' }),
  github_url: z.string().url({ message: 'Введите корректный URL' }).optional().or(z.literal('')),
  live_url: z.string().url({ message: 'Введите корректный URL' }).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof projectSchema> & {
  technologies: string[];
};

const CreateProjectPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      github_url: '',
      live_url: '',
      technologies: [],
    },
  });

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Для создания проекта необходимо войти в систему",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('projects').insert({
        title: data.title,
        description: data.description,
        content: data.content,
        github_url: data.github_url || null,
        live_url: data.live_url || null,
        technologies: technologies,
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Проект создан",
        description: "Ваш проект успешно добавлен"
      });
      
      navigate('/projects');
    } catch (error: any) {
      console.error('Ошибка при создании проекта:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать проект",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Создать новый проект</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название проекта</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название проекта" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Краткое описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Кратко опишите ваш проект (1-2 предложения)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Полное описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Подробное описание вашего проекта, функционал, стек технологий и т.д." 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Технологии</FormLabel>
                <div className="flex items-center gap-2 mb-2">
                  <Input 
                    placeholder="Добавьте технологию" 
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnology();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={addTechnology}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="flex items-center gap-1 bg-devhub-purple/10 text-devhub-purple border-devhub-purple/20">
                      {tech}
                      <X 
                        className="h-3 w-3 cursor-pointer ml-1" 
                        onClick={() => removeTechnology(tech)} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="github_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL (опционально)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/username/repo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="live_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live URL (опционально)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="gradient-bg text-white w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  'Создать проект'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateProjectPage;
