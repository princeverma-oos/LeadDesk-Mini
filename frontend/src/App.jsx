import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const renderPage = () => {
    if (currentPath === '/admin') {
      return <AdminDashboard onNavigate={navigateTo} />;
    }
    return <LandingPage onNavigate={navigateTo} />;
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-100 flex flex-col bg-gradient-mesh">
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
