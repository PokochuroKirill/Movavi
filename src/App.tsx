
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/HomePage';
import ProjectsPage from '@/pages/ProjectsPage';
import SnippetsPage from '@/pages/SnippetsPage';
import AuthPage from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import UserProfilePage from '@/pages/UserProfilePage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import SnippetDetailPage from '@/pages/SnippetDetailPage';
import CreateProjectPage from '@/pages/CreateProjectPage';
import CreateSnippetPage from '@/pages/CreateSnippetPage';
import EditProjectPage from '@/pages/EditProjectPage';
import EditSnippetPage from '@/pages/EditSnippetPage';
import CommunitiesPage from '@/pages/CommunitiesPage';
import CreateCommunityPage from '@/pages/CreateCommunityPage';
import CommunityDetailPage from '@/pages/CommunityDetailPage';
import CommunityPostDetailPage from '@/pages/CommunityPostDetailPage';
// добавляем импорт AboutPage и AdminPage
import AboutPage from '@/pages/AboutPage';
import AdminPage from '@/pages/AdminPage';
import VerificationTermsPage from '@/pages/VerificationTerms';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/create" element={<CreateProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/projects/:id/edit" element={<EditProjectPage />} />
              <Route path="/snippets" element={<SnippetsPage />} />
              <Route path="/snippets/create" element={<CreateSnippetPage />} />
              <Route path="/snippets/:id" element={<SnippetDetailPage />} />
              <Route path="/snippets/:id/edit" element={<EditSnippetPage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/communities/create" element={<CreateCommunityPage />} />
              <Route path="/communities/:id" element={<CommunityDetailPage />} />
              <Route path="/communities/:communityId/posts/:postId" element={<CommunityPostDetailPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users/:username" element={<UserProfilePage />} />
              {/* добавляем маршрут /about и /admin */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/verification" element={<VerificationTermsPage />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
