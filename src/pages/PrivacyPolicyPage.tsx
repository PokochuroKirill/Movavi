
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
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Политика конфиденциальности</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Последнее обновление: 1 июня 2025 г.
          </p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Введение</h2>
              <p>
                Настоящая Политика конфиденциальности описывает, как DevHub собирает, использует и защищает 
                вашу личную информацию при использовании нашего веб-сайта и услуг.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Сбор информации</h2>
              <p>Мы собираем следующие типы информации:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Информация учетной записи: имя пользователя, адрес электронной почты, профиль</li>
                <li>Контент: проекты, сниппеты кода, комментарии и другой контент, который вы публикуете</li>
                <li>Данные об использовании: информация о том, как вы используете наш сервис</li>
                <li>Техническая информация: IP-адрес, тип браузера, операционная система</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Использование информации</h2>
              <p>Мы используем собранную информацию для:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Предоставления и улучшения наших услуг</li>
                <li>Управления вашей учетной записью</li>
                <li>Общения с вами по поводу обновлений и поддержки</li>
                <li>Обеспечения безопасности и предотвращения мошенничества</li>
                <li>Соблюдения правовых обязательств</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Обмен информацией</h2>
              <p>
                Мы не продаем, не обмениваем и не передаем вашу личную информацию третьим лицам без 
                вашего согласия, за исключением случаев, описанных в данной политике.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Безопасность данных</h2>
              <p>
                Мы принимаем соответствующие меры безопасности для защиты вашей личной информации от 
                несанкционированного доступа, изменения, раскрытия или уничтожения.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Ваши права</h2>
              <p>У вас есть право:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Получить доступ к вашей личной информации</li>
                <li>Исправить неточную или неполную информацию</li>
                <li>Удалить вашу личную информацию</li>
                <li>Ограничить обработку ваших данных</li>
                <li>Перенести ваши данные</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Файлы cookie</h2>
              <p>
                Мы используем файлы cookie и аналогичные технологии для улучшения вашего опыта 
                использования нашего сервиса, анализа трафика и персонализации контента.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Изменения политики</h2>
              <p>
                Мы можем обновлять данную Политику конфиденциальности время от времени. 
                Уведомления об изменениях будут размещены на этой странице.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Контакты</h2>
              <p>
                Если у вас есть вопросы о данной Политике конфиденциальности, свяжитесь с нами: 
                privacy@devhub.ru
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
