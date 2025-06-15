
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/database";

interface AccountNullificationProps {
  user: Profile;
  onSuccess?: () => void;
}

const AccountNullification: React.FC<AccountNullificationProps> = ({ user, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const nullifyAccountMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data, error } = await supabase.rpc('nullify_account', {
        target_user_id: userId,
        reason: reason || null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Аккаунт аннулирован",
        description: "Аккаунт пользователя был успешно аннулирован",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users-advanced'] });
      setShowDialog(false);
      setReason("");
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось аннулировать аккаунт",
        variant: "destructive",
      });
      console.error('Error nullifying account:', error);
    },
  });

  const handleConfirmNullification = () => {
    nullifyAccountMutation.mutate({
      userId: user.id,
      reason
    });
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          disabled={user.is_admin}
        >
          <UserX className="w-4 h-4 mr-1" />
          Аннулировать
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Аннулирование аккаунта
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              Внимание! Это действие необратимо.
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              После аннулирования аккаунта:
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 mt-2 list-disc list-inside space-y-1">
              <li>Имя пользователя будет заменено на "- аккаунт удален"</li>
              <li>Аватар, описание и соц. сети будут удалены</li>
              <li>Пользователь не сможет войти в систему</li>
              <li>Все данные будут безвозвратно утеряны</li>
            </ul>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Пользователь: <strong>{user.username || user.full_name || 'Без имени'}</strong>
            </p>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Причина аннулирования (обязательно)</label>
            <Textarea
              placeholder="Укажите причину аннулирования аккаунта..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmNullification}
              disabled={nullifyAccountMutation.isPending || !reason.trim()}
            >
              <UserX className="w-4 h-4 mr-1" />
              {nullifyAccountMutation.isPending ? "Аннулирование..." : "Аннулировать аккаунт"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountNullification;
