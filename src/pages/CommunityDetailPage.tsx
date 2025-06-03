
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityDetails, useCommunityAccess } from '@/hooks/useCommunityHelpers';
import CommunityDetailView from '@/components/community/CommunityDetailView';

const CommunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const {
    community,
    members,
    loading: communityLoading, 
    error,
    refetch
  } = useCommunityDetails(id || '');
  
  const {
    isMember,
    memberRole,
    loading: accessLoading,
    joinCommunity,
    leaveCommunity,
    refreshStatus
  } = useCommunityAccess(id || '', user?.id);

  const loading = communityLoading || accessLoading;
  
  const isCreator = user?.id === community?.creator_id;

  const handleJoin = async () => {
    const success = await joinCommunity();
    if (success) {
      await refetch();
      await refreshStatus();
    }
  };

  const handleLeave = async () => {
    if (isCreator) {
      return;
    }
    
    const success = await leaveCommunity();
    if (success) {
      await refetch();
      await refreshStatus();
    }
  };

  return (
    <Layout>
      <div className="container max-w-5xl py-24 mt-8">
        <CommunityDetailView
          community={community}
          members={members}
          isMember={isMember}
          memberRole={memberRole}
          isCreator={isCreator}
          isLoading={loading}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />
      </div>
    </Layout>
  );
};

export default CommunityDetailPage;
