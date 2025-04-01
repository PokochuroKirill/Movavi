
import { Link } from 'react-router-dom';
import { Code, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <Code className="h-6 w-6 text-devhub-purple" />
              <span className="text-lg font-bold text-gradient">DevHub</span>
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Сообщество разработчиков для обмена идеями, проектами и кодом.
            </p>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="text-gray-500 hover:text-devhub-purple transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-devhub-purple transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-devhub-purple transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Проекты
                </Link>
              </li>
              <li>
                <Link to="/snippets" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Сниппеты
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Ресурсы</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Документация
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Блог
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Связаться с нами</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Контакты
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  О нас
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Поддержка
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} DevHub. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
