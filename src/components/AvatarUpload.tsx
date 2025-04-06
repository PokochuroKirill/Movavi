
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  onAvatarUpdate: (url: string) => void;
  className?: string; // Add className prop
}

const AvatarUpload = ({ userId, avatarUrl, onAvatarUpdate, className }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Выберите изображение для загрузки');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      // Проверяем тип файла
      if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt?.toLowerCase() || '')) {
        throw new Error('Допустимы только изображения (jpg, jpeg, png, gif)');
      }

      // Проверяем размер файла (максимум 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Максимальный размер файла 2MB');
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Удаляем старый аватар, если он существует
      if (avatarUrl) {
        const oldFilePath = avatarUrl.split('/').pop();
        if (oldFilePath) {
          await supabase.storage.from('avatars').remove([oldFilePath]);
        }
      }

      // Получаем публичную ссылку на загруженный файл
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Обновляем профиль с новой ссылкой на аватар
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdate(data.publicUrl);
      
      toast({
        description: 'Аватар успешно обновлен',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить аватар',
        variant: 'destructive',
      });
      console.error('Ошибка при загрузке аватара:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);

      if (!avatarUrl) return;

      // Получаем имя файла из URL
      const filePath = avatarUrl.split('/').pop();
      
      if (filePath) {
        // Удаляем файл из хранилища
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove([filePath]);

        if (removeError) throw removeError;
      }

      // Обновляем профиль
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      onAvatarUpdate('');
      
      toast({
        description: 'Аватар успешно удален',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить аватар',
        variant: 'destructive',
      });
      console.error('Ошибка при удалении аватара:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className={`w-24 h-24 border-2 border-gray-200 ${className || ''}`}>
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-xl">
          {userId.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="relative"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Загрузить
            </>
          )}
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={uploadAvatar}
            disabled={uploading}
            accept="image/*"
          />
        </Button>
        
        {avatarUrl && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={uploading}
            onClick={removeAvatar}
          >
            <X className="h-4 w-4 mr-1" />
            Удалить
          </Button>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;
