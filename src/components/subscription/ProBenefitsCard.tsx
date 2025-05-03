
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Star } from 'lucide-react';

interface ProBenefitsCardProps {
  plan: {
    name: string;
    price: number;
    features: string[];
  } | null;
}

const ProBenefitsCard: React.FC<ProBenefitsCardProps> = ({ plan }) => {
  if (!plan) {
    return (
      <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-gray-500 dark:text-gray-400">Загрузка данных о плане...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="bg-gradient-to-r from-blue-500 to-devhub-purple p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <Star className="mr-2 h-5 w-5" />
            DevHub PRO
          </h3>
          <Badge className="bg-white/20 hover:bg-white/30">Рекомендуемый</Badge>
        </div>
        <div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{plan.price}</span>
            <span className="text-xl font-bold ml-1">₽</span>
            <span className="ml-2 text-sm opacity-80">/ месяц</span>
          </div>
          <p className="mt-2 text-sm opacity-80">Без автоматического продления</p>
        </div>
      </div>
      
      <div className="p-6">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Включено в подписку:</h4>
        <div className="space-y-3">
          {plan.features?.map((feature, index) => {
            const [title, description] = feature.includes(':') 
              ? feature.split(':') 
              : [feature, ''];
              
            return (
              <div key={index} className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{title}</p>
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProBenefitsCard;
