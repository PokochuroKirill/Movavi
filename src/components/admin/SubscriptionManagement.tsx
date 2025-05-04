
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Check, X, Loader2, FileText, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentRequest {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  payment_method: string;
  receipt_url: string | null;
  status: string;
  profiles?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  subscription_plans?: {
    name: string;
    features: string[];
    price: number;
  };
}

const SubscriptionManagement = () => {
  const { toast } = useToast();
  const [subscriptionRequests, setSubscriptionRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionRequests();
  }, [statusFilter]);

  const fetchSubscriptionRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_payments')
        .select(`
          *,
          profiles:user_id(*),
          subscription_plans:plan_id(*)
        `)
        .eq('status', statusFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptionRequests(data || []);
    } catch (error) {
      console.error('Error fetching subscription requests:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить запросы на подписку',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (
    requestId: string,
    action: 'approve' | 'reject',
    subscriptionId?: string
  ) => {
    setProcessingId(requestId);
    try {
      // Update payment status
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', requestId);

      if (paymentError) throw paymentError;

      if (action === 'approve' && subscriptionId) {
        // Activate subscription
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('payment_id', requestId);

        if (subscriptionError) throw subscriptionError;
      }

      toast({
        title: action === 'approve' ? 'Заявка одобрена' : 'Заявка отклонена',
        description: action === 'approve'
          ? 'Пользователю предоставлен доступ к PRO-функциям'
          : 'Доступ к PRO-функциям не предоставлен',
      });

      // Refresh the list
      fetchSubscriptionRequests();
    } catch (error: any) {
      console.error('Error processing subscription request:', error);
      toast({
        title: 'Ошибка',
        description: `Не удалось ${action === 'approve' ? 'одобрить' : 'отклонить'} заявку: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Ожидает проверки</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Одобрена</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Отклонена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'bank_card':
        return 'Банковская карта';
      case 'bank_transfer':
        return 'Банковский перевод';
      default:
        return method;
    }
  };

  const getRelativeTimeString = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { 
        addSuffix: true,
        locale: ru 
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Управление подписками</h2>
          <p className="text-muted-foreground">Здесь вы можете управлять запросами на PRO подписку.</p>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Ожидающие</SelectItem>
            <SelectItem value="approved">Одобренные</SelectItem>
            <SelectItem value="rejected">Отклоненные</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Заявки на подписку</CardTitle>
          <CardDescription>
            {statusFilter === 'pending' 
              ? 'Список ожидающих проверки заявок на подписку' 
              : statusFilter === 'approved' 
                ? 'Список одобренных заявок на подписку' 
                : 'Список отклоненных заявок на подписку'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subscriptionRequests.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">Нет заявок со статусом "{statusFilter === 'pending' ? 'ожидает проверки' : statusFilter === 'approved' ? 'одобрена' : 'отклонена'}"</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>План</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Способ оплаты</TableHead>
                    <TableHead>Квитанция</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Статус</TableHead>
                    {statusFilter === 'pending' && <TableHead>Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.profiles?.avatar_url || undefined} />
                            <AvatarFallback>
                              {(request.profiles?.username || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {request.profiles?.full_name || request.profiles?.username || 'Пользователь'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.profiles?.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.subscription_plans?.name || 'PRO'}
                      </TableCell>
                      <TableCell>
                        {request.amount} ₽
                      </TableCell>
                      <TableCell>
                        {formatPaymentMethod(request.payment_method)}
                      </TableCell>
                      <TableCell>
                        {request.receipt_url ? (
                          <a 
                            href={request.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Просмотр</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Нет квитанции</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span title={new Date(request.created_at).toLocaleString()}>
                          {getRelativeTimeString(request.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      {statusFilter === 'pending' && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRequestAction(request.id, 'approve')}
                              disabled={processingId === request.id}
                              className="text-green-600 hover:text-green-800 hover:bg-green-100"
                              title="Одобрить заявку"
                            >
                              {processingId === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRequestAction(request.id, 'reject')}
                              disabled={processingId === request.id}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100"
                              title="Отклонить заявку"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
