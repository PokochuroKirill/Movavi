import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import SnippetsPage from "./pages/SnippetsPage";
import CreateSnippetPage from "./pages/CreateSnippetPage";
import SnippetDetailPage from "./pages/SnippetDetailPage";
import EditSnippetPage from "./pages/EditSnippetPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminPage from "./pages/AdminPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityDetailPage from "./pages/CommunityDetailPage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import CreateCommunityPostPage from "./pages/CreateCommunityPostPage";
import CommunityPostDetailPage from "./pages/CommunityPostDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/user/:username" element={<UserProfilePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/create" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/snippets" element={<SnippetsPage />} />
            <Route path="/snippets/create" element={<ProtectedRoute><CreateSnippetPage /></ProtectedRoute>} />
            <Route path="/snippets/:id" element={<SnippetDetailPage />} />
            <Route path="/snippets/:id/edit" element={<ProtectedRoute><EditSnippetPage /></ProtectedRoute>} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/communities/create" element={<ProtectedRoute><CreateCommunityPage /></ProtectedRoute>} />
            <Route path="/communities/:id" element={<CommunityDetailPage />} />
            <Route path="/communities/:id/post/create" element={<ProtectedRoute><CreateCommunityPostPage /></ProtectedRoute>} />
            <Route path="/communities/:id/post/:postId" element={<CommunityPostDetailPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
