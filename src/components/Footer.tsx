
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between">
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
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
