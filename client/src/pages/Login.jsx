import { useState, useEffect } from 'react';
import { Lock, User, Mail, ArrowRight, Activity, ArrowLeft } from 'lucide-react';

export default function Login({ onLogin, initialIsSignup = false, onBackToHome }) {
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignup ? '/api/signup' : '/api/login';
    const url = `http://localhost:5000${endpoint}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      if (isSignup) {
        // If signup successful, switch to login view
        setIsSignup(false);
        setError('Account created! Please log in.');
        setFormData({ username: '', email: '', password: '' });
      } else {
        // If login successful, trigger parent function
        onLogin(data.token, data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative">
      <button
        onClick={onBackToHome}
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </button>

      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
            TradeMorph
          </h1>
          <p className="text-slate-400">
            {isSignup ? "Create your workspace" : "Welcome back, Trader"}
          </p>
        </div>

        {error && (
          <div className={`p-3 rounded mb-4 text-sm ${error.includes('created') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Username"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 px-4 text-white focus:outline-none focus:border-blue-500"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 px-4 text-white focus:outline-none focus:border-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 px-4 text-white focus:outline-none focus:border-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? <Activity className="animate-spin h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
            {isSignup ? 'Create Account' : 'Access Terminal'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-slate-400 hover:text-white text-sm underline"
          >
            {isSignup ? "Already have an account? Log In" : "New user? Create Account"}
          </button>
        </div>

      </div>
    </div>
  );
}