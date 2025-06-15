
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Ban, CheckCircle, AlertTriangle, Users2, Calendar, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/database";

const AdvancedUserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [banReason, setBanReason] = useState("");
  const [showBanDialog, setShowBanDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users-advanced', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'banned':
            query = query.eq('is_banned', true);
            break;
          case 'verified':
            query = query.eq('is_verified', true);
            break;
          case 'pro':
            query = query.eq('is_pro', true);
            break;
          case 'admin':
            query = query.eq('is_admin', true);
            break;
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Profile[];
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data, error } = await supabase.rpc('ban_user', {
        target_user_id: userId,
        reason: reason || null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Пользователь заблокирован",
        description: "Пользователь успешно заблокирован",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users-advanced'] });
      setShowBanDialog(false);
      setSelectedUser(null);
      setBanReason("");
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось заблокировать пользователя",
        variant: "destructive",
      });
      console.error('Error banning user:', error);
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('unban_user', {
        target_user_id: userId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Пользователь разблокирован",
        description: "Пользователь успешно разблокирован",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users-advanced'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось разблокировать пользователя",
        variant: "destructive",
      });
      console.error('Error unbanning user:', error);
    },
  });

  const handleBanUser = (user: Profile) => {
    setSelectedUser(user);
    setShowBanDialog(true);
  };

  const handleConfirmBan = () => {
    if (selectedUser) {
      banUserMutation.mutate({
        userId: selectedUser.id,
        reason: banReason
      });
    }
  };

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  const getUserStatusBadges = (user: Profile) => {
    const badges = [];
    
    if (user.is_banned) {
      badges.push(
        <Badge key="banned" variant="destructive" className="flex items-center gap-1">
          <Ban className="w-3 h-3" />
          Заблокирован
        </Badge>
      );
    }
    
    if (user.is_admin) {
      badges.push(
        <Badge key="admin" variant="destructive">
          Админ
        </Badge>
      );
    }
    
    if (user.is_verified) {
      badges.push(
        <Badge key="verified" variant="secondary" className="bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Верифицирован
        </Badge>
      );
    }
    
    if (user.is_pro) {
      badges.push(
        <Badge key="pro" variant="outline">
          PRO
        </Badge>
      );
    }

    return badges;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5" />
            Расширенное управление пользователями
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по имени пользователя или полному имени"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все пользователи</SelectItem>
                <SelectItem value="banned">Заблокированные</SelectItem>
                <SelectItem value="verified">Верифицированные</SelectItem>
                <SelectItem value="pro">PRO пользователи</SelectItem>
                <SelectItem value="admin">Администраторы</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Регистрация</TableHead>
                  <TableHead>Активность</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.avatar_url && (
                          <img 
                            src={user.avatar_url} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{user.username || 'Без имени'}</div>
                          <div className="text-sm text-muted-foreground">{user.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getUserStatusBadges(user)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {user.last_login && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {new Date(user.last_login).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                        {user.login_count && (
                          <div className="text-muted-foreground">
                            Входов: {user.login_count}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.is_banned ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnbanUser(user.id)}
                            disabled={unbanUserMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Разблокировать
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBanUser(user)}
                            disabled={banUserMutation.isPending || user.is_admin}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Заблокировать
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заблокировать пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Вы собираетесь заблокировать пользователя: <strong>{selectedUser?.username || selectedUser?.full_name}</strong>
              </p>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Причина блокировки (необязательно)</label>
              <Textarea
                placeholder="Укажите причину блокировки..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowBanDialog(false)}>
                Отмена
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmBan}
                disabled={banUserMutation.isPending}
              >
                <Ban className="w-4 h-4 mr-1" />
                {banUserMutation.isPending ? "Блокировка..." : "Заблокировать"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedUserManagement;
