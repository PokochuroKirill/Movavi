
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const FaqPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const faqItems = [
    {
      question: "Что такое DevHub?",
      answer: "DevHub — это платформа для разработчиков, где они могут делиться своими проектами, сниппетами кода и идеями, а также находить единомышленников для совместной работы над проектами."
    },
    {
      question: "Как зарегистрироваться на DevHub?",
      answer: "Для регистрации на DevHub, нажмите кнопку 'Присоединиться' в верхней части страницы, заполните форму регистрации и подтвердите ваш адрес электронной почты."
    },
    {
      question: "Является ли DevHub бесплатным?",
      answer: "Да, основные функции DevHub доступны бесплатно. В будущем могут быть добавлены платные функции или планы, но основная функциональность всегда останется бесплатной."
    },
    {
      question: "Как добавить проект на DevHub?",
      answer: "После входа в аккаунт, перейдите в раздел 'Проекты', нажмите кнопку 'Добавить проект' и заполните все необходимые поля. Вы можете добавить описание, скриншоты, ссылки на GitHub и живую демонстрацию."
    },
    {
      question: "Как поделиться сниппетом кода?",
      answer: "После входа в систему, перейдите в раздел 'Сниппеты', нажмите 'Добавить сниппет', выберите язык программирования, напишите название и описание, затем вставьте свой код и опубликуйте."
    },
    {
      question: "Могу ли я редактировать уже опубликованные проекты или сниппеты?",
      answer: "Да, вы можете редактировать свои опубликованные проекты и сниппеты в любое время. Просто перейдите на страницу проекта или сниппета и нажмите 'Редактировать'."
    },
    {
      question: "Как я могу связаться с другими разработчиками на DevHub?",
      answer: "Вы можете оставлять комментарии на страницах проектов и сниппетов, а также использовать систему личных сообщений для прямого общения с другими пользователями."
    },
    {
      question: "Есть ли у DevHub API?",
      answer: "В настоящее время API находится в разработке. Следите за обновлениями на нашем сайте и в блоге."
    },
    {
      question: "Какие языки программирования поддерживаются для сниппетов?",
      answer: "DevHub поддерживает большинство популярных языков программирования, включая JavaScript, TypeScript, Python, Java, C#, PHP, Ruby, Go и многие другие."
    },
    {
      question: "Как обеспечивается безопасность моих данных на DevHub?",
      answer: "Мы используем современные методы шифрования для защиты ваших данных. Ваши пароли хранятся в зашифрованном виде, и мы регулярно обновляем наши системы безопасности."
    }
  ];
  
  const filteredFaqItems = searchQuery
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-6">Часто задаваемые вопросы</h1>
          
          <div className="mb-8">
            <div className="relative">
              <Input
                placeholder="Поиск по вопросам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  Очистить
                </Button>
              )}
            </div>
          </div>
          
          {filteredFaqItems.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-300">По вашему запросу ничего не найдено.</p>
              <p className="mt-2">Попробуйте изменить поисковый запрос или просмотреть все вопросы.</p>
              <Button 
                variant="ghost" 
                className="mt-4 text-devhub-purple"
                onClick={() => setSearchQuery('')}
              >
                Показать все вопросы
              </Button>
            </div>
          )}
          
          <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Не нашли ответ на свой вопрос?</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Свяжитесь с нашей командой поддержки, и мы постараемся помочь вам в кратчайшие сроки.
            </p>
            <Button className="gradient-bg text-white">
              Связаться с поддержкой
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FaqPage;
