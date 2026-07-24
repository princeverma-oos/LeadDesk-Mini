import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import DemoBanner from './components/DemoBanner';
import { fetchStatus } from './services/api';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isDemo, setIsDemo] = useState(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch status on startup
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetchStatus();
        if (response.success) {
          setIsDemo(response.demoMode);
        }
      } catch (error) {
        console.error('Error checking backend status:', error);
        // Fallback to demo mode if server is down or unreachable
        setIsDemo(true);
      }
    };
    checkStatus();
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const renderPage = () => {
    if (currentPath === '/admin') {
      return <AdminDashboard onNavigate={navigateTo} isDemo={isDemo} />;
    }
    return <LandingPage onNavigate={navigateTo} isDemo={isDemo} />;
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-100 flex flex-col bg-gradient-mesh">
      <DemoBanner isDemo={isDemo} />
      <Navbar currentPath={currentPath} onNavigate={navigateTo} />
      
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
