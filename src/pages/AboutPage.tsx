
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Code, Lightbulb, Users, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">About DevHub</h1>
            <p className="text-xl max-w-2xl mx-auto mb-10">
              A community platform built by developers, for developers, to share, learn and grow together.
            </p>
            <Link to="/auth">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 text-lg py-6 px-8">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                DevHub was created to foster a vibrant community where developers can showcase their work,
                share knowledge through snippets, and connect with like-minded professionals. We believe in
                the power of open collaboration and knowledge sharing to accelerate innovation in software development.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">What Sets Us Apart</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Code className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Code Snippets</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Share useful code snippets with syntax highlighting and detailed explanations.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Lightbulb className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Project Showcase</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Display your projects with screenshots, descriptions, and links to live demos.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Developer Network</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with other developers, follow their work, and collaborate on projects.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto bg-orange-100 dark:bg-orange-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-orange-600 dark:text-orange-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Community</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Join a worldwide community of developers sharing knowledge across borders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Join Our Community?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-10">
              Create your account today to start sharing your projects, exploring code snippets,
              and connecting with developers from around the world.
            </p>
            <Link to="/auth">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 text-lg py-6 px-8">
                Start Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
