import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from '@/components/ui/chart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [userCounts, setUserCounts] = useState<{ date: string; count: number }[]>([]);
  const [snippetCounts, setSnippetCounts] = useState<{ date: string; count: number }[]>([]);
  const [communityCounts, setCommunityCounts] = useState<{ date: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch new user counts
        const { data: usersData, error: usersError } = await supabase
          .from('user_counts')
          .select('*')
          .order('date', { ascending: true });

        if (usersError) throw new Error(usersError.message);
        setUserCounts(usersData || []);

        // Fetch new snippet counts
        const { data: snippetsData, error: snippetsError } = await supabase
          .from('snippet_counts')
          .select('*')
          .order('date', { ascending: true });

        if (snippetsError) throw new Error(snippetsError.message);
        setSnippetCounts(snippetsData || []);
        
        // Fetch new community counts
        const { data: communitiesData, error: communitiesError } = await supabase
          .from('community_counts')
          .select('*')
          .order('date', { ascending: true });

        if (communitiesError) throw new Error(communitiesError.message);
        setCommunityCounts(communitiesData || []);

      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'Failed to fetch analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  const renderChart = (data: { date: string; count: number }[], dataKey: string, color: string, title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {data.length > 0 ? (
            `Показаны данные с ${format(new Date(data[0].date), 'dd.MM.yyyy')} по ${format(new Date(data[data.length - 1].date), 'dd.MM.yyyy')}`
          ) : (
            'Нет данных для отображения'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <Skeleton className="w-full h-64" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'dd.MM.yy')} />
              <YAxis />
              <Tooltip labelFormatter={(date) => format(new Date(date), 'dd.MM.yyyy')} />
              <Legend />
              <Line type="monotone" dataKey={dataKey} stroke={color} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-4">
            <Badge variant="secondary">Нет данных</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const renderBarChart = (data: { date: string; count: number }[], dataKey: string, color: string, title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {data.length > 0 ? (
            `Показаны данные с ${format(new Date(data[0].date), 'dd.MM.yyyy')} по ${format(new Date(data[data.length - 1].date), 'dd.MM.yyyy')}`
          ) : (
            'Нет данных для отображения'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <Skeleton className="w-full h-64" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'dd.MM.yy')} />
              <YAxis />
              <Tooltip labelFormatter={(date) => format(new Date(date), 'dd.MM.yyyy')} />
              <Legend />
              <Bar dataKey={dataKey} fill={color} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-4">
            <Badge variant="secondary">Нет данных</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const renderPieChart = (data: { name: string; value: number }[], title: string) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {data.length > 0 ? (
              `Показаны данные по соотношению`
            ) : (
              'Нет данных для отображения'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <Skeleton className="w-full h-64" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={false}
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4">
              <Badge variant="secondary">Нет данных</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Аналитика</h1>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="snippets">Сниппеты</TabsTrigger>
             <TabsTrigger value="communities">Сообщества</TabsTrigger>
            {/*<TabsTrigger value="other">Другое</TabsTrigger>*/}
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            {renderChart(userCounts, 'count', '#82ca9d', 'Количество новых пользователей')}
          </TabsContent>

          <TabsContent value="snippets" className="space-y-4">
            {renderChart(snippetCounts, 'count', '#8884d8', 'Количество новых сниппетов')}
          </TabsContent>
          
          <TabsContent value="communities" className="space-y-4">
            {renderBarChart(communityCounts, 'count', '#FFBB28', 'Количество новых сообществ')}
          </TabsContent>

          {/*<TabsContent value="other">
            <Card>
              <CardHeader>
                <CardTitle>Другая аналитика</CardTitle>
                <CardDescription>Здесь будет другая аналитика</CardDescription>
              </CardHeader>
              <CardContent>
                <p>В разработке...</p>
              </CardContent>
            </Card>
          </TabsContent>*/}
        </Tabs>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
