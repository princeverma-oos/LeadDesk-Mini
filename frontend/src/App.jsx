import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import DemoBanner from './components/DemoBanner';
import { fetchStatus, verifyAdminToken } from './services/api';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isDemo, setIsDemo] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch server status on startup
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetchStatus();
        if (response.success) {
          setIsDemo(response.demoMode);
        }
      } catch (error) {
        console.error('Error checking backend status:', error);
        setIsDemo(true);
      }
    };
    checkStatus();
  }, []);

  // Automatically verify JWT on page refresh
  useEffect(() => {
    const checkUserAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await verifyAdminToken();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            // Remove corrupted token
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to verify stored token:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setCheckingAuth(false);
    };

    checkUserAuth();
  }, [currentPath]);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLoginSuccess = (token, userDetails) => {
    localStorage.setItem('token', token);
    setUser(userDetails);
    navigateTo('/admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigateTo('/');
  };

  const renderPage = () => {
    if (checkingAuth) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm text-slate-500 font-medium">Verifying Session...</span>
          </div>
        </div>
      );
    }

    if (currentPath === '/admin') {
      if (!user) {
        // Redirect unauthenticated user to login screen safely
        setTimeout(() => navigateTo('/login'), 0);
        return null;
      }
      return <AdminDashboard onNavigate={navigateTo} isDemo={isDemo} user={user} onLogout={handleLogout} />;
    }

    if (currentPath === '/login') {
      if (user) {
        // Redirect authenticated user to admin panel safely
        setTimeout(() => navigateTo('/admin'), 0);
        return null;
      }
      return <LoginPage onNavigate={navigateTo} onLoginSuccess={handleLoginSuccess} isDemo={isDemo} />;
    }

    return <LandingPage onNavigate={navigateTo} isDemo={isDemo} />;
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-100 flex flex-col bg-gradient-mesh">
      <DemoBanner isDemo={isDemo} />
      <Navbar currentPath={currentPath} onNavigate={navigateTo} user={user} onLogout={handleLogout} />
      
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
