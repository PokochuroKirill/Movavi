
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderX } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center">
        <div className="container max-w-lg mx-auto px-4 text-center py-16">
          <FolderX className="h-24 w-24 text-devhub-purple mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <p className="text-2xl font-semibold text-gradient mb-4">Страница не найдена</p>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Упс! Кажется, вы пытаетесь найти страницу, которой не существует.
          </p>
          <Button asChild size="lg" className="gradient-bg text-white">
            <Link to="/">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Вернуться на главную
            </Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
