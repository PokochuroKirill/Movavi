
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const DocumentationPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-8">Документация</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mt-8 mb-4">Начало работы с DevHub</h2>
            <p>
              DevHub - это платформа для разработчиков, позволяющая делиться проектами, кодом и идеями.
              Эта документация поможет вам начать использовать нашу платформу.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Регистрация и вход</h3>
            <p>
              Чтобы использовать все возможности DevHub, вам необходимо создать учетную запись.
              Для этого перейдите на страницу регистрации и заполните предложенную форму.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Создание проекта</h3>
            <p>
              После входа в систему вы можете создавать проекты. Проект - это страница,
              на которой вы представляете свою работу, добавляя описание, скриншоты, ссылки на репозиторий и живую демонстрацию.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Добавление сниппетов кода</h3>
            <p>
              Сниппеты - это фрагменты кода, которыми вы хотите поделиться с сообществом.
              Вы можете добавлять сниппеты, указывая язык программирования, название, описание и сам код.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">API DevHub</h2>
            <p>
              DevHub предоставляет API для интеграции с вашими приложениями.
              В настоящее время API находится в разработке. Следите за обновлениями!
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Технические требования</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Современный веб-браузер (Chrome, Firefox, Safari, Edge)</li>
              <li>Стабильное подключение к интернету</li>
              <li>Включенный JavaScript</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Часто задаваемые вопросы</h2>
            <p>
              Ознакомьтесь с разделом <a href="/faq" className="text-devhub-purple hover:underline">FAQ</a> для получения ответов на часто задаваемые вопросы.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DocumentationPage;
