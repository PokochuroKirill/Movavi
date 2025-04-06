
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, FolderGit2, Share2, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-devhub-veryDarkPurple">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            <span className="text-gradient">DevHub</span> - Ваш центр для<br />
            разработки, сотрудничества и обучения
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center max-w-3xl mb-10">
            Делитесь проектами, кодом, идеями и находите единомышленников. Совершенствуйте свои навыки и создавайте удивительные вещи вместе.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth">
              <Button size="lg" className="gradient-bg text-white">
                Начать сейчас
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-devhub-purple text-devhub-purple hover:bg-devhub-purple/10">
                Узнать больше
              </Button>
            </Link>
          </div>
          
          <div className="mt-20 w-full max-w-5xl">
            <div className="relative w-full h-[400px] bg-devhub-veryDarkPurple rounded-lg shadow-xl overflow-hidden">
              <div className="absolute inset-0 p-8 bg-devhub-veryDarkPurple/80 backdrop-blur flex items-center justify-center">
                <div className="code-block w-full max-w-2xl text-left">
                  <pre className="text-green-400"># DevHub - ваш код, ваши проекты, ваше сообщество</pre>
                  <pre className="text-blue-400">join(DevHub)<span className="text-white cursor-blink">|</span></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Что вы можете делать на DevHub?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg card-hover">
              <FolderGit2 className="h-12 w-12 text-devhub-purple mb-4" />
              <h3 className="text-xl font-bold mb-4">Делиться проектами</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Публикуйте свои проекты, получайте обратную связь и сотрудничайте с другими разработчиками.
              </p>
              <Link to="/projects" className="text-devhub-purple flex items-center gap-1 hover:gap-2 transition-all">
                Исследовать проекты <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg card-hover">
              <Code className="h-12 w-12 text-devhub-purple mb-4" />
              <h3 className="text-xl font-bold mb-4">Обмениваться кодом</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Делитесь фрагментами кода, алгоритмами и полезными решениями с сообществом.
              </p>
              <Link to="/snippets" className="text-devhub-purple flex items-center gap-1 hover:gap-2 transition-all">
                Просмотреть сниппеты <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg card-hover">
              <Users className="h-12 w-12 text-devhub-purple mb-4" />
              <h3 className="text-xl font-bold mb-4">Находить единомышленников</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Знакомьтесь с другими разработчиками, обменивайтесь идеями и создавайте вместе.
              </p>
              <Link to="/auth" className="text-devhub-purple flex items-center gap-1 hover:gap-2 transition-all">
                Присоединиться к сообществу <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-devhub-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Готовы присоединиться к сообществу?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">
            Станьте частью растущего сообщества разработчиков, делитесь своими знаниями и учитесь у других.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-devhub-purple hover:bg-gray-100">
              Зарегистрироваться бесплатно
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HomePage;
