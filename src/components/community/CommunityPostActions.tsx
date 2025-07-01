
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityPostActionsProps {
  postId: string;
  communityId: string;
  isAuthor: boolean;
  isModerator: boolean;
  communityCreatorId?: string;
  currentUserId?: string;
  onPostDeleted?: () => void;
}

const CommunityPostActions: React.FC<CommunityPostActionsProps> = ({
  postId,
  communityId,
  isAuthor,
  isModerator,
  communityCreatorId,
  currentUserId,
  onPostDeleted
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = (currentUserId && (isAuthor || currentUserId === communityCreatorId));

  const handleEdit = () => {
    navigate(`/communities/${communityId}/post/${postId}/edit`);
  };

  const handleDelete = async () => {
    if (!canDelete) {
      toast({
        title: "Ошибка",
        description: "Только автор или создатель сообщества может удалить пост",
        variant: "destructive"
      });
      setShowDeleteDialog(false);
      return;
    }
    setIsDeleting(true);
    try {
      await supabase
        .from('community_post_likes')
        .delete()
        .eq('post_id', postId);

      await supabase
        .from('community_comments')
        .delete()
        .eq('post_id', postId);

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Пост удален',
        description: 'Пост был успешно удален',
      });

      if (onPostDeleted) {
        onPostDeleted();
      } else {
        navigate(`/communities/${communityId}`);
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить пост',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Действия</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(isAuthor || isModerator) && (
            <>
              {isAuthor && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Пост будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CommunityPostActions;
