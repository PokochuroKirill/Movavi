
import { Link } from 'react-router-dom';
import { Code, Twitter } from 'lucide-react';

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
              <a href="https://twitter.com/DevHubOfficial" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-devhub-purple transition-colors">
                <Twitter className="h-5 w-5" />
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
                <Link to="/documentation" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Документация
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Блог
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Связаться с нами</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Контакты
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  О нас
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                  Поддержка
                </Link>
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
