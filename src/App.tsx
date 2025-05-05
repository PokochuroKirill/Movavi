
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';
import AuthPage from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import SnippetsPage from '@/pages/SnippetsPage';
import SnippetDetailPage from '@/pages/SnippetDetailPage';
import CreateSnippetPage from '@/pages/CreateSnippetPage';
import EditSnippetPage from '@/pages/EditSnippetPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import CreateProjectPage from '@/pages/CreateProjectPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostDetailPage from '@/pages/BlogPostDetailPage';
import ContactPage from '@/pages/ContactPage';
import AboutPage from '@/pages/AboutPage';
import DocumentationPage from '@/pages/DocumentationPage';
import FaqPage from '@/pages/FaqPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import SupportPage from '@/pages/SupportPage';
import UserProfilePage from '@/pages/UserProfilePage';
import AdminPage from '@/pages/AdminPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import CommunitiesPage from '@/pages/CommunitiesPage';
import CommunityDetailPage from '@/pages/CommunityDetailPage';
import CreateCommunityPage from '@/pages/CreateCommunityPage';
import CommunityPostDetailPage from '@/pages/CommunityPostDetailPage';
import CreateCommunityPostPage from '@/pages/CreateCommunityPostPage';
import EditCommunityPostPage from '@/pages/EditCommunityPostPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import PlaygroundPage from '@/pages/PlaygroundPage';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <Toaster />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/snippets" element={<SnippetsPage />} />
              <Route path="/snippets/:id" element={<SnippetDetailPage />} />
              <Route path="/snippets/create" element={<ProtectedRoute><CreateSnippetPage /></ProtectedRoute>} />
              <Route path="/snippets/:id/edit" element={<ProtectedRoute><EditSnippetPage /></ProtectedRoute>} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/projects/create" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/user/:username" element={<UserProfilePage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/communities/:id" element={<CommunityDetailPage />} />
              <Route path="/communities/create" element={<ProtectedRoute><CreateCommunityPage /></ProtectedRoute>} />
              <Route path="/communities/:id/post/:postId" element={<CommunityPostDetailPage />} />
              <Route path="/communities/:id/post/create" element={<ProtectedRoute><CreateCommunityPostPage /></ProtectedRoute>} />
              <Route path="/communities/:id/post/:postId/edit" element={<ProtectedRoute><EditCommunityPostPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
