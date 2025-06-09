
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
import { MoreVertical, Trash2, UserX, Settings } from 'lucide-react';
import { useCommunityManagement } from '@/hooks/useCommunityManagement';
import { Community } from '@/types/database';

interface CommunityManagementActionsProps {
  community: Community;
  onRefresh: () => Promise<void>;
}

const CommunityManagementActions: React.FC<CommunityManagementActionsProps> = ({
  community,
  onRefresh
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  
  const { deleteCommunity, banUser, loading } = useCommunityManagement(community.id);

  const handleDeleteCommunity = async () => {
    const success = await deleteCommunity();
    if (success) {
      setShowDeleteDialog(false);
      await onRefresh();
    }
  };

  const handleBanUser = async () => {
    // This would need user context to ban a specific user
    // For now, just close the dialog
    setShowBanDialog(false);
    setBanReason('');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить сообщество
          </DropdownMenuItem>
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
    </>
  );
};

export default CommunityManagementActions;
