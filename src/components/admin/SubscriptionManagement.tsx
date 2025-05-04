
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
}

interface PaymentRequest {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: string;
  payment_method: string;
  receipt_url: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  profiles: Profile;
  subscription_plans: SubscriptionPlan;
}

const SubscriptionManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const fetchPaymentRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          profiles (username, full_name, avatar_url),
          subscription_plans (id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data as PaymentRequest[]);
    } catch (err) {
      console.error('Error fetching payment requests:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить запросы на подписку",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewRequest = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setIsDialogOpen(true);
  };

  const updateRequestStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    setProcessingAction(true);
    try {
      // Update payment request
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({ 
          status, 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedRequest.id);
      
      if (updateError) throw updateError;

      // If approved, also create a subscription record
      if (status === 'approved') {
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + 30); // 30 days subscription
        
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: selectedRequest.user_id,
            plan_id: selectedRequest.plan_id,
            status: 'active',
            start_date: now.toISOString(),
            end_date: endDate.toISOString(),
            payment_request_id: selectedRequest.id
          });
        
        if (subscriptionError) throw subscriptionError;
      }
      
      toast({
        title: "Успешно",
        description: `Запрос на подписку был ${status === 'approved' ? 'одобрен' : 'отклонен'}`,
      });
      
      // Refresh data
      await fetchPaymentRequests();
      setIsDialogOpen(false);
      
    } catch (err) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} request:`, err);
      toast({
        title: "Ошибка",
        description: `Не удалось ${status === 'approved' ? 'одобрить' : 'отклонить'} запрос`,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Ожидает</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Одобрена</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Отклонена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Запросы на подписку</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Нет запросов на подписку
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>План</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Метод оплаты</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.profiles?.username || "Неизвестный пользователь"}
                    </TableCell>
                    <TableCell>
                      {request.subscription_plans?.name || request.plan_id}
                    </TableCell>
                    <TableCell>{request.amount} ₽</TableCell>
                    <TableCell>
                      {request.payment_method === 'bank_card' ? 'Банковская карта' : request.payment_method}
                    </TableCell>
                    <TableCell>{format(new Date(request.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewRequest(request)}
                      >
                        Просмотреть
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Запрос на подписку
                {selectedRequest && (
                  <span className="ml-2">
                    {getStatusBadge(selectedRequest.status)}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Пользователь</h4>
                    <p>{selectedRequest.profiles?.username || selectedRequest.user_id}</p>
                    <p className="text-sm text-gray-500">{selectedRequest.profiles?.full_name || ''}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">План подписки</h4>
                    <p>{selectedRequest.subscription_plans?.name || selectedRequest.plan_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Сумма</h4>
                    <p>{selectedRequest.amount} ₽</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Способ оплаты</h4>
                    <p>{selectedRequest.payment_method === 'bank_card' ? 'Банковская карта' : selectedRequest.payment_method}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Дата запроса</h4>
                    <p>{format(new Date(selectedRequest.created_at), 'dd.MM.yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Последнее обновление</h4>
                    <p>{format(new Date(selectedRequest.updated_at), 'dd.MM.yyyy HH:mm')}</p>
                  </div>
                </div>

                {selectedRequest.receipt_url && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Квитанция</h4>
                    <div className="flex items-center">
                      <a
                        href={selectedRequest.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        Просмотреть квитанцию
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="admin-notes" className="text-sm font-medium">
                    Заметки администратора
                  </Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Добавьте комментарий..."
                    rows={3}
                    className="mt-1"
                    disabled={selectedRequest.status !== 'pending'}
                  />
                </div>

                {selectedRequest.status === 'pending' && (
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => updateRequestStatus('rejected')}
                      disabled={processingAction}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-800"
                    >
                      {processingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                      Отклонить
                    </Button>
                    <Button
                      onClick={() => updateRequestStatus('approved')}
                      disabled={processingAction}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Одобрить
                    </Button>
                  </DialogFooter>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
