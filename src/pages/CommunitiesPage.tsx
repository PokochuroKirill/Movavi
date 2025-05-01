
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Search, MessageSquare, Activity } from "lucide-react";

const CommunitiesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const communities = [
    {
      id: 1,
      name: "JavaScript Developers",
      description: "Сообщество разработчиков JavaScript и фронтенд технологий",
      members: 1240,
      topics: ["JavaScript", "React", "Vue", "Angular"],
      imageUrl: "https://picsum.photos/seed/js/200/200"
    },
    {
      id: 2,
      name: "Python Enthusiasts",
      description: "Группа для обсуждения Python, Django, Flask и ML технологий",
      members: 980,
      topics: ["Python", "Django", "Flask", "Machine Learning"],
      imageUrl: "https://picsum.photos/seed/python/200/200"
    },
    {
      id: 3,
      name: "DevOps Professionals",
      description: "Обсуждение DevOps практик, CI/CD, контейнеризации и автоматизации",
      members: 756,
      topics: ["Docker", "Kubernetes", "CI/CD", "Cloud"],
      imageUrl: "https://picsum.photos/seed/devops/200/200"
    },
    {
      id: 4,
      name: "Mobile Development",
      description: "Сообщество мобильных разработчиков iOS, Android, React Native и Flutter",
      members: 892,
      topics: ["iOS", "Android", "React Native", "Flutter"],
      imageUrl: "https://picsum.photos/seed/mobile/200/200"
    },
    {
      id: 5,
      name: "Game Development",
      description: "Разработка игр на Unity, Unreal Engine и других технологиях",
      members: 623,
      topics: ["Unity", "Unreal Engine", "C#", "C++"],
      imageUrl: "https://picsum.photos/seed/gamedev/200/200"
    }
  ];

  const popularDiscussions = [
    {
      id: 1,
      title: "Лучшие практики TypeScript в 2025 году",
      author: "Александр М.",
      authorAvatar: "https://picsum.photos/seed/alex/100/100",
      replies: 42,
      community: "JavaScript Developers",
      lastActive: "2 часа назад"
    },
    {
      id: 2,
      title: "Как оптимизировать производительность React-приложений",
      author: "Елена К.",
      authorAvatar: "https://picsum.photos/seed/elena/100/100",
      replies: 37,
      community: "JavaScript Developers",
      lastActive: "5 часов назад"
    },
    {
      id: 3,
      title: "Построение ML-моделей для анализа текста",
      author: "Михаил С.",
      authorAvatar: "https://picsum.photos/seed/mikhail/100/100",
      replies: 29,
      community: "Python Enthusiasts",
      lastActive: "вчера"
    }
  ];

  const filteredCommunities = searchQuery 
    ? communities.filter(community => 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : communities;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-2">Сообщества</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Присоединяйтесь к профессиональным сообществам, делитесь знаниями и общайтесь с единомышленниками
          </p>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Поиск сообществ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="communities" className="w-full mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="communities">
                <Users className="mr-2 h-4 w-4" />
                Сообщества
              </TabsTrigger>
              <TabsTrigger value="discussions">
                <MessageSquare className="mr-2 h-4 w-4" />
                Активные обсуждения
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="communities">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map(community => (
                  <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={community.imageUrl} 
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{community.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{community.members} участников</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        {community.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {community.topics.map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full gradient-bg text-white">
                        Присоединиться
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredCommunities.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Сообществ по вашему запросу не найдено
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="discussions">
              <div className="space-y-4">
                {popularDiscussions.map(discussion => (
                  <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium hover:text-devhub-purple transition-colors cursor-pointer">
                            {discussion.title}
                          </h3>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={discussion.authorAvatar} />
                                <AvatarFallback>{discussion.author[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{discussion.author}</span>
                            </div>
                            <Badge variant="outline">
                              {discussion.community}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MessageSquare className="h-4 w-4" />
                          <span>{discussion.replies}</span>
                          <span>·</span>
                          <Activity className="h-4 w-4" />
                          <span>{discussion.lastActive}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-12">
            <Button variant="outline" className="px-8">
              Создать сообщество
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunitiesPage;
