
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

interface UserActivityProps {
  userId: string;
  isLoading: boolean;
  activityData: {
    date: string;
    snippets: number;
    projects: number;
    comments: number;
  }[];
}

const UserActivityDashboard: React.FC<UserActivityProps> = ({ userId, isLoading, activityData }) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ваша активность</CardTitle>
        <CardDescription>Статистика вашей активности за последние 30 дней</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={activityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="snippets" stroke="#8884d8" name="Сниппеты" />
              <Line type="monotone" dataKey="projects" stroke="#82ca9d" name="Проекты" />
              <Line type="monotone" dataKey="comments" stroke="#ffc658" name="Комментарии" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserActivityDashboard;
