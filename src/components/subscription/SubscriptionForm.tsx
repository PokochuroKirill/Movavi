
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface SubscriptionFormProps {
  planId: string;
  price: number;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ planId, price }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('bank_card');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    
    try {
      let receiptUrl = null;
      
      // Upload receipt if provided
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('subscriptions')
          .upload(filePath, receiptFile);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('subscriptions')
          .getPublicUrl(filePath);
          
        receiptUrl = urlData.publicUrl;
      }
      
      // Calculate end date (30 days from now)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      // Create payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          user_id: user.id,
          plan_id: planId,
          amount: price,
          payment_method: paymentMethod,
          receipt_url: receiptUrl,
          status: 'pending'
        })
        .select()
        .single();
      
      if (paymentError) throw paymentError;
      
      // Create subscription (will be activated when payment is approved)
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          payment_id: paymentData.id,
          status: 'pending',
          end_date: endDate.toISOString()
        });
      
      if (subscriptionError) throw subscriptionError;
      
      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на подписку PRO отправлен и будет обработан администратором"
      });
      
      // Reset form
      setReceiptFile(null);
      
    } catch (error: any) {
      console.error('Error submitting subscription:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить запрос на подписку",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Оформление подписки PRO</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Способ оплаты</Label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="bank_card">Банковская карта</option>
              <option value="bank_transfer">Банковский перевод</option>
              <option value="qiwi">QIWI</option>
              <option value="yoomoney">ЮMoney</option>
            </select>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Реквизиты для оплаты:</h3>
            {paymentMethod === 'bank_card' && (
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Номер карты:</span> 1234 5678 9012 3456</p>
                <p><span className="font-semibold">Получатель:</span> ООО "DevHub"</p>
                <p><span className="font-semibold">Сумма:</span> {price} ₽</p>
                <p><span className="font-semibold">Примечание:</span> PRO подписка для {user?.email}</p>
              </div>
            )}
            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">ИНН/КПП:</span> 1234567890/123456789</p>
                <p><span className="font-semibold">Р/С:</span> 12345678901234567890</p>
                <p><span className="font-semibold">Банк:</span> АО "Банк"</p>
                <p><span className="font-semibold">БИК:</span> 123456789</p>
                <p><span className="font-semibold">К/С:</span> 12345678901234567890</p>
                <p><span className="font-semibold">Сумма:</span> {price} ₽</p>
                <p><span className="font-semibold">Назначение:</span> PRO подписка для {user?.email}</p>
              </div>
            )}
            {paymentMethod === 'qiwi' && (
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Кошелек:</span> +7 (123) 456-78-90</p>
                <p><span className="font-semibold">Получатель:</span> DevHub</p>
                <p><span className="font-semibold">Сумма:</span> {price} ₽</p>
                <p><span className="font-semibold">Комментарий:</span> PRO подписка для {user?.email}</p>
              </div>
            )}
            {paymentMethod === 'yoomoney' && (
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Номер кошелька:</span> 1234567890123456</p>
                <p><span className="font-semibold">Получатель:</span> DevHub</p>
                <p><span className="font-semibold">Сумма:</span> {price} ₽</p>
                <p><span className="font-semibold">Комментарий:</span> PRO подписка для {user?.email}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="receipt">Квитанция об оплате</Label>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                id="receipt"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Загрузите скриншот или скан подтверждения платежа
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            type="submit"
            className="w-full gradient-bg text-white"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Обработка...
              </>
            ) : (
              'Отправить запрос'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SubscriptionForm;
