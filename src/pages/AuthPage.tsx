import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';
const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Если пользователь уже авторизован, перенаправляем его на главную
  if (user) {
    navigate('/');
    return null;
  }
  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/');
      } else {
        if (!validateUsername(username)) {
          toast({
            title: "Ошибка валидации",
            description: "Имя пользователя должно содержать от 3 до 20 символов, только строчные буквы, цифры и знак подчеркивания.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName, username);
        setMode('login');
        toast({
          title: "Проверьте почту",
          description: "Мы отправили ссылку для подтверждения на вашу почту."
        });
      }
    } catch (error) {
      // Ошибка обрабатывается в AuthContext
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      <div className="flex-grow flex items-center justify-center pt-20 pb-20 px-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {mode === 'login' ? 'Вход' : 'Регистрация'} в DevHub
            </CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Войдите в свой аккаунт чтобы продолжить' : 'Создайте новый аккаунт, чтобы начать'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Полное имя</Label>
                    <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Иван Иванов" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input id="username" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} placeholder="ivan_ivanov" required />
                    <p className="text-xs text-gray-500">
                      Только строчные буквы, цифры и знак подчеркивания (3-20 символов)
                    </p>
                  </div>
                </>}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="********" required className="pr-10" />
                  <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" disabled={loading}>
                {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </Button>
              
              <div className="text-center mt-4">
                {mode === 'login' ? <p className="text-gray-600 dark:text-gray-400">
                    Нет аккаунта?{' '}
                    <button type="button" onClick={() => setMode('register')} className="text-blue-600 hover:text-purple-600 font-medium transition-colors">
                      Зарегистрироваться
                    </button>
                  </p> : <p className="text-gray-600 dark:text-gray-400">
                    Уже есть аккаунт?{' '}
                    <button type="button" onClick={() => setMode('login')} className="text-blue-600 hover:text-purple-600 font-medium transition-colors">
                      Войти
                    </button>
                  </p>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>;
};
export default AuthPage;
