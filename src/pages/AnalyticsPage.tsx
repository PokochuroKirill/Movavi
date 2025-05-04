
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { checkProAccess } from '@/hooks/useSubscriptionQueries';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartConfig, AxisLeft } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, ArrowUpRight, Download, TrendingUp, Users, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { ru } from 'date-fns/locale';

interface StatsData {
  name: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

// Mock data for demo purposes
const generateMockData = () => {
  // Views over time
  const viewsData: TimeSeriesData[] = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    viewsData.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 20
    });
  }

  // Traffic sources
  const trafficSources: StatsData[] = [
    { name: 'Прямые переходы', value: 45 },
    { name: 'Поиск', value: 25 },
    { name: 'Социальные сети', value: 20 },
    { name: 'Другие сайты', value: 10 }
  ];

  // Popular content
  const popularContent: StatsData[] = [
    { name: 'React компоненты', value: 124 },
    { name: 'Настройка TypeScript', value: 87 },
    { name: 'Redux: лучшие практики', value: 65 },
    { name: 'CSS Grid руководство', value: 43 },
    { name: 'Tailwind vs Bootstrap', value: 38 }
  ];

  return { viewsData, trafficSources, popularContent };
};

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isProUser, setIsProUser] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<{
    viewsData: TimeSeriesData[];
    trafficSources: StatsData[];
    popularContent: StatsData[];
  }>({ viewsData: [], trafficSources: [], popularContent: [] });
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      try {
        const hasAccess = await checkProAccess(user.id);
        
        if (!hasAccess) {
          navigate('/subscription');
          return;
        }
        
        setIsProUser(true);
        
        // Load mock data for demo
        setData(generateMockData());
      } catch (error) {
        console.error('Error checking PRO access:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [user, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-devhub-purple mb-4" />
            <p className="text-lg">Загрузка аналитики...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Аналитика профиля</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Доступно только для PRO пользователей
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              За 30 дней
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Просмотры профиля
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">852</div>
                  <div className="text-sm text-green-500 flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" /> +12% за месяц
                  </div>
                </div>
                <div className="text-primary">
                  <TrendingUp className="h-10 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Подписчики
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">124</div>
                  <div className="text-sm text-green-500 flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" /> +5% за месяц
                  </div>
                </div>
                <div className="text-primary">
                  <Users className="h-10 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Рейтинг контента
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">4.8</div>
                  <div className="text-sm text-green-500 flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" /> +0.3 за месяц
                  </div>
                </div>
                <div className="text-primary">
                  <BarChart3 className="h-10 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="traffic">Источники трафика</TabsTrigger>
            <TabsTrigger value="content">Популярный контент</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Просмотры за 30 дней</CardTitle>
                <CardDescription>
                  Динамика просмотров вашего профиля и контента
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}.${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} просмотров`, 'Просмотры']}
                      labelFormatter={(label: string) => {
                        const date = new Date(label);
                        return new Intl.DateTimeFormat('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }).format(date);
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Просмотры"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="traffic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Источники трафика</CardTitle>
                <CardDescription>
                  Откуда приходят посетители на ваш профиль
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.trafficSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Процент трафика']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Популярный контент</CardTitle>
                <CardDescription>
                  Ваш контент с наибольшим количеством просмотров
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.popularContent}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <Tooltip formatter={(value: number) => [`${value} просмотров`, 'Просмотры']} />
                    <Bar dataKey="value" name="Просмотры" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
