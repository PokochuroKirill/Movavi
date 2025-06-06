
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { Loader2, Users } from 'lucide-react';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  // Added properties to support UserProfileView
  show?: boolean;
  followers?: Profile[];
  title?: string;
}

const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  userId,
  type,
  show = false, // Added with default values
  followers: providedFollowers = [], // Added with default values
  title = '' // Added with default value
}) => {
  const [users, setUsers] = useState<Profile[]>(providedFollowers);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Support both old and new usage patterns
    if ((isOpen || show) && userId && !providedFollowers.length) {
      fetchUsers();
    } else if (providedFollowers.length) {
      setUsers(providedFollowers);
    }
  }, [isOpen, show, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query;
      
      if (type === 'followers') {
        query = supabase
          .from('user_follows')
          .select(`
            follower_id,
            profiles!user_follows_follower_id_fkey (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('following_id', userId);
      } else {
        query = supabase
          .from('user_follows')
          .select(`
            following_id,
            profiles!user_follows_following_id_fkey (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('follower_id', userId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const usersList = data?.map(item => 
        type === 'followers' ? item.profiles : item.profiles
      ).filter(Boolean) || [];
      
      setUsers(usersList as Profile[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const modalTitle = title || (type === 'followers' ? 'Подписчики' : 'Подписки');
  const isModalOpen = isOpen || show;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{modalTitle} ({users.length})</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Загрузка...</span>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <Link
                  key={user.id}
                  to={`/user/${user.username || user.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {user.full_name || user.username || 'Пользователь'}
                    </div>
                    {user.username && user.full_name && (
                      <div className="text-sm text-gray-500 truncate">
                        @{user.username}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>
                {type === 'followers' 
                  ? 'Пока нет подписчиков' 
                  : 'Пока нет подписок'
                }
              </p>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="w-full">
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
