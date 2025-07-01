
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Политика конфиденциальности</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Последнее обновление: 1 июля 2025 г.
          </p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Сбор информации</h2>
              <p>
                Мы собираем информацию, которую вы предоставляете нам напрямую, такую как имя пользователя, 
                электронная почта, профиль и контент, который вы создаете на платформе.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Использование информации</h2>
              <p>
                Мы используем собранную информацию для предоставления, улучшения и персонализации наших услуг, 
                а также для связи с вами относительно вашей учетной записи и наших услуг.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Обмен информацией</h2>
              <p>
                Мы не продаем, не обмениваем и не передаем вашу личную информацию третьим лицам без вашего 
                согласия, за исключением случаев, описанных в этой политике.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Безопасность данных</h2>
              <p>
                Мы принимаем разумные меры для защиты вашей личной информации от потери, кражи, неправомерного 
                использования и несанкционированного доступа.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Cookies</h2>
              <p>
                Мы используем файлы cookie для улучшения вашего опыта использования сайта, анализа трафика 
                и персонализации контента.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Ваши права</h2>
              <p>
                Вы имеете право получать доступ к своей личной информации, исправлять ее, удалять или 
                ограничивать ее обработку.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Контактная информация</h2>
              <p>
                Если у вас есть вопросы относительно этой Политики конфиденциальности, свяжитесь с нами 
                через Discord.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
