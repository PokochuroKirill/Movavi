
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BlogPage = () => {
  // Имитация данных блога
  const blogPosts = [
    {
      id: 1,
      title: 'Введение в React 18: Что нового и как использовать',
      excerpt: 'React 18 внес значительные изменения в работу с асинхронным рендерингом и управлением состоянием. В этой статье мы рассмотрим основные новшества.',
      author: 'Александр Петров',
      date: '21 июня 2023',
      readTime: '7 мин. чтения',
      category: 'JavaScript',
    },
    {
      id: 2,
      title: 'Полное руководство по TypeScript для начинающих',
      excerpt: 'TypeScript становится все более популярным в мире веб-разработки. Узнайте, как начать работу с этим мощным инструментом и избежать распространенных ошибок.',
      author: 'Мария Иванова',
      date: '15 мая 2023',
      readTime: '10 мин. чтения',
      category: 'TypeScript',
    },
    {
      id: 3,
      title: 'Оптимизация производительности веб-приложений: практические советы',
      excerpt: 'Производительность - ключевой фактор успеха любого веб-приложения. В этой статье мы поделимся практическими советами по оптимизации вашего кода.',
      author: 'Дмитрий Сидоров',
      date: '3 апреля 2023',
      readTime: '12 мин. чтения',
      category: 'Оптимизация',
    },
    {
      id: 4,
      title: 'Основы GraphQL: преимущества перед REST API',
      excerpt: 'GraphQL предлагает альтернативный подход к построению API. Разберемся, когда стоит использовать GraphQL и какие преимущества он дает перед традиционным REST.',
      author: 'Елена Смирнова',
      date: '18 марта 2023',
      readTime: '8 мин. чтения',
      category: 'API',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-2">Блог DevHub</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Последние новости, руководства и советы для разработчиков
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-sm text-muted-foreground mb-2">{post.category} • {post.readTime}</div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {post.author} • {post.date}
                  </div>
                  <Button variant="ghost" className="text-devhub-purple hover:text-devhub-purple/80">
                    Читать
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Хотите больше контента?</p>
            <Button className="gradient-bg text-white">Загрузить еще статьи</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;
