
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfServicePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Условия пользования</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Последнее обновление: 1 июля 2025 г.
          </p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Принятие условий</h2>
              <p>
                Используя DevHub, вы соглашаетесь соблюдать эти условия пользования. Если вы не согласны 
                с этими условиями, пожалуйста, не используйте наш сервис.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Описание сервиса</h2>
              <p>
                DevHub - это платформа для разработчиков, позволяющая делиться проектами, сниппетами кода 
                и участвовать в сообществах.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Регистрация и аккаунт</h2>
              <p>
                Для использования некоторых функций необходимо создать аккаунт. Вы несете ответственность 
                за сохранение конфиденциальности вашего аккаунта.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Правила поведения</h2>
              <p>
                Запрещается публикация оскорбительного, незаконного или неподходящего контента. 
                Относитесь с уважением к другим пользователям.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Интеллектуальная собственность</h2>
              <p>
                Вы сохраняете права на свой контент, но предоставляете нам лицензию на его использование 
                в рамках работы платформы.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Ограничение ответственности</h2>
              <p>
                DevHub предоставляется "как есть" без каких-либо гарантий. Мы не несем ответственности 
                за любой ущерб, возникший в результате использования платформы.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Изменения условий</h2>
              <p>
                Мы можем изменить эти условия в любое время. Продолжение использования сервиса означает 
                согласие с изменениями.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
