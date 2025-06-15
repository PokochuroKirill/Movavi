
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Crown, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/database";

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedVerificationType, setSelectedVerificationType] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateVerificationMutation = useMutation({
    mutationFn: async ({ userId, verificationType }: { userId: string; verificationType: number | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_type: verificationType,
          is_verified: verificationType !== null,
          verification_granted_at: verificationType !== null ? new Date().toISOString() : null,
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Статус верификации обновлен",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUserId("");
      setSelectedVerificationType("");
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус верификации",
        variant: "destructive",
      });
      console.error('Error updating verification:', error);
    },
  });

  const getVerificationBadge = (user: Profile) => {
    if (!user.is_verified) return null;
    
    switch (user.verification_type) {
      case 1:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Верифицирован</Badge>;
      case 2:
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><Crown className="w-3 h-3 mr-1" />PRO</Badge>;
      case 3:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Star className="w-3 h-3 mr-1" />Известная личность</Badge>;
      default:
        return <Badge variant="secondary">Верифицирован</Badge>;
    }
  };

  const handleUpdateVerification = () => {
    if (!selectedUserId || selectedVerificationType === "") return;
    
    const verificationType = selectedVerificationType === "none" ? null : parseInt(selectedVerificationType);
    updateVerificationMutation.mutate({ userId: selectedUserId, verificationType });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Управление пользователями
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Поиск по имени пользователя или полному имени"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите пользователя" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username || user.full_name || 'Безымянный пользователь'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedVerificationType} onValueChange={setSelectedVerificationType}>
              <SelectTrigger>
                <SelectValue placeholder="Тип верификации" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Снять верификацию</SelectItem>
                <SelectItem value="1">Обычная верификация</SelectItem>
                <SelectItem value="2">PRO верификация</SelectItem>
                <SelectItem value="3">Известная личность</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleUpdateVerification}
              disabled={!selectedUserId || selectedVerificationType === "" || updateVerificationMutation.isPending}
            >
              {updateVerificationMutation.isPending ? "Обновление..." : "Обновить"}
            </Button>
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
                  <TableHead>Email/ID</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата регистрации</TableHead>
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {user.id.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getVerificationBadge(user)}
                        {user.is_admin && (
                          <Badge variant="destructive">Админ</Badge>
                        )}
                        {user.is_pro && (
                          <Badge variant="outline">PRO</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
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

export default UserManagement;
