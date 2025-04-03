
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "./components/ui/toaster";
import { Loader2 } from "lucide-react";
import './App.css';

// Import pages
import Index from './pages/Index';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'));
const SnippetsPage = lazy(() => import('./pages/SnippetsPage'));
const SnippetDetailPage = lazy(() => import('./pages/SnippetDetailPage'));
const CreateSnippetPage = lazy(() => import('./pages/CreateSnippetPage'));
const EditSnippetPage = lazy(() => import('./pages/EditSnippetPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostDetailPage = lazy(() => import('./pages/BlogPostDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const DocumentationPage = lazy(() => import('./pages/DocumentationPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={
          <div className="h-screen w-screen flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-devhub-purple mb-4" />
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* User profile routes */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/user/:username" element={<UserProfilePage />} />
            
            {/* Project routes */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/create" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
            
            {/* Snippet routes */}
            <Route path="/snippets" element={<SnippetsPage />} />
            <Route path="/snippets/:id" element={<SnippetDetailPage />} />
            <Route path="/snippets/create" element={<ProtectedRoute><CreateSnippetPage /></ProtectedRoute>} />
            <Route path="/snippets/edit/:id" element={<ProtectedRoute><EditSnippetPage /></ProtectedRoute>} />
            
            {/* Blog routes */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostDetailPage />} />
            
            {/* Static pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/support" element={<SupportPage />} />
            
            {/* Admin route */}
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
