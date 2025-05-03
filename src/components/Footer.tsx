import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-devhub-purple bg-clip-text text-transparent">DevHub</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mt-4">
              Платформа для разработчиков, где вы можете делиться проектами, находить вдохновение и общаться с сообществом.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://twitter.com/DevHubOfficial" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-devhub-purple transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Навигация</h3>
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
                <li>
                  <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
                    О нас
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Правовая информация</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms-of-service" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Правила и условия
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
          <p>© 2025 DevHub. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
