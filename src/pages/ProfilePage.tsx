
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import UserProfileView from '@/components/UserProfileView';
import EditProfileForm from '@/components/EditProfileForm';
import { useProfileQueries } from '@/hooks/useProfileQueries';
import { Profile } from '@/types/database';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    data: profile, 
    isLoading, 
    error, 
    refetch 
  } = useProfileQueries.useProfile(user?.id);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleProfileUpdate = async (data?: Partial<Profile>) => {
    try {
      if (data && user) {
        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Профиль обновлен",
          description: "Ваш профиль был успешно обновлен"
        });
        
        await refetch();
      }
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить профиль",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Ошибка загрузки профиля</h1>
            <p className="text-gray-600 mt-2">Попробуйте обновить страницу</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-24 mt-8">
        {isEditing ? (
          <EditProfileForm 
            profile={profile}
            onUpdate={handleProfileUpdate}
            onCancel={handleCancel}
          />
        ) : (
          <UserProfileView 
            profile={profile}
            isOwnProfile={true}
            onEdit={handleEdit}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
