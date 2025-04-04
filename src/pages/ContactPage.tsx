
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Имя должно содержать не менее 2 символов.",
  }),
  email: z.string().email({
    message: "Пожалуйста, введите корректный адрес электронной почты.",
  }),
  subject: z.string().min(5, {
    message: "Тема должна содержать не менее 5 символов.",
  }),
  message: z.string().min(10, {
    message: "Сообщение должно содержать не менее 10 символов.",
  }),
});

type FormData = z.infer<typeof formSchema>;

const ContactPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      subject: '',
      message: '',
    },
  });
  
  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          user_id: user?.id || null,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Запрос отправлен",
        description: "Мы свяжемся с вами в ближайшее время!",
      });
      
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Свяжитесь с нами</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto">
              Есть вопросы или нужна помощь? Напишите нам, и мы свяжемся с вами как можно скорее.
            </p>
          </div>
          
          <div className="w-full">
            {isSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <h3 className="font-bold text-xl mb-2">Спасибо!</h3>
                <p className="mb-4">Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.</p>
                <Button onClick={() => setIsSuccess(false)}>Отправить еще сообщение</Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя</FormLabel>
                          <FormControl>
                            <Input placeholder="Ваше имя" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Электронная почта</FormLabel>
                          <FormControl>
                            <Input placeholder="Ваш email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тема</FormLabel>
                        <FormControl>
                          <Input placeholder="Тема вашего обращения" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Сообщение</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Чем мы можем помочь?" 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-bg text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Отправка...
                      </>
                    ) : "Отправить сообщение"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
