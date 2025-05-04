
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useSubscription from '@/hooks/useSubscriptionQueries';

interface SubscriptionFormProps {
  planId: string;
  price: number;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ planId, price }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { submitSubscriptionRequest, loading } = useSubscription();
  const [paymentMethod, setPaymentMethod] = useState('bank_card');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }
    
    if (!planId) {
      toast({
        title: "Ошибка",
        description: "Информация о плане недоступна",
        variant: "destructive"
      });
      return;
    }

    const result = await submitSubscriptionRequest(
      user.id,
      planId,
      price,
      paymentMethod,
      receiptFile
    );
    
    if (result) {
      // Reset form
      setReceiptFile(null);
    }
  };

  // Renamed to paymentDetails to avoid conflict with the state variable
  const paymentDetails = {
    id: 'bank_card',
    name: 'Банковская карта',
    icon: <CreditCard className="h-4 w-4" />,
    details: {
      title: "Реквизиты для оплаты банковской картой:",
      fields: [
        { label: "Номер карты", value: "1234 5678 9012 3456" },
        { label: "Получатель", value: "ООО \"DevHub\"" },
        { label: "Сумма", value: `${price} ₽` },
        { label: "Примечание", value: `PRO подписка для ${user?.email}` }
      ]
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-2xl font-bold">{price} ₽</p>
        <p className="text-sm text-gray-500">за 30 дней подписки PRO</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Способ оплаты</Label>
          <div className="mt-3">
            <div className="flex items-center space-x-3 p-4 rounded-md border border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="mr-2">{paymentDetails.icon}</span>
                <span>{paymentDetails.name}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">{paymentDetails.details.title}</h3>
          <div className="space-y-2 text-sm">
            {paymentDetails.details.fields.map((field, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">{field.label}:</span>
                <span className="text-gray-800 dark:text-gray-200">{field.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="receipt" className="text-base font-medium">Квитанция об оплате</Label>
          <div className="mt-2">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                    {receiptFile ? receiptFile.name : "Нажмите или перетащите файл"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG или PDF до 10MB</p>
                </div>
                <Input 
                  id="receipt" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept="image/*,application/pdf" 
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-devhub-purple hover:opacity-90 transition-opacity h-12 text-base"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Обработка...
          </>
        ) : (
          'Отправить запрос'
        )}
      </Button>
    </form>
  );
};

export default SubscriptionForm;
