
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CircleCheck, CircleX, ExternalLink, FileText, Loader2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const SubscriptionManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    fetchSubscriptionData();
  }, []);
  
  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      // Fetch pending payments
      const { data: pendingData, error: pendingError } = await supabase
        .from('subscription_payments')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (pendingError) throw pendingError;
      setPendingPayments(pendingData || []);
      
      // Fetch active subscriptions
      const { data: activeData, error: activeError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url),
          subscription_plans(name, price),
          subscription_payments:payment_id(*)
        `)
        .eq('status', 'active')
        .order('end_date', { ascending: true });
      
      if (activeError) throw activeError;
      setActiveSubscriptions(activeData || []);
      
    } catch (error: any) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные о подписках",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprovePayment = async () => {
    setProcessing(true);
    try {
      // Get subscription related to this payment
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('payment_id', selectedPayment.id)
        .maybeSingle();
      
      if (subError) throw subError;
      
      if (!subData) {
        throw new Error('Не найдена связанная подписка');
      }
      
      // Update payment status
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .update({ 
          status: 'approved',
          admin_notes: adminNote,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPayment.id);
      
      if (paymentError) throw paymentError;
      
      // Update subscription status
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', subData.id);
      
      if (subscriptionError) throw subscriptionError;
      
      toast({
        title: "Подписка активирована",
        description: "Подписка успешно активирована для пользователя"
      });
      
      // Refresh data
      await fetchSubscriptionData();
      
    } catch (error: any) {
      console.error('Error approving payment:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось активировать подписку",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
      setApproveDialogOpen(false);
      setAdminNote('');
    }
  };
  
  const handleRejectPayment = async () => {
    setProcessing(true);
    try {
      // Get subscription related to this payment
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('payment_id', selectedPayment.id)
        .maybeSingle();
      
      if (subError) throw subError;
      
      if (!subData) {
        throw new Error('Не найдена связанная подписка');
      }
      
      // Update payment status
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .update({ 
          status: 'rejected',
          admin_notes: adminNote,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPayment.id);
      
      if (paymentError) throw paymentError;
      
      // Update subscription status
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', subData.id);
      
      if (subscriptionError) throw subscriptionError;
      
      toast({
        title: "Запрос отклонен",
        description: "Запрос на подписку был отклонен"
      });
      
      // Refresh data
      await fetchSubscriptionData();
      
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отклонить подписку",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
      setRejectDialogOpen(false);
      setAdminNote('');
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Недоступно';
    }
  };
  
  const renderPaymentMethod = (method: string) => {
    switch (method) {
      case 'bank_card': return 'Банковская карта';
      case 'bank_transfer': return 'Банковский перевод';
      case 'qiwi': return 'QIWI';
      case 'yoomoney': return 'ЮMoney';
      default: return method;
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Управление подписками</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="pending">
              Ожидающие проверки {pendingPayments.length > 0 && `(${pendingPayments.length})`}
            </TabsTrigger>
            <TabsTrigger value="active">
              Активные подписки {activeSubscriptions.length > 0 && `(${activeSubscriptions.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                На данный момент нет запросов, ожидающих проверки
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map(payment => (
                  <div key={payment.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="mr-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {payment.profiles?.avatar_url ? (
                              <img 
                                src={payment.profiles.avatar_url} 
                                alt="Avatar" 
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <span className="text-lg font-medium">
                                {payment.profiles?.username?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {payment.profiles?.full_name || payment.profiles?.username || 'Пользователь'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Запрос создан: {formatDate(payment.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPayment(payment);
                              setApproveDialogOpen(true);
                            }}
                            className="text-green-600 dark:text-green-500"
                          >
                            <CircleCheck className="h-4 w-4 mr-2" />
                            Одобрить
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPayment(payment);
                              setRejectDialogOpen(true);
                            }}
                            className="text-red-600 dark:text-red-500"
                          >
                            <CircleX className="h-4 w-4 mr-2" />
                            Отклонить
                          </DropdownMenuItem>
                          {payment.receipt_url && (
                            <DropdownMenuItem
                              onClick={() => window.open(payment.receipt_url, '_blank')}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Посмотреть квитанцию
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">ID платежа:</span>{' '}
                        {payment.id.substring(0, 8)}...
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Сумма:</span>{' '}
                        {payment.amount} ₽
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Способ оплаты:</span>{' '}
                        {renderPaymentMethod(payment.payment_method)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Статус:</span>{' '}
                        <span className="text-yellow-500">Ожидает проверки</span>
                      </div>
                    </div>
                    
                    {payment.receipt_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => window.open(payment.receipt_url, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Посмотреть квитанцию
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : activeSubscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                На данный момент нет активных подписок
              </div>
            ) : (
              <div className="space-y-4">
                {activeSubscriptions.map(subscription => (
                  <div key={subscription.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="mr-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {subscription.profiles?.avatar_url ? (
                              <img 
                                src={subscription.profiles.avatar_url} 
                                alt="Avatar" 
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <span className="text-lg font-medium">
                                {subscription.profiles?.username?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {subscription.profiles?.full_name || subscription.profiles?.username || 'Пользователь'}
                          </div>
                          <div className="text-sm text-gray-500">
                            План: {subscription.subscription_plans?.name} ({subscription.subscription_plans?.price} ₽)
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Начало подписки:</span>{' '}
                        {formatDate(subscription.start_date)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Окончание подписки:</span>{' '}
                        {formatDate(subscription.end_date)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">ID подписки:</span>{' '}
                        {subscription.id.substring(0, 8)}...
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Статус:</span>{' '}
                        <span className="text-green-500">Активна</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Одобрить подписку</DialogTitle>
            <DialogDescription>
              Вы собираетесь одобрить запрос на подписку PRO. Пользователь получит доступ к премиум функциям на 30 дней.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Заметка администратора (необязательно)
              </label>
              <Textarea
                id="notes"
                placeholder="Оставьте заметку о платеже..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline" 
              onClick={() => setApproveDialogOpen(false)}
              disabled={processing}
            >
              Отмена
            </Button>
            <Button 
              variant="default"
              onClick={handleApprovePayment}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <CircleCheck className="mr-2 h-4 w-4" />
                  Одобрить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить подписку</DialogTitle>
            <DialogDescription>
              Вы собираетесь отклонить запрос на подписку PRO. Пожалуйста, укажите причину отклонения.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Заметка администратора (причина отклонения)
              </label>
              <Textarea
                id="notes"
                placeholder="Укажите причину отклонения запроса..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline" 
              onClick={() => setRejectDialogOpen(false)}
              disabled={processing}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectPayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <CircleX className="mr-2 h-4 w-4" />
                  Отклонить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SubscriptionManagement;
