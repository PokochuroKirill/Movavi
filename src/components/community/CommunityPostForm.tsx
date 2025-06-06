
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommunityPostFormProps {
  communityId: string;
  onPostCreated?: () => void;
}

const CommunityPostForm: React.FC<CommunityPostFormProps> = ({
  communityId,
  onPostCreated
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      toast({
        title: "Слишком много изображений",
        description: "Максимум 5 изображений на пост",
        variant: "destructive"
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "Файлы слишком большие",
        description: "Максимальный размер файла - 5MB",
        variant: "destructive"
      });
      return;
    }

    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (postId: string) => {
    const uploadedImages = [];
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${postId}-${i + 1}.${fileExt}`;
      const filePath = `community-posts/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        uploadedImages.push({
          image_url: data.publicUrl,
          display_order: i + 1
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

    return uploadedImages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для создания поста необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Заполните все поля",
        description: "Название и содержание поста обязательны",
        variant: "destructive"
      });
      return;
    }

    if (title.length > 25) {
      toast({
        title: "Слишком длинное название",
        description: "Название не должно превышать 25 символов",
        variant: "destructive"
      });
      return;
    }

    if (content.length > 2000) {
      toast({
        title: "Слишком длинное содержание",
        description: "Содержание не должно превышать 2000 символов",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Создаем пост
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .insert({
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
          community_id: communityId
        })
        .select()
        .single();

      if (postError) {
        console.error('Error creating post:', postError);
        throw postError;
      }

      console.log('Post created successfully:', postData);

      // Загружаем изображения если есть
      if (images.length > 0) {
        try {
          const uploadedImages = await uploadImages(postData.id);
          
          // Сохраняем информацию об изображениях в базе
          const { error: imagesError } = await supabase
            .from('community_post_images')
            .insert(
              uploadedImages.map(img => ({
                post_id: postData.id,
                image_url: img.image_url,
                display_order: img.display_order
              }))
            );

          if (imagesError) {
            console.error('Error saving images:', imagesError);
            // Не прерываем выполнение, так как пост уже создан
          }
        } catch (error) {
          console.error('Error with images:', error);
          // Продолжаем, так как пост создан
        }
      }

      toast({
        title: "Пост создан",
        description: "Ваш пост был успешно опубликован"
      });

      // Очищаем форму
      setTitle('');
      setContent('');
      setImages([]);
      
      if (onPostCreated) {
        onPostCreated();
      } else {
        navigate(`/communities/${communityId}`);
      }

    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать пост",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать новый пост</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название поста</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название поста (макс. 25 символов)"
              maxLength={25}
              disabled={submitting}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {title.length}/25 символов
            </div>
          </div>

          <div>
            <Label htmlFor="content">Содержание</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Напишите содержание поста (макс. 2000 символов)"
              className="min-h-[120px]"
              maxLength={2000}
              disabled={submitting}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {content.length}/2000 символов
            </div>
          </div>

          <div>
            <Label>Изображения (максимум 5)</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={submitting || images.length >= 5}
              />
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Добавить изображения ({images.length}/5)
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      disabled={submitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/communities/${communityId}`)}
              disabled={submitting}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="gradient-bg text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Публикация...
                </>
              ) : (
                'Опубликовать'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommunityPostForm;
