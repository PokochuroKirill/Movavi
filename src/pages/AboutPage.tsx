
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkle, 
  Users, 
  Rocket, 
  Lightbulb, 
  Code2, 
  Heart, 
  Shield,
  Trophy,
  Zap,
  Globe
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-100 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <Navbar />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="flex-grow pt-24 relative z-10">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl">
              <Sparkle className="text-white w-12 h-12 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                DevHub
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Современная платформа для разработчиков, где инновации встречаются с сообществом
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-8 py-4 text-lg rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
                  <Users className="mr-2 h-5 w-5" />
                  Присоединиться
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="outline" className="px-8 py-4 text-lg rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                  <Code2 className="mr-2 h-5 w-5" />
                  Посмотреть проекты
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* История и миссия */}
        <section className="py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-indigo-800 dark:text-indigo-200 mb-6">
                  Наша история
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-0 shadow-xl">
                    <CardContent className="p-8">
                      <Globe className="w-12 h-12 text-blue-600 mb-4" />
                      <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                        Глобальное сообщество
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        DevHub объединяет разработчиков со всего мира, создавая пространство для обмена знаниями, идеями и опытом. Мы верим, что лучшие решения рождаются в коллаборации.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 border-0 shadow-xl">
                    <CardContent className="p-8">
                      <Zap className="w-12 h-12 text-purple-600 mb-4" />
                      <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                        Инновации и рост
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Наша платформа постоянно развивается, интегрируя новейшие технологии и подходы к разработке. Мы помогаем каждому участнику расти профессионально.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Миссия и ценности */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-indigo-800 dark:text-indigo-200 mb-6">
                Миссия и ценности
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                    Взаимная поддержка
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Создаем среду, где каждый разработчик может получить помощь и поделиться своими знаниями
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <Shield className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                    Открытость
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Поддерживаем инклюзивность, уважительный диалог и прозрачность во всех взаимодействиях
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                    Рост и развитие
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Помогаем новичкам учиться, а опытным разработчикам находить вдохновение и единомышленников
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Особенности DevHub */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold text-indigo-700 dark:text-indigo-100 mb-6">
                Почему выбирают DevHub?
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <Card className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-4 text-gray-800 dark:text-white">Уникальные проекты</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Демонстрируйте свои проекты, изучайте чужие решения и получайте конструктивную обратную связь от сообщества
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-4 text-gray-800 dark:text-white">Сообщество и поддержка</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Наша сила — в единстве. Участвуйте в обсуждениях, помогайте друг другу, заводите новые знакомства
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-green-500 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-4 text-gray-800 dark:text-white">Безопасная среда</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Акцент на уважение, модерацию и прозрачную обратную связь — чтобы все чувствовали себя комфортно
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Статистика */}
        <section className="py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">50K+</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Разработчиков</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">12K+</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Проектов</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2">8K+</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Сообществ</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">100K+</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Сниппетов</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-4xl md:text-5xl font-bold mb-6 text-indigo-800 dark:text-indigo-100">
                Готовы присоединиться?
              </h3>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                Постройте свою карьеру вместе с единомышленниками — участвуйте в жизни сообщества, 
                делитесь опытом и растите c DevHub!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-10 py-4 text-xl rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
                    <Sparkle className="mr-2 h-6 w-6" />
                    Стать частью DevHub
                  </Button>
                </Link>
                <Link to="/communities">
                  <Button variant="outline" className="px-10 py-4 text-xl rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                    <Users className="mr-2 h-6 w-6" />
                    Исследовать сообщества
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
