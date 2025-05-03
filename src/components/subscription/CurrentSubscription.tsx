
import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, CreditCard, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
      <div className="py-8 text-center">
        <p className="text-gray-500">Не удалось загрузить данные подписки</p>
      </div>
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
  const startDate = new Date(subscription.start_date).getTime();
  const endDate = new Date(subscription.end_date).getTime();
  const currentDate = new Date().getTime();
  
  // Calculate percentage of subscription used
  const totalDuration = endDate - startDate;
  const usedDuration = currentDate - startDate;
  const percentageUsed = Math.min(100, Math.max(0, Math.floor((usedDuration / totalDuration) * 100)));
  
  // Calculate days left
  const daysLeft = Math.max(0, Math.floor((endDate - currentDate) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-full">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-2xl font-bold">Ваша подписка активна</h3>
        <Badge variant="outline" className="mt-2 bg-gradient-to-r from-green-400 to-blue-500 text-white border-none">
          PRO статус активен
        </Badge>
      </div>
      
      <div className="space-y-4 mt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Использовано</span>
            <span>Осталось {daysLeft} дней</span>
          </div>
          <Progress value={percentageUsed} className="h-2" />
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Период подписки</p>
              <p className="font-medium">
                {formatDate(subscription.start_date)} – {formatDate(subscription.end_date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <CreditCard className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Тариф</p>
              <p className="font-medium">
                {subscription.subscription_plans?.name} ({subscription.subscription_plans?.price} ₽/месяц)
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Статус</p>
              <p className={`font-medium ${isActive ? "text-green-500" : "text-yellow-500"}`}>
                {isActive ? 'Активна' : 'В обработке'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentSubscription;
