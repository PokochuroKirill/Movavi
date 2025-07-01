
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchCommunityById, 
  fetchCommunityMembers, 
  fetchCommunityPosts,
  isUserMember,
  joinCommunity,
  leaveCommunity
} from '@/hooks/useCommunityQueries';
import { Community, CommunityMember, CommunityPost } from '@/types/database';
import Layout from '@/components/Layout';
import CommunityDetailView from '@/components/community/CommunityDetailView';
import { Loader2 } from 'lucide-react';

const CommunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [currentUserMembership, setCurrentUserMembership] = useState<CommunityMember | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCommunityData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [communityData, membersData, postsData] = await Promise.all([
        fetchCommunityById(id),
        fetchCommunityMembers(id),
        fetchCommunityPosts(id)
      ]);

      setCommunity(communityData);
      setMembers(membersData);
      setPosts(postsData);

      if (user) {
        const membership = membersData.find(m => m.user_id === user.id);
        setCurrentUserMembership(membership || null);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, [id, user]);

  const handleJoinCommunity = async () => {
    if (!user || !id) return;
    
    const success = await joinCommunity(id, user.id);
    if (success) {
      await loadCommunityData();
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user || !id) return;
    
    const success = await leaveCommunity(id, user.id);
    if (success) {
      await loadCommunityData();
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </Layout>
    );
  }

  const canManage = user && community && user.id === community.creator_id;

  return (
    <Layout>
      <CommunityDetailView
        community={community}
        currentUserMembership={currentUserMembership}
        members={members}
        posts={posts}
        loading={loading}
        onJoinCommunity={handleJoinCommunity}
        onLeaveCommunity={handleLeaveCommunity}
        onRefresh={loadCommunityData}
        canManage={!!canManage}
        userId={user?.id}
      />
    </Layout>
  );
};

export default CommunityDetailPage;
