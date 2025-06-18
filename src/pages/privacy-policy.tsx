import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
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
            {/* ...оставь твои секции без изменений... */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
