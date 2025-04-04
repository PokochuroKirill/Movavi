
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Profile } from '@/types/database';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Label } from "@/components/ui/label"

// Add imports for banner upload
import { supabase } from '@/integrations/supabase/client';
import { uploadProfileBanner } from '@/hooks/useProfileQueries';

const profileFormSchema = z.object({
  username: z.string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),
  full_name: z.string()
    .min(2, {
      message: "Full name must be at least 2 characters.",
    })
    .max(50, {
      message: "Full name must not be longer than 50 characters.",
    }),
  website: z.string().url("Please enter a valid URL").optional(),
  github: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  telegram: z.string().optional(),
  discord: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }).optional(),
  avatar_url: z.string().url("Please enter a valid URL").optional(),
  banner_url: z.string().url("Please enter a valid URL").optional(),
})

interface EditProfileFormProps {
  profile: Profile;
  onUpdate: (data: Partial<Profile>) => Promise<void>;
}

const EditProfileForm = ({ profile, onUpdate }: EditProfileFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Profile>>({
    username: profile.username || '',
    full_name: profile.full_name || '',
    website: profile.website || '',
    github: profile.github || '',
    twitter: profile.twitter || '',
    linkedin: profile.linkedin || '',
    telegram: profile.telegram || '',
    discord: profile.discord || '',
    location: profile.location || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    banner_url: profile.banner_url || '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setFormData({
      username: profile.username || '',
      full_name: profile.full_name || '',
      website: profile.website || '',
      github: profile.github || '',
      twitter: profile.twitter || '',
      linkedin: profile.linkedin || '',
      telegram: profile.telegram || '',
      discord: profile.discord || '',
      location: profile.location || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || '',
      banner_url: profile.banner_url || '',
    });
  }, [profile]);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile.username || '',
      full_name: profile.full_name || '',
      website: profile.website || '',
      github: profile.github || '',
      twitter: profile.twitter || '',
      linkedin: profile.linkedin || '',
      telegram: profile.telegram || '',
      discord: profile.discord || '',
      location: profile.location || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || '',
      banner_url: profile.banner_url || '',
    },
    mode: "onChange",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      await onUpdate({
        username: values.username,
        full_name: values.full_name,
        website: values.website,
        github: values.github,
        twitter: values.twitter,
        linkedin: values.linkedin,
        telegram: values.telegram,
        discord: values.discord,
        location: values.location,
        bio: values.bio,
        avatar_url: values.avatar_url,
        banner_url: formData.banner_url,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить профиль',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;

    const file = event.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла должен быть менее 2MB',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
      toast({
        title: 'Успех',
        description: 'Аватар успешно загружен',
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить аватар',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Add banner upload functionality
  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла должен быть менее 2MB',
        variant: 'destructive'
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload banner
      const bannerUrl = await uploadProfileBanner(profile.id, file);
      
      if (bannerUrl) {
        setFormData(prev => ({ ...prev, banner_url: bannerUrl }));
        toast({
          title: 'Успех',
          description: 'Баннер успешно загружен',
        });
      } else {
        throw new Error('Failed to upload banner');
      }
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить баннер',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя пользователя</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormDescription>
                  Это имя будет отображаться в вашем профиле.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Полное имя</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormDescription>
                  Укажите ваше полное имя.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Веб-сайт</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Укажите ссылку на свой веб-сайт.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Местоположение</FormLabel>
                <FormControl>
                  <Input placeholder="City, Country" {...field} />
                </FormControl>
                <FormDescription>
                  Укажите ваше местоположение.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="github"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormDescription>
                  Укажите имя пользователя GitHub.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormDescription>
                  Укажите имя пользователя Twitter.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormDescription>
                  Укажите имя пользователя LinkedIn.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram</Label>
            <div className="flex">
              <span className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
                @
              </span>
              <Input
                id="telegram"
                name="telegram"
                value={formData.telegram || ''}
                onChange={handleInputChange}
                className="rounded-l-none"
                placeholder="username"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discord">Discord</Label>
            <Input
              id="discord"
              name="discord"
              value={formData.discord || ''}
              onChange={handleInputChange}
              placeholder="username#0000"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Биография</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tell us a little bit about yourself."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Напишите немного о себе.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Аватар</Label>
          <div className="flex items-center gap-4">
            {formData.avatar_url ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <img
                  src={formData.avatar_url}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                >
                  Удалить
                </Button>
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-gray-400">Нет аватара</span>
              </div>
            )}
          </div>

          <div className="mt-2">
            <Label className="block mb-1">Загрузить аватар</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">Рекомендуемый размер: 200x200px. Макс: 2MB</p>
          </div>
        </div>

        {/* Add banner upload section after avatar upload */}
        <div className="space-y-2 mt-4">
          <Label>Баннер профиля</Label>
          <div className="flex items-center gap-4">
            {formData.banner_url ? (
              <div className="relative w-full h-32 rounded-md overflow-hidden">
                <img 
                  src={formData.banner_url} 
                  alt="Profile Banner" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                >
                  Удалить
                </Button>
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                <span className="text-gray-400">Нет баннера</span>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <Label className="block mb-1">Загрузить баннер</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">Рекомендуемый размер: 1500x500px. Макс: 2MB</p>
          </div>
        </div>

        <Button type="submit" disabled={isUploading} className="gradient-bg text-white">
          {isUploading ? (
            <>
              Загрузка...
            </>
          ) : (
            'Сохранить изменения'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EditProfileForm;
