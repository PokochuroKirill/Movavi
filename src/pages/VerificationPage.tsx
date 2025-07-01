
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, Star, Building, Award } from 'lucide-react';

const VerificationPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Верификация на DevHub</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Узнайте о процессе верификации и типах подтвержденных аккаунтов
          </p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Что такое верификация?</h2>
              <p>
                Верификация на DevHub - это процесс подтверждения подлинности аккаунта. Она помогает пользователям 
                отличить настоящие аккаунты от подделок и повышает доверие к контенту.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Типы верификации</h2>
              
              <div className="grid gap-6 mb-6">
                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Стандартная верификация</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Базовая верификация для подтверждения подлинности аккаунта. Выдается активным участникам 
                      сообщества с хорошей репутацией.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Медийная личность</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Верификация для известных разработчиков, блогеров, стримеров и других медийных личностей 
                      в сфере IT.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Организация/Бизнес</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Верификация для официальных аккаунтов компаний, организаций и бизнесов в сфере технологий.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Команда DevHub</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Специальная верификация для членов команды DevHub и почетных участников проекта.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Как получить верификацию?</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Активно участвуйте в жизни сообщества</li>
                <li>Публикуйте качественный контент</li>
                <li>Соблюдайте правила платформы</li>
                <li>Обратитесь к администрации через Discord для рассмотрения вашей заявки</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Требования для верификации</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Полностью заполненный профиль</li>
                <li>Активность на платформе не менее 3 месяцев</li>
                <li>Положительная репутация в сообществе</li>
                <li>Отсутствие нарушений правил</li>
                <li>Публикация оригинального контента</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Часто задаваемые вопросы</h2>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Платная ли верификация?</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Нет, верификация на DevHub абсолютно бесплатна.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Можно ли потерять верификацию?</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Да, верификация может быть отозвана при нарушении правил платформы.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerificationPage;
