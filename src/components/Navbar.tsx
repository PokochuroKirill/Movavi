
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Code, Home, Search, FolderGit2, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-devhub-veryDarkPurple/90 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Code className="h-8 w-8 text-devhub-purple" />
            <span className="text-xl font-bold text-gradient">DevHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              <Home className="h-4 w-4" />
              <span>Главная</span>
            </Link>
            <Link to="/projects" className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              <FolderGit2 className="h-4 w-4" />
              <span>Проекты</span>
            </Link>
            <Link to="/snippets" className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              <Code className="h-4 w-4" />
              <span>Сниппеты</span>
            </Link>
            <Button className="gradient-bg text-white">Присоединиться</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="p-2 text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-devhub-veryDarkPurple animate-fade-in mt-4 p-4 rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 p-2 text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Главная</span>
              </Link>
              <Link 
                to="/projects" 
                className="flex items-center gap-2 p-2 text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FolderGit2 className="h-5 w-5" />
                <span>Проекты</span>
              </Link>
              <Link 
                to="/snippets" 
                className="flex items-center gap-2 p-2 text-gray-700 dark:text-gray-300 hover:text-devhub-purple dark:hover:text-devhub-purple transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Code className="h-5 w-5" />
                <span>Сниппеты</span>
              </Link>
              <Button className="gradient-bg text-white w-full">Присоединиться</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
