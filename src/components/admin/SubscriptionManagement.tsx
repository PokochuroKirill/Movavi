
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the payment request interface
interface PaymentRequest {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  receipt_url?: string;
  admin_notes?: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  subscription_plans?: {
    name: string;
    price: number;
    features: string[];
  };
}

const SubscriptionManagement = () => {
  const { toast } = useToast();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment requests
  const fetchPaymentRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if table exists by doing a count query
      const { count, error: countError } = await supabase
        .from('subscription_payments')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error checking subscription_payments:', countError);
        setPaymentRequests([]);
        setLoading(false);
        return;
      }

      // If table exists, fetch data with relationships
      const { data, error } = await supabase
        .from('subscription_payments')
        .select(`
          *,
          profiles:user_id(*),
          subscription_plans:plan_id(*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPaymentRequests(data as unknown as PaymentRequest[] || []);
    } catch (err: any) {
      console.error('Error fetching payment requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Process a payment request
  const processRequest = async (id: string, status: 'approved' | 'rejected') => {
    try {
      // Update payment status
      const { error: updateError } = await supabase
        .from('subscription_payments')
        .update({ status })
        .eq('id', id);
        
      if (updateError) throw updateError;
      
      // If approved, create subscription and update user's pro status
      if (status === 'approved') {
        // Get the payment request details
        const { data: paymentData } = await supabase
          .from('subscription_payments')
          .select('*')
          .eq('id', id)
          .single();
          
        if (paymentData) {
          // Create subscription for one year
          const startDate = new Date();
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
          
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: paymentData.user_id,
              plan_id: paymentData.plan_id,
              payment_id: id,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              status: 'active'
            });
            
          if (subscriptionError) throw subscriptionError;
        }
      }
      
      toast({
        title: status === 'approved' ? 'Заявка одобрена' : 'Заявка отклонена',
        description: status === 'approved' 
          ? 'Пользователь получил доступ к PRO аккаунту' 
          : 'Заявка на подписку отклонена',
      });
      
      // Refresh data
      await fetchPaymentRequests();
      
    } catch (err: any) {
      console.error('Error processing request:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать заявку. Попробуйте позже.',
        variant: 'destructive',
      });
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchPaymentRequests();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление подписками</CardTitle>
        <CardDescription>Обработка заявок на подписку PRO</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Table>
          <TableCaption>
            {loading ? 'Загрузка заявок...' : 
             paymentRequests.length === 0 ? 'Нет активных заявок на подписку' :
             `Всего заявок: ${paymentRequests.length}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Тариф</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">Загрузка...</TableCell>
              </TableRow>
            ) : paymentRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">Нет активных заявок</TableCell>
              </TableRow>
            ) : (
              paymentRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{format(new Date(request.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {request.profiles?.username || request.user_id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    {request.subscription_plans?.name || 'Стандартный PRO'}
                  </TableCell>
                  <TableCell>
                    {request.amount ? `${request.amount / 100} ₽` : 'Не указана'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => processRequest(request.id, 'approved')}
                        >
                          Одобрить
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => processRequest(request.id, 'rejected')}
                        >
                          Отклонить
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline">Ожидает</Badge>;
    case 'approved':
      return <Badge variant="default">Одобрена</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Отклонена</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default SubscriptionManagement;
