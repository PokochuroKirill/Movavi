import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotificationBanner from '@/components/NotificationBanner';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Users, Lightbulb, Star, Rocket, Heart } from 'lucide-react';
import RecommendationSystem from '@/components/RecommendationSystem';
const HomePage = () => {
  const {
    user
  } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-5xl mx-auto pt-24 pb-20 relative z-10">
          {/* Notification Banner */}
          {user && <NotificationBanner />}
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              DevHub
            </span>
            <br />
            <span className="text-gray-800 dark:text-white">
              для разработчиков
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Делитесь своими проектами, получайте обратную связь, изучайте код других разработчиков и находите вдохновение для своих следующих проектов.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all">
              <Link to="/projects">
                <Rocket className="mr-2 h-5 w-5" />
                Исследовать проекты
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 px-8 py-4 text-lg rounded-full shadow-lg">
              <Link to="/about">
                <Heart className="mr-2 h-5 w-5" />
                Узнать больше
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
              Что вы найдете на DevHub
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Все инструменты для роста и развития в одном месте
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Проекты</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Просматривайте, публикуйте и получайте обратную связь по вашим проектам от сообщества разработчиков.
              </p>
              <Link to="/projects" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold group-hover:translate-x-1 transition-all px-0 mx-0">
                Перейти к проектам
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Сниппеты</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Делитесь полезными фрагментами кода, решениями типичных задач и изучайте лучшие практики.
              </p>
              <Link to="/snippets" className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold group-hover:translate-x-1 transition-all my-[25px]">
                Перейти к сниппетам
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Сообщества</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Присоединяйтесь к растущим сообществам разработчиков, находите единомышленников и стройте свои сообщества.</p>
              <Link to="/communities" className="inline-flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-semibold group-hover:translate-x-1 transition-all">
                Присоединиться
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Готовы начать?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам разработчиков, которые уже делятся своими знаниями и растут вместе с нами
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all">
            <Link to="/auth">
              Начать сейчас
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>;
};
export default HomePage;