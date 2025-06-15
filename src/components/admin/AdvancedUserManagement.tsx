
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Users2, Calendar, Activity, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";
import AccountNullification from "./AccountNullification";

const AdvancedUserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
          case 'nullified':
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

  const getUserStatusBadges = (user: Profile) => {
    const badges = [];
    
    if (user.is_banned) {
      badges.push(
        <Badge key="nullified" variant="destructive" className="flex items-center gap-1">
          <UserX className="w-3 h-3" />
          Аннулирован
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

  const renderUserInfo = (user: Profile) => {
    if (user.is_banned) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <UserX className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <div className="font-medium text-gray-500">- аккаунт удален</div>
            <div className="text-xs text-muted-foreground">
              ID: {user.id.substring(0, 8)}...
            </div>
            {user.ban_reason && (
              <div className="text-xs text-red-600">
                Причина: {user.ban_reason}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
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
    );
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
                <SelectItem value="nullified">Аннулированные</SelectItem>
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
                      {renderUserInfo(user)}
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
                        {user.last_login && !user.is_banned && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {new Date(user.last_login).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                        {user.login_count && !user.is_banned && (
                          <div className="text-muted-foreground">
                            Входов: {user.login_count}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!user.is_banned && !user.is_admin && (
                          <AccountNullification user={user} />
                        )}
                        {user.is_banned && (
                          <span className="text-sm text-muted-foreground">
                            Аннулирован {user.banned_at && new Date(user.banned_at).toLocaleDateString('ru-RU')}
                          </span>
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
    </div>
  );
};

export default AdvancedUserManagement;
