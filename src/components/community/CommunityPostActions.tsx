
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2, Flag, AlertTriangle, Loader2 } from 'lucide-react';
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
import { CommunityPost } from '@/types/database';

export interface CommunityPostActionsProps {
  post: CommunityPost;
  isAuthor: boolean;
  isModerator: boolean;
  onPostDeleted?: () => void;
}

const CommunityPostActions: React.FC<CommunityPostActionsProps> = ({
  post,
  isAuthor,
  isModerator,
  onPostDeleted
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleEdit = () => {
    navigate(`/communities/${post.community_id}/post/${post.id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First delete likes
      await supabase
        .from('community_post_likes')
        .delete()
        .eq('post_id', post.id);
      
      // Then delete comments
      await supabase
        .from('community_comments')
        .delete()
        .eq('post_id', post.id);
      
      // Finally delete the post
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', post.id);
      
      if (error) throw error;
      
      toast({
        title: 'Пост удален',
        description: 'Пост был успешно удален',
      });
      
      if (onPostDeleted) {
        onPostDeleted();
      } else {
        navigate(`/communities/${post.community_id}`);
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

  const handleReport = async () => {
    setIsReporting(true);
    try {
      // Here you would implement the report logic
      // For now, let's just show a toast
      toast({
        title: 'Жалоба отправлена',
        description: 'Администраторы рассмотрят вашу жалобу',
      });
    } catch (error) {
      console.error('Error reporting post:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить жалобу',
        variant: 'destructive',
      });
    } finally {
      setIsReporting(false);
      setShowReportDialog(false);
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
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
            <Flag className="h-4 w-4 mr-2" />
            Пожаловаться
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
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

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Пожаловаться на пост</AlertDialogTitle>
            <AlertDialogDescription>
              <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              Жалоба будет отправлена модераторам сообщества для рассмотрения.
              Если пост нарушает правила сообщества, он будет удален или скрыт.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReporting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleReport();
              }}
              disabled={isReporting}
            >
              {isReporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                'Отправить жалобу'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CommunityPostActions;
