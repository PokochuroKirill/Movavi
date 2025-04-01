
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, MessageSquare, MapPin, Phone } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Имитация отправки формы
    setTimeout(() => {
      toast({
        title: "Сообщение отправлено",
        description: "Мы ответим вам в ближайшее время.",
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-6">Связаться с нами</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-3xl">
            У вас есть вопросы, предложения или вы хотите сообщить о проблеме? Заполните форму ниже или воспользуйтесь другими способами связи.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-devhub-purple/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-devhub-purple" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Электронная почта</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Напишите нам</p>
              <a href="mailto:support@devhub.com" className="text-devhub-purple hover:underline">
                support@devhub.com
              </a>
            </Card>
            
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-devhub-purple/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-devhub-purple" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Живой чат</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Поговорите с нами</p>
              <button className="text-devhub-purple hover:underline">
                Начать чат
              </button>
            </Card>
            
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-devhub-purple/10 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-devhub-purple" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Телефон</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Позвоните нам</p>
              <a href="tel:+78001234567" className="text-devhub-purple hover:underline">
                +7 (800) 123-45-67
              </a>
            </Card>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6">Отправить сообщение</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Ваше имя</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Иван Иванов"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Ваш Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Тема сообщения</Label>
                <Select value={formData.subject} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тему" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Общий вопрос</SelectItem>
                    <SelectItem value="support">Техническая поддержка</SelectItem>
                    <SelectItem value="feedback">Отзыв о платформе</SelectItem>
                    <SelectItem value="partnership">Сотрудничество</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Сообщение</Label>
                <Textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Ваше сообщение..."
                  rows={6}
                  required
                />
              </div>
              
              <Button type="submit" className="gradient-bg text-white" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить сообщение'}
              </Button>
            </form>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Наш офис</h2>
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-devhub-purple mr-2" />
              <span>Москва, ул. Ленина, 123, офис 456</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 h-80 w-full rounded-lg">
              {/* Здесь можно добавить компонент карты */}
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Карта будет добавлена позже</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
