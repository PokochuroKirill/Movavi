
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, LifeBuoy, BookOpen, MessageSquare, HelpCircle } from 'lucide-react';

const SupportPage = () => {
  // Пример данных для популярных статей поддержки
  const supportArticles = [
    {
      title: 'Как создать аккаунт на DevHub',
      views: 1543,
      category: 'Начало работы',
      time: '3 мин. чтения',
      url: '#'
    },
    {
      title: 'Публикация проекта: пошаговое руководство',
      views: 1278,
      category: 'Проекты',
      time: '5 мин. чтения',
      url: '#'
    },
    {
      title: 'Как добавить сниппет кода на платформу',
      views: 967,
      category: 'Сниппеты',
      time: '2 мин. чтения',
      url: '#'
    },
    {
      title: 'Настройка профиля и управление аккаунтом',
      views: 842,
      category: 'Аккаунт',
      time: '4 мин. чтения',
      url: '#'
    },
    {
      title: 'Проблемы с авторизацией: решение распространенных ошибок',
      views: 701,
      category: 'Устранение проблем',
      time: '6 мин. чтения',
      url: '#'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-6">Поддержка</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-3xl">
            Найдите ответы на ваши вопросы или свяжитесь с нашей командой поддержки, если вам нужна помощь.
          </p>
          
          {/* Секция с опциями поддержки */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-full bg-devhub-purple/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-devhub-purple" />
                </div>
                <CardTitle className="text-xl">База знаний</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Исчерпывающие руководства и статьи, которые помогут вам решить большинство вопросов.
                </p>
                <Button variant="outline" className="flex items-center gap-2 w-full">
                  Перейти к базе знаний
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-full bg-devhub-purple/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-devhub-purple" />
                </div>
                <CardTitle className="text-xl">Создать тикет</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Отправьте запрос в нашу службу поддержки, и мы ответим вам в течение 24 часов.
                </p>
                <Button variant="outline" className="flex items-center gap-2 w-full">
                  Создать тикет
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-full bg-devhub-purple/10 flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-devhub-purple" />
                </div>
                <CardTitle className="text-xl">FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Ответы на часто задаваемые вопросы о нашей платформе и её функциях.
                </p>
                <Button variant="outline" className="flex items-center gap-2 w-full">
                  Перейти к FAQ
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Популярные статьи */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Популярные статьи поддержки</h2>
            <div className="space-y-4">
              {supportArticles.map((article, index) => (
                <a key={index} href={article.url} className="block">
                  <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium mb-1">{article.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Badge variant="outline">{article.category}</Badge>
                          <span>{article.time}</span>
                          <span>·</span>
                          <span>{article.views} просмотров</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" className="flex mx-auto items-center gap-2">
                Показать больше статей
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
          
          {/* Live Chat */}
          <section className="mb-16">
            <div className="bg-devhub-purple/10 p-8 rounded-lg flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-devhub-purple/20 flex items-center justify-center">
                  <LifeBuoy className="h-6 w-6 text-devhub-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Нужна помощь прямо сейчас?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Наши специалисты поддержки готовы помочь вам в режиме реального времени.
                  </p>
                </div>
              </div>
              <Button className="gradient-bg text-white min-w-[180px]">
                Начать живой чат
              </Button>
            </div>
          </section>
          
          {/* Сообщество и самопомощь */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Сообщество и самопомощь</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Сообщество DevHub</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Общайтесь с другими разработчиками, делитесь опытом и находите решения вместе.
                  </p>
                  <Button variant="outline" className="w-full">Присоединиться к сообществу</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Видеоуроки</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Обучающие видео, демонстрирующие основные функции и возможности платформы.
                  </p>
                  <Button variant="outline" className="w-full">Смотреть видеоуроки</Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportPage;
