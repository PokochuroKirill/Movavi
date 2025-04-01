
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GitHub, Linkedin, Twitter } from 'lucide-react';

const AboutPage = () => {
  // Пример данных команды
  const teamMembers = [
    {
      name: 'Александр Иванов',
      role: 'Основатель и CEO',
      bio: 'Опытный разработчик с более чем 10-летним стажем в индустрии. Руководил разработкой крупных IT-проектов.',
      imageUrl: 'https://picsum.photos/id/1001/300/300',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    {
      name: 'Елена Петрова',
      role: 'Технический директор',
      bio: 'Эксперт в области разработки и архитектуры приложений. Ранее работала в ведущих IT-компаниях.',
      imageUrl: 'https://picsum.photos/id/1005/300/300',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    {
      name: 'Дмитрий Смирнов',
      role: 'Руководитель разработки',
      bio: 'Разработчик с глубокими знаниями в области веб-технологий. Ответственен за техническую реализацию проекта.',
      imageUrl: 'https://picsum.photos/id/1012/300/300',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    {
      name: 'Мария Сидорова',
      role: 'UX/UI Дизайнер',
      bio: 'Талантливый дизайнер с большим опытом создания пользовательских интерфейсов. Отвечает за дизайн платформы.',
      imageUrl: 'https://picsum.photos/id/1014/300/300',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-6">О нас</h1>
          
          {/* История и миссия */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Наша история и миссия</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                DevHub был создан в 2023 году группой энтузиастов, объединенных общей идеей — 
                создать платформу, где разработчики со всего мира могли бы делиться своими проектами, 
                кодом и идеями.
              </p>
              <p>
                Наша миссия — сделать разработку программного обеспечения более доступной и 
                коллаборативной. Мы верим, что сообщество разработчиков может достичь большего, 
                работая вместе и делясь знаниями.
              </p>
              <p>
                За короткое время наша платформа выросла от идеи до полноценного сервиса, 
                которым пользуются тысячи разработчиков. Мы постоянно развиваемся, 
                добавляя новые функции и улучшая пользовательский опыт.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center flex flex-col items-center">
                <div className="text-4xl font-bold text-devhub-purple mb-2">10,000+</div>
                <div>Активных пользователей</div>
              </Card>
              <Card className="p-6 text-center flex flex-col items-center">
                <div className="text-4xl font-bold text-devhub-purple mb-2">5,000+</div>
                <div>Опубликованных проектов</div>
              </Card>
              <Card className="p-6 text-center flex flex-col items-center">
                <div className="text-4xl font-bold text-devhub-purple mb-2">15,000+</div>
                <div>Сниппетов кода</div>
              </Card>
            </div>
          </section>
          
          {/* Наша команда */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Наша команда</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative pb-[100%]">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-devhub-purple mb-2">{member.role}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{member.bio}</p>
                    <div className="flex space-x-2">
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-devhub-purple transition-colors"
                      >
                        <GitHub className="h-5 w-5" />
                      </a>
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-devhub-purple transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-devhub-purple transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          
          {/* Наши ценности */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Наши ценности</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Открытость</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Мы верим в открытость и прозрачность как фундаментальные принципы сотрудничества. 
                  Наш код открыт и доступен для всех.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Сообщество</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Мы ценим каждого участника нашего сообщества и стремимся создать среду, 
                  где каждый чувствует себя нужным и важным.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Инновации</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Мы постоянно ищем новые решения и подходы, чтобы сделать нашу платформу 
                  лучше и удобнее для пользователей.
                </p>
              </Card>
            </div>
          </section>
          
          {/* CTA */}
          <section className="bg-devhub-purple text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">Присоединяйтесь к нам</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Станьте частью нашего растущего сообщества разработчиков. 
              Делитесь своими проектами, изучайте работы других и находите единомышленников.
            </p>
            <Button className="bg-white text-devhub-purple hover:bg-gray-100">
              Начать сейчас
            </Button>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
