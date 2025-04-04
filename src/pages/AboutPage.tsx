
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Code, Lightbulb, Users, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">О DevHub</h1>
            <p className="text-xl max-w-2xl mx-auto mb-10">
              Платформа, созданная разработчиками для разработчиков, чтобы делиться знаниями, учиться и расти вместе.
            </p>
            <Link to="/auth">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 text-lg py-6 px-8">
                Начать прямо сейчас
              </Button>
            </Link>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Наша миссия</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                DevHub был создан для формирования активного сообщества, где разработчики могут демонстрировать свои работы,
                делиться знаниями через сниппеты и общаться с единомышленниками. Мы верим в силу открытого сотрудничества
                и обмена знаниями для ускорения инноваций в разработке программного обеспечения.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Что нас отличает</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Code className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Сниппеты кода</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Делитесь полезными фрагментами кода с подсветкой синтаксиса и подробными объяснениями.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Lightbulb className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Витрина проектов</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Демонстрируйте свои проекты со скриншотами, описаниями и ссылками на живые демонстрации.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Сеть разработчиков</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Связывайтесь с другими разработчиками, следите за их работой и сотрудничайте над проектами.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto bg-orange-100 dark:bg-orange-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-orange-600 dark:text-orange-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Глобальное сообщество</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Присоединяйтесь к всемирному сообществу разработчиков, обменивающихся знаниями через границы.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Готовы присоединиться к нашему сообществу?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-10">
              Создайте учетную запись сегодня, чтобы начать делиться своими проектами,
              изучать сниппеты кода и общаться с разработчиками со всего мира.
            </p>
            <Link to="/auth">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 text-lg py-6 px-8">
                Начать сейчас
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
