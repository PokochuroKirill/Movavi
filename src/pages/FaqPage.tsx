
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FaqPage = () => {
  const faqs = [
    {
      question: "Что такое DevHub?",
      answer: "DevHub — это платформа, где разработчики могут делиться проектами, фрагментами кода, получать вдохновение и общаться с единомышленниками. Она предлагает инструменты для демонстрации ваших работ и открытия интересных проектов сообщества."
    },
    {
      question: "Как создать аккаунт?",
      answer: "Нажмите кнопку 'Войти' в правом верхнем углу страницы. Вы можете зарегистрироваться, используя свой email-адрес, а затем заполнить свой профиль, добавив информацию о себе и своих областях специализации."
    },
    {
      question: "Могу ли я делиться приватными репозиториями?",
      answer: "В настоящее время DevHub поддерживает только публичный обмен. Однако вы можете выбирать, какими конкретными деталями делиться о своих проектах, включая ограничение объема отображаемого кода."
    },
    {
      question: "Как добавить проект в мой профиль?",
      answer: "После входа в систему перейдите в свой профиль и нажмите 'Создать проект'. Затем вы можете ввести информацию о своем проекте, включая название, описание, используемые технологии и ссылки на GitHub или живые демо."
    },
    {
      question: "Какие типы проектов я могу публиковать?",
      answer: "Вы можете делиться любыми проектами по разработке программного обеспечения, включая веб-сайты, мобильные приложения, игры, библиотеки, инструменты или эксперименты. Нет ограничений на языки программирования или фреймворки."
    },
    {
      question: "Как работают фрагменты кода?",
      answer: "Фрагменты кода — это небольшие части кода, которые решают конкретные проблемы или демонстрируют определенные техники. Вы можете публиковать фрагменты с подсветкой синтаксиса для различных языков, добавлять объяснения и классифицировать их с помощью тегов."
    },
    {
      question: "Могу ли я подписаться на других разработчиков?",
      answer: "Да, вы можете подписаться на других пользователей, чтобы видеть их проекты и фрагменты кода в своей ленте. Это помогает вам быть в курсе контента от разработчиков, чья работа вас интересует."
    },
    {
      question: "Как сообщить о неприемлемом контенте?",
      answer: "Если вы обнаружите контент, нарушающий правила нашего сообщества, используйте функцию жалобы, доступную на странице каждого проекта или фрагмента кода, или свяжитесь с нашей командой поддержки напрямую."
    },
    {
      question: "DevHub бесплатен для использования?",
      answer: "Да, DevHub в настоящее время бесплатен для использования, все основные функции доступны каждому. В будущем мы можем ввести премиум-функции, но базовая функциональность останется бесплатной."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Часто задаваемые вопросы</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-10">
            Найдите ответы на распространенные вопросы об использовании DevHub. Не можете найти то, что ищете? Обратитесь в нашу службу поддержки за помощью.
          </p>
          
          <Accordion type="single" collapsible className="mb-10">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b">
                <AccordionTrigger className="text-lg font-medium hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="text-center bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Остались вопросы?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Наша команда поддержки готова помочь вам с любыми другими вопросами, которые у вас могут возникнуть о DevHub.
            </p>
            <Link to="/contact">
              <Button className="gradient-bg text-white">
                Связаться с поддержкой
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FaqPage;
