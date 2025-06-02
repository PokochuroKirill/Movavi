
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import CommunityPostForm from '@/components/community/CommunityPostForm';

const CreateCommunityPostPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <h1 className="text-2xl font-bold mb-4">Ошибка</h1>
          <p>Сообщество не найдено</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-24 mt-8">
        <h1 className="text-3xl font-bold mb-6">Создать пост в сообществе</h1>
        <CommunityPostForm communityId={id} />
      </div>
    </Layout>
  );
};

export default CreateCommunityPostPage;
