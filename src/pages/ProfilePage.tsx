
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProfileHeader from '@/components/ProfileHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EditProfileForm from '@/components/EditProfileForm';
import { useProfileQueries } from '@/hooks/useProfileQueries';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import UserActivityDashboard from '@/components/dashboard/UserActivityDashboard';
import CommunityEngagementWidget from '@/components/dashboard/CommunityEngagementWidget';

const ProfilePage = () => {
  const { user } = useAuth();
  const { isLoading, profile, followers, following, updateProfile } = useProfileQueries(user?.id);
  const { isLoading: isAnalyticsLoading, activityData, engagementData } = useUserAnalytics(user?.id);
  
  if (!user) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Доступ ограничен</h2>
              <p>Пожалуйста, войдите в систему для доступа к этой странице.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {!isLoading && profile && (
          <ProfileHeader
            user={profile}
            followers={followers}
            following={following}
            isOwnProfile={true}
          />
        )}
        
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="activity">Активность</TabsTrigger>
              <TabsTrigger value="edit">Редактировать профиль</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>О вас</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">
                      {profile?.bio || 'Нет информации. Добавьте описание в разделе "Редактировать профиль".'}
                    </p>
                  </CardContent>
                </Card>
                
                <CommunityEngagementWidget 
                  isLoading={isAnalyticsLoading}
                  engagementData={engagementData}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="grid grid-cols-1 gap-8">
                <UserActivityDashboard 
                  userId={user.id}
                  isLoading={isAnalyticsLoading}
                  activityData={activityData}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="edit">
              {!isLoading && profile && (
                <EditProfileForm profile={profile} onSave={updateProfile} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
