import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/');
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


  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
      <Route path="/signup" element={token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
      <Route path="/dashboard" element={
        token ? (
          <Dashboard
            onLogout={handleLogout}
            user={user}
            onUpdateBalance={handleBalanceUpdate}
            onUpdateWatchlist={handleWatchlistUpdate}
          />
        ) : (
          <Navigate to="/login" />
        )
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;