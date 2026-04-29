import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Confessions from './pages/Confessions';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import StudySessions from './pages/StudySessions';
import './App.css';

function App() {
  const { isAuthenticated, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedChat, setSelectedChat] = useState(null);

  React.useEffect(() => {
    if (user?.role === 'admin') {
      setCurrentView('admin');
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Login />;
  }

  // If user is authenticated but hasn't completed onboarding (needs intent)
  if (user && !user.intent) {
    return <Onboarding />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'matches': return <Matches setCurrentView={setCurrentView} setSelectedChat={setSelectedChat} />;
      case 'chat': return <Chat currentMatch={selectedChat} setCurrentView={setCurrentView} />;
      case 'confessions': return <Confessions setCurrentView={setCurrentView} setSelectedChat={setSelectedChat} />;
      case 'profile': return <Profile />;
      case 'study-sessions': return <StudySessions />;
      case 'admin': return <AdminPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default App;