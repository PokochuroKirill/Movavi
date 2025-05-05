
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import RecommendationSystem from '@/components/RecommendationSystem';
import WelcomeWidget from '@/components/dashboard/WelcomeWidget';
import { supabase } from '@/integrations/supabase/client';

const HomePage = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    setMounted(true);

    // If user is logged in, fetch their username
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setUsername(data.username);
        }
      };

      fetchProfile();
    }
  }, [user]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section for non-authenticated users or Personalized Dashboard for authenticated users */}
      <section className="flex-grow flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        {!user ? (
          // Public Hero Section
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-devhub-purple/30 dark:from-blue-500/10 dark:to-devhub-purple/10 -z-10"></div>
            
            <div className="max-w-3xl mx-auto pt-24 pb-20">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-500 to-devhub-purple text-transparent bg-clip-text">
                  Сообщество для разработчиков
                </span>
              </h1>
              
              <p className="text-xl mb-10 text-gray-600 dark:text-gray-300">
                Делитесь своими проектами, получайте обратную связь, изучайте код других разработчиков и находите вдохновение для своих следующих проектов.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gradient-bg text-white">
                  <Link to="/projects">
                    Исследовать проекты
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link to="/about">
                    Узнать больше
                  </Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Personalized Dashboard for authenticated users
          <div className="container mx-auto max-w-6xl py-24">
            <div className="space-y-8">
              <WelcomeWidget username={username || 'разработчик'} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent activity, trending projects, etc. could go here */}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features Section - shown to everyone */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Что вы найдете на DevHub</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Проекты</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Просматривайте, публикуйте и получайте обратную связь по вашим проектам от сообщества разработчиков.
              </p>
              <Link to="/projects" className="text-devhub-purple hover:underline flex items-center">
                Перейти к проектам
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Сниппеты</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Делитесь полезными фрагментами кода, решениями типичных задач и изучайте лучшие практики.
              </p>
              <Link to="/snippets" className="text-devhub-purple hover:underline flex items-center">
                Перейти к сниппетам
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Сообщество</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Присоединяйтесь к растущему сообществу разработчиков, находите единомышленников и стройте свою сеть.
              </p>
              <Link to="/communities" className="text-devhub-purple hover:underline flex items-center">
                Узнать больше
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recommendations Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {user ? <RecommendationSystem userId={user.id} /> : <RecommendationSystem />}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HomePage;
