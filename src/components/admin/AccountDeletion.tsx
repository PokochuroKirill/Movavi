
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/database";

interface AccountDeletionProps {
  user: Profile;
  onSuccess: () => void;
}

const AccountDeletion: React.FC<AccountDeletionProps> = ({ user, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: userId,
        reason: reason || null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Аккаунт удален",
        description: "Аккаунт пользователя был полностью удален",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users-advanced'] });
      setShowDialog(false);
      setReason("");
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить аккаунт пользователя",
        variant: "destructive",
      });
      console.error('Error deleting user account:', error);
    },
  });

  const handleConfirmDeletion = () => {
    if (!reason.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите причину удаления аккаунта",
        variant: "destructive",
      });
      return;
    }

    deleteUserMutation.mutate({
      userId: user.id,
      reason: reason
    });
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowDialog(true)}
          disabled={user.is_admin}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Удалить аккаунт
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Удаление аккаунта
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-300">Внимание!</h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Это действие необратимо. Все данные пользователя будут полностью удалены.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Пользователь: <strong>{user.username || user.full_name}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Будут удалены: профиль, проекты, сниппеты, комментарии, лайки, подписки и все связанные данные.
            </p>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Причина удаления (обязательно)</label>
            <Textarea
              placeholder="Укажите причину удаления аккаунта..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeletion}
              disabled={deleteUserMutation.isPending || !reason.trim()}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {deleteUserMutation.isPending ? "Удаление..." : "Удалить навсегда"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDeletion;
