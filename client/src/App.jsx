import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState(token ? 'dashboard' : 'landing');
  const [isSignupView, setIsSignupView] = useState(false); // Used to toggle Login.jsx to signup mode


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentView('landing');
  };

  // --- NEW FUNCTION: Updates Balance without reloading ---
  const handleBalanceUpdate = (newBalance) => {
    if (!user) return;

    // 1. Create updated user object
    const updatedUser = { ...user, balance: newBalance };

    // 2. Update State (React)
    setUser(updatedUser);

    // 3. Update Browser Storage (So it stays correct on reload)
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  //Watchlist locally
  const handleWatchlistUpdate = (newWatchlist) => {
    if (!user) return;
    const updatedUser = { ...user, watchlist: newWatchlist };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Navigation Handler for Landing Page to Login
  const navigateToLogin = (wantsSignup) => {
    setIsSignupView(wantsSignup);
    setCurrentView('login');
  };

  if (currentView === 'landing' && !token) {
    return <LandingPage onNavigate={navigateToLogin} />;
  }

  if (currentView === 'login' || !token) {
    return <Login onLogin={handleLogin} initialIsSignup={isSignupView} onBackToHome={() => setCurrentView('landing')} />;
  }

  // Pass the new function down to Dashboard
  return (
    <Dashboard
      onLogout={handleLogout}
      user={user}
      onUpdateBalance={handleBalanceUpdate}
      onUpdateWatchlist={handleWatchlistUpdate}
    />
  );
}

export default App;