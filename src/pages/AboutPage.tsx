import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkle, Users, Rocket, Lightbulb } from 'lucide-react';
const TEAM = [{
  name: "Алексей Петров",
  role: "Основатель & Backend",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg"
}, {
  name: "Полина Смирнова",
  role: "Frontend & UI/UX",
  avatar: "https://randomuser.me/api/portraits/women/56.jpg"
}, {
  name: "Артём Захаров",
  role: "Community & Support",
  avatar: "https://randomuser.me/api/portraits/men/76.jpg"
}];
const AboutPage = () => {
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-100 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* История */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkle className="text-pink-500 animate-pulse" /> О DevHub
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  DevHub родился из желания создать уютную площадку для российских и русскоязычных разработчиков, где каждый может чувствовать себя частью активного профессионального сообщества. Здесь объединяются люди с самыми разными интересами — от веба до embedded, от джунов до синьоров.
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                  Проект запустился весной 2024 года и сразу стал больше, чем просто витриной проектов. Это место для совместного развития, обмена опытом, поиска вдохновения, нетворкинга и поддержки друг друга.
                </p>
              </div>
              
            </div>
          </div>
        </section>

        {/* Миссия и ценности */}
        <section className="py-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-indigo-800 dark:text-indigo-200 mb-6">
              Миссия и ценности
            </h2>
            <ul className="space-y-6 text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
              <li>
                • Делиться знаниями и создавать среду взаимной поддержки среди разработчиков.
              </li>
              <li>
                • Поддерживать открытость, инклюзивность и уважительный диалог.
              </li>
              <li>
                • Помогать новичкам учиться и развиваться, а опытным — находить вдохновение и единомышленников.
              </li>
            </ul>
          </div>
        </section>

        {/* Особенности DevHub */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-indigo-700 dark:text-indigo-100 mb-12">
              Почему выбирают DevHub?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-lg p-8 rounded-2xl">
                <Lightbulb className="w-10 h-10 mb-4 text-yellow-400 dark:text-yellow-300" />
                <div className="font-bold text-lg mb-2">Уникальные проекты</div>
                <div className="text-gray-600 dark:text-gray-300 text-base text-center">
                  Продемонстрируйте свои проекты, взгляните на чужие решения — получите конструктивную обратную связь.
                </div>
              </div>
              <div className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-lg p-8 rounded-2xl">
                <Rocket className="w-10 h-10 mb-4 text-purple-600 dark:text-purple-300" />
                <div className="font-bold text-lg mb-2">Сообщество и поддержка</div>
                <div className="text-gray-600 dark:text-gray-300 text-base text-center">
                  Наша сила — в единстве. Участвуйте в обсуждениях, помогайте друг другу, заводите новые знакомства.
                </div>
              </div>
              <div className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-lg p-8 rounded-2xl">
                <Users className="w-10 h-10 mb-4 text-pink-500 dark:text-pink-300" />
                <div className="font-bold text-lg mb-2">Безопасная среда</div>
                <div className="text-gray-600 dark:text-gray-300 text-base text-center">
                  Акцент на уважение, модерации и прозрачной обратной связи — чтобы все чувствовали себя комфортно.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Команда */}
        

        {/* CTA */}
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-indigo-800 dark:text-indigo-100">
              Присоединяйтесь к нам!
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Постройте свою карьеру вместе с единомышленниками — участвуйте в жизни сообщества, делитесь опытом и растите c DevHub!
            </p>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:scale-105 transition-transform">
                Стать частью DevHub
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default AboutPage;