
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
      question: "What is DevHub?",
      answer: "DevHub is a platform where developers can share projects, code snippets, gain inspiration, and connect with like-minded programmers. It offers tools for showcasing your work and discovering interesting projects from the community."
    },
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the top right corner of the page. You can register using your email address, and then complete your profile by adding information about yourself and your areas of expertise."
    },
    {
      question: "Can I share private repositories?",
      answer: "Currently, DevHub supports public sharing only. However, you can choose what specific details to share about your projects, including limiting the amount of code displayed."
    },
    {
      question: "How do I add a project to my profile?",
      answer: "After logging in, navigate to your profile and click 'Create Project.' You can then enter details about your project including title, description, technologies used, and links to GitHub or live demos."
    },
    {
      question: "What types of projects can I share?",
      answer: "You can share any software development project including websites, mobile apps, games, libraries, tools, or experiments. There are no limitations on programming languages or frameworks."
    },
    {
      question: "How do code snippets work?",
      answer: "Code snippets are smaller pieces of code that solve specific problems or demonstrate particular techniques. You can publish snippets with syntax highlighting for various languages, add explanations, and categorize them with tags."
    },
    {
      question: "Can I follow other developers?",
      answer: "Yes, you can follow other users to see their projects and snippets in your feed. This helps you stay updated with content from developers whose work interests you."
    },
    {
      question: "How can I report inappropriate content?",
      answer: "If you find content that violates our community guidelines, use the report function available on each project or snippet page, or contact our support team directly."
    },
    {
      question: "Is DevHub free to use?",
      answer: "Yes, DevHub is currently free to use with all core features available to everyone. We may introduce premium features in the future, but the basic functionality will remain free."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-10">
            Find answers to common questions about using DevHub. Can't find what you're looking for? Contact our support team for assistance.
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
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our support team is ready to help you with any other questions you might have about DevHub.
            </p>
            <Link to="/contact">
              <Button className="gradient-bg text-white">
                Contact Support
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
