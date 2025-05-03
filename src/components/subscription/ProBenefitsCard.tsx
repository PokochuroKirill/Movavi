
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface ProBenefitsCardProps {
  plan: {
    name: string;
    price: number;
    features: string[];
  } | null;
}

const ProBenefitsCard: React.FC<ProBenefitsCardProps> = ({ plan }) => {
  if (!plan) {
    return <div>Loading plan details...</div>;
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-devhub-purple text-white">
        <CardTitle className="text-2xl">DevHub PRO</CardTitle>
        <CardDescription className="text-white text-opacity-90">
          Расширенные возможности для разработчиков
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price} ₽</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">/ месяц</span>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Без автоматического продления</p>
          </div>
        </div>

        <div className="space-y-4">
          {plan.features?.map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">{feature}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProBenefitsCard;
