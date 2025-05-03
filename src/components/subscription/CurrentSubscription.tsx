
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';

interface CurrentSubscriptionProps {
  subscription: {
    id: string;
    status: string;
    start_date: string;
    end_date: string;
    subscription_plans: {
      name: string;
      price: number;
    };
  } | null;
}

const CurrentSubscription: React.FC<CurrentSubscriptionProps> = ({ subscription }) => {
  if (!subscription) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Активная подписка</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Не удалось загрузить данные подписки</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
    } catch (error) {
      return 'Недоступно';
    }
  };

  const isActive = subscription.status === 'active';
  const daysLeft = Math.max(0, Math.floor((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <div className="flex items-center justify-between">
          <CardTitle>Активная подписка</CardTitle>
          <Badge variant="outline" className="bg-white text-blue-600 border-none">
            PRO
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-medium">Ваша подписка активна</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Осталось дней: {daysLeft}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Статус:</span>
              <span className={isActive ? "text-green-500" : "text-yellow-500"}>
                {isActive ? 'Активна' : 'В обработке'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Дата начала:</span>
              <span>{formatDate(subscription.start_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Дата окончания:</span>
              <span>{formatDate(subscription.end_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Тариф:</span>
              <span>DevHub PRO ({subscription.subscription_plans?.price} ₽/месяц)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentSubscription;
