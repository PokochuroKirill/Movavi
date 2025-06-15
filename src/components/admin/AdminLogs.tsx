
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileText, User, Calendar } from "lucide-react";

interface AdminLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_user_id: string | null;
  details: any;
  created_at: string;
}

const AdminLogs: React.FC = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AdminLog[];
    },
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'USER_BANNED':
        return <Badge variant="destructive">Блокировка</Badge>;
      case 'USER_UNBANNED':
        return <Badge variant="secondary">Разблокировка</Badge>;
      case 'VERIFICATION_GRANTED':
        return <Badge variant="default" className="bg-blue-500">Верификация</Badge>;
      case 'MASS_NOTIFICATION_SENT':
        return <Badge variant="outline">Массовое уведомление</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const formatDetails = (details: any) => {
    if (!details || typeof details !== 'object') return null;
    
    if (details.reason) {
      return <span className="text-sm text-muted-foreground">Причина: {details.reason}</span>;
    }
    
    if (details.count) {
      return <span className="text-sm text-muted-foreground">Отправлено: {details.count}</span>;
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Журнал действий администраторов
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Загрузка...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Действие</TableHead>
                <TableHead>Администратор</TableHead>
                <TableHead>Целевой пользователь</TableHead>
                <TableHead>Детали</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {log.admin_id ? log.admin_id.substring(0, 8) + '...' : 'Система'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.target_user_id ? (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {log.target_user_id.substring(0, 8)}...
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDetails(log.details)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(log.created_at).toLocaleString('ru-RU')}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLogs;
