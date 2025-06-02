
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MoreVertical, Trash2, UserX } from 'lucide-react';
import { useCommunityManagement } from '@/hooks/useCommunityManagement';

interface CommunityManagementActionsProps {
  communityId: string;
  userId: string;
  username: string;
  isCreator: boolean;
  canManage: boolean;
}

const CommunityManagementActions: React.FC<CommunityManagementActionsProps> = ({
  communityId,
  userId,
  username,
  isCreator,
  canManage
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  
  const { deleteCommunity, banUser, loading } = useCommunityManagement(communityId);

  const handleDeleteCommunity = async () => {
    const success = await deleteCommunity();
    if (success) {
      setShowDeleteDialog(false);
    }
  };

  const handleBanUser = async () => {
    const success = await banUser(userId, banReason.trim() || undefined);
    if (success) {
      setShowBanDialog(false);
      setBanReason('');
    }
  };

  if (!canManage) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isCreator && (
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить сообщество
            </DropdownMenuItem>
          )}
          {!isCreator && (
            <DropdownMenuItem 
              onClick={() => setShowBanDialog(true)}
              className="text-red-600 dark:text-red-400"
            >
              <UserX className="h-4 w-4 mr-2" />
              Заблокировать пользователя
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Диалог удаления сообщества */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить сообщество</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить это сообщество? Это действие нельзя отменить.
              Все посты, комментарии и участники будут удалены навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCommunity}
              disabled={loading}
            >
              {loading ? 'Удаление...' : 'Удалить сообщество'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог блокировки пользователя */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заблокировать пользователя</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите заблокировать пользователя {username}? 
              Он будет исключен из сообщества и больше не сможет присоединиться.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ban-reason">Причина блокировки (необязательно)</Label>
              <Textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Укажите причину блокировки..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBanUser}
              disabled={loading}
            >
              {loading ? 'Блокировка...' : 'Заблокировать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommunityManagementActions;
