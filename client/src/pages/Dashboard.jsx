import { useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown, Activity, RefreshCw, Clock, AlertTriangle, CheckCircle, BrainCircuit, LogOut, Wallet, Star, User, X } from 'lucide-react';
import TradeHistory from '../components/TradeHistory';
import Sidebar from '../components/Sidebar';
import Portfolio from '../components/Portfolio';

function Dashboard({ onLogout, user, onUpdateBalance, onUpdateWatchlist }) {
  const [stock, setStock] = useState('TATASTEEL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- AI BEHAVIORAL STATES ---
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [analysisMetrics, setAnalysisMetrics] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [userIntent, setUserIntent] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // --- STOCK COMPARISON STATES ---
  const [compareStock, setCompareStock] = useState('');
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // 1. FETCH MARKET DATA (Primary)
  const getPrediction = async () => {
    if (!stock) return;
    setLoading(true);
    setError('');
    setData(null);
    setUserIntent(null);
    setShowConfirmation(false);
    setCompareData(null); // Reset comparison when primary changes
    setCompareStock('');

    try {
      const response = await axios.get(`http://localhost:5000/api/predict/${stock}`);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Server Error. Check Backend.");
    }
    setLoading(false);
  };

  // 1B. FETCH MARKET DATA (Comparison)
  const getComparePrediction = async () => {
    if (!compareStock || compareStock === stock) return;
    setCompareLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/predict/${compareStock}`);
      setCompareData(response.data);
    } catch (err) {
      console.error("Comparison fetch failed:", err);
    }
    setCompareLoading(false);
  };

  // 2. EXECUTE TRADE (Final Database Save)
  const executeTrade = async () => {
    if (!user?.id || !data || !userIntent) return;

    try {
      const response = await axios.post('http://localhost:5000/api/trade', {
        userId: user.id,
        stock: data.symbol,
        type: userIntent,
        price: data.current_price,
        quantity: quantity,
        aiTag: analysisMetrics ? analysisMetrics.label : "Normal" // Pass the tag derived from analysis
      });

      onUpdateBalance(response.data.newBalance);
      setShowConfirmation(true);
      setShowScoreCard(false); // Close modal
    } catch (err) {
      alert(`❌ Trade Failed: ${err.response?.data?.error || "Connection Failed"}`);
    }
  };

  // --- 3. AI BEHAVIORAL ANALYSIS (Bridge to Python via Node) ---
  const analyzeBehavior = async (intent) => {
    setUserIntent(intent);
    if (!data || !user) return;

    setAiLoading(true);
    try {
      // Calculate derived metrics for the frontend visualization
      const rsiVal = parseFloat(data.rsi) || 50;
      const priceChangeVal = parseFloat(data.change_percent) || 0;
      const balanceRatio = (quantity * data.current_price) / (user.balance || 100000) * 100;

      // Points to your Node server (Port 5000) which spawns the Python process
      const response = await axios.post('http://localhost:5000/api/check-behavior', {
        rsi: data.rsi,
        priceChange: data.change_percent,
        quantity: quantity,
        userId: user.id
      });

      setAnalysisMetrics({
        isRisky: response.data.is_risky,
        label: response.data.label,
        rsi: rsiVal,
        momentum: priceChangeVal,
        exposure: balanceRatio
      });
      setShowScoreCard(true);
    } catch (err) {
      console.warn("AI service not reachable. Proceeding with caution.", err);
      // Fallback in case AI is down
      setAnalysisMetrics({
        isRisky: false,
        label: "Normal",
        rsi: parseFloat(data.rsi) || 50,
        momentum: parseFloat(data.change_percent) || 0,
        exposure: (quantity * data.current_price) / (user.balance || 100000) * 100
      });
      setShowScoreCard(true);
    } finally {
      setAiLoading(false);
    }
  };

  // --- 3B. AI BEHAVIORAL ANALYSIS (COMPARISON) ---
  const [showCompareScoreCard, setShowCompareScoreCard] = useState(false);
  const [compareMetrics, setCompareMetrics] = useState({ primary: null, secondary: null });

  const runComparison = async () => {
    if (!data || !compareData) return;
    setAiLoading(true);

    try {
      // Run analysis for both stocks
      const [res1, res2] = await Promise.all([
        axios.post('http://localhost:5000/api/check-behavior', {
          rsi: data.rsi, priceChange: data.change_percent, quantity: 1, userId: user?.id || 'temp'
        }),
        axios.post('http://localhost:5000/api/check-behavior', {
          rsi: compareData.rsi, priceChange: compareData.change_percent, quantity: 1, userId: user?.id || 'temp'
        })
      ]);

      setCompareMetrics({
        primary: {
          symbol: data.symbol,
          isRisky: res1.data.is_risky,
          label: res1.data.label,
          rsi: parseFloat(data.rsi) || 50,
          momentum: parseFloat(data.change_percent) || 0,
        },
        secondary: {
          symbol: compareData.symbol,
          isRisky: res2.data.is_risky,
          label: res2.data.label,
          rsi: parseFloat(compareData.rsi) || 50,
          momentum: parseFloat(compareData.change_percent) || 0,
        }
      });
      setShowCompareScoreCard(true);
    } catch (err) {
      console.warn("Comparison failed", err);
      alert("Failed to run AI Comparison. Please ensure backend is running.");
    } finally {
      setAiLoading(false);
    }
  };

  const isFavorite = user?.watchlist?.includes(data?.symbol);

  const toggleWatchlist = async (stockObj) => {
    if (!user || !stockObj) return;
    try {
      const res = await axios.post('http://localhost:5000/api/watchlist/toggle', {
        userId: user.id,
        symbol: stockObj.symbol
      });
      onUpdateWatchlist(res.data.watchlist);
    } catch (err) {
      console.error("Watchlist Error:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">

      {/* --- AI SCORE CARD MODAL (SINGLE) --- */}
      {showScoreCard && analysisMetrics && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-2xl max-w-lg w-full shadow-2xl animate-fade-in-up">
            <div className="flex items-center gap-3 text-blue-400 mb-6 border-b border-slate-800 pb-4">
              <BrainCircuit className="h-8 w-8" />
              <h2 className="text-xl font-bold uppercase tracking-tight">AI Behavioral Analysis</h2>
            </div>

            {/* Scorecard Component */}
            <div className="space-y-4 mb-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700 font-mono text-sm shadow-inner">
              {/* RSI */}
              <div className="flex justify-between items-center text-slate-300">
                <span className="w-40 text-left">RSI Risk:</span>
                <span className={`w-24 text-left font-bold ${analysisMetrics.rsi > 70 ? 'text-red-400' : analysisMetrics.rsi < 30 ? 'text-green-400' : 'text-slate-200'}`}>
                  {analysisMetrics.rsi > 70 ? 'HIGH' : analysisMetrics.rsi < 30 ? 'LOW' : 'NORMAL'}
                </span>
                <div className="flex-1 max-w-[120px] bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700 ml-4 relative">
                  <div
                    className={`h-full ${analysisMetrics.rsi > 70 ? 'bg-red-500' : analysisMetrics.rsi < 30 ? 'bg-green-500' : 'bg-slate-400'}`}
                    style={{ width: `${Math.min(Math.max(analysisMetrics.rsi, 0), 100)}%` }}
                  />
                </div>
                <span className="w-16 text-right ml-2 text-slate-400">{analysisMetrics.rsi.toFixed(0)}/100</span>
              </div>

              {/* Momentum */}
              <div className="flex justify-between items-center text-slate-300">
                <span className="w-40 text-left">Price Momentum:</span>
                <span className={`w-24 text-left font-bold ${Math.abs(analysisMetrics.momentum) > 5 ? 'text-yellow-400' : 'text-slate-200'}`}>
                  {Math.abs(analysisMetrics.momentum) > 5 ? 'HIGH' : 'MEDIUM'}
                </span>
                <div className="flex-1 max-w-[120px] bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700 ml-4 relative">
                  <div
                    className={`h-full ${Math.abs(analysisMetrics.momentum) > 5 ? 'bg-yellow-500' : 'bg-blue-400'}`}
                    style={{ width: `${Math.min(Math.abs(analysisMetrics.momentum) * 10, 100)}%` }}
                  />
                </div>
                <span className="w-16 text-right ml-2 text-slate-400">{analysisMetrics.momentum > 0 ? '+' : ''}{analysisMetrics.momentum.toFixed(1)}%</span>
              </div>

              {/* Exposure */}
              <div className="flex justify-between items-center text-slate-300">
                <span className="w-40 text-left">Balance Exposure:</span>
                <span className={`w-24 text-left font-bold ${analysisMetrics.exposure > 25 ? 'text-red-400' : analysisMetrics.exposure < 10 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {analysisMetrics.exposure > 25 ? 'HIGH' : analysisMetrics.exposure < 10 ? 'LOW' : 'MEDIUM'}
                </span>
                <div className="flex-1 max-w-[120px] bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700 ml-4 relative">
                  <div
                    className={`h-full ${analysisMetrics.exposure > 25 ? 'bg-red-500' : 'bg-slate-400'}`}
                    style={{ width: `${Math.min(analysisMetrics.exposure, 100)}%` }}
                  />
                </div>
                <span className="w-16 text-right ml-2 text-slate-400">{analysisMetrics.exposure.toFixed(0)}%</span>
              </div>

              <div className="border-t border-slate-700/50 mt-4 pt-4 flex justify-between items-center">
                <span className="text-slate-400">Overall Risk:</span>
                <span className={`font-black text-lg ${analysisMetrics.isRisky ? 'text-red-500' : 'text-green-500'}`}>
                  {analysisMetrics.isRisky ? 'RISKY TRADE' : 'NORMAL TRADE'}
                </span>
              </div>
            </div>

            {analysisMetrics.isRisky && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 text-sm">
                <p className="text-red-300 font-semibold mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Tagged: {analysisMetrics.label}
                </p>
                <p className="text-slate-400 leading-relaxed ml-6">
                  Our AI detects potential emotional bias (e.g., FOMO) based on current indicators. Consider waiting.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={executeTrade}
                className={`py-3 rounded-lg font-bold transition-all shadow-lg ${analysisMetrics.isRisky
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  }`}
              >
                Confirm {userIntent}
              </button>

              <button
                onClick={() => { setShowScoreCard(false); setUserIntent(null); }}
                className={`py-3 rounded-lg font-semibold transition-all ${analysisMetrics.isRisky
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700'
                  }`}
              >
                {analysisMetrics.isRisky ? 'Cancel Trade (Recommended)' : 'Go Back'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AI COMPARISON SCORE CARD MODAL --- */}
      {showCompareScoreCard && compareMetrics.primary && compareMetrics.secondary && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-2xl max-w-4xl w-full shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3 text-blue-400">
                <BrainCircuit className="h-8 w-8" />
                <h2 className="text-2xl font-bold uppercase tracking-tight">AI Comparative Analysis</h2>
              </div>
              <button onClick={() => setShowCompareScoreCard(false)} className="text-slate-500 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Stock A */}
              <div className={`p-6 rounded-xl border-2 ${compareMetrics.primary.isRisky ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                <h3 className="text-2xl font-bold mb-4">{compareMetrics.primary.symbol}</h3>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">RSI:</span>
                    <span className={compareMetrics.primary.rsi > 70 ? 'text-red-400 font-bold' : 'text-slate-200'}>{compareMetrics.primary.rsi.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Momentum:</span>
                    <span className="text-slate-200">{compareMetrics.primary.momentum.toFixed(2)}%</span>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <span className="text-slate-400 block mb-1">AI Risk Assessment:</span>
                    <span className={`font-black uppercase text-lg ${compareMetrics.primary.isRisky ? 'text-red-400' : 'text-green-400'}`}>
                      {compareMetrics.primary.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock B */}
              <div className={`p-6 rounded-xl border-2 ${compareMetrics.secondary.isRisky ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                <h3 className="text-2xl font-bold mb-4">{compareMetrics.secondary.symbol}</h3>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">RSI:</span>
                    <span className={compareMetrics.secondary.rsi > 70 ? 'text-red-400 font-bold' : 'text-slate-200'}>{compareMetrics.secondary.rsi.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Momentum:</span>
                    <span className="text-slate-200">{compareMetrics.secondary.momentum.toFixed(2)}%</span>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <span className="text-slate-400 block mb-1">AI Risk Assessment:</span>
                    <span className={`font-black uppercase text-lg ${compareMetrics.secondary.isRisky ? 'text-red-400' : 'text-green-400'}`}>
                      {compareMetrics.secondary.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div className="mt-8 p-6 bg-slate-800 rounded-xl text-center shadow-inner">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">AI Verdict</h4>
              <p className="text-xl font-bold">
                {compareMetrics.primary.isRisky === compareMetrics.secondary.isRisky ? (
                  <span className="text-yellow-400">Both stocks carry similar behavioral risk profiles. Choose based on long-term conviction.</span>
                ) : !compareMetrics.primary.isRisky ? (
                  <span><span className="text-green-400 font-extrabold">{compareMetrics.primary.symbol}</span> is the safer behavioral play right now.</span>
                ) : (
                  <span><span className="text-green-400 font-extrabold">{compareMetrics.secondary.symbol}</span> is the safer behavioral play right now.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <Sidebar watchlist={user?.watchlist} onSelect={(symbol) => setStock(symbol)} />

      <div className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto h-screen">

        {/* --- HEADER --- */}
        <div className="w-full max-w-6xl flex justify-between items-center mb-10 px-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              TradeMorph
            </h1>
            <p className="text-slate-400 text-sm tracking-wider flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-blue-400" /> Behavioral Insight Engine
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-slate-400 text-xs uppercase tracking-widest">Virtual Balance</span>
              <div className="flex items-center gap-2 text-green-400 font-mono font-bold text-xl">
                <Wallet className="h-5 w-5" />
                ₹{user?.balance !== undefined ? user.balance.toLocaleString() : "0.00"}
              </div>
            </div>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="group flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl transition-all"
              title="View Profile & Portfolio"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline font-bold">{user?.username || 'Profile'}</span>
            </button>

            <button onClick={onLogout} className="group flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl transition-all">
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* --- MAIN SEARCH --- */}
        <div className="flex w-full max-w-md bg-slate-800 rounded-full p-2 shadow-lg mb-8 border border-slate-700">
          <input
            type="text" value={stock}
            onChange={(e) => setStock(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && getPrediction()}
            className="bg-transparent flex-1 px-4 outline-none text-white"
            placeholder="Search Symbol (e.g. RELIANCE)..."
          />
          <button onClick={getPrediction} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 transition">
            {loading ? <Activity className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
        </div>

        {/* --- COMPARISON SEARCH (Visible only if main stock is loaded) --- */}
        {data && (
          <div className="flex w-full max-w-md bg-slate-800/80 border border-slate-700 rounded-full p-1.5 shadow-md mb-8 animate-fade-in-up">
            <input
              type="text" value={compareStock}
              onChange={(e) => setCompareStock(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && getComparePrediction()}
              className="bg-transparent flex-1 px-4 outline-none text-slate-300 text-sm"
              placeholder={`Compare ${data.symbol} with...`}
            />
            <button onClick={getComparePrediction} disabled={compareLoading} className="bg-slate-700 hover:bg-slate-600 text-white rounded-full p-2 transition">
              {compareLoading ? <Activity className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4 text-slate-400" />}
            </button>
            {compareData && (
              <button
                onClick={() => { setCompareData(null); setCompareStock(''); }}
                className="ml-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full p-2 transition"
                title="Clear Comparison"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* --- COMPARISON OR SINGLE VIEW --- */}
        {data && (
          <div className="w-full max-w-6xl flex flex-col gap-6 animate-fade-in-up">

            <div className="flex flex-col xl:flex-row gap-6">
              {/* Map over available data (Single or Dual) */}
              {[data, compareData].filter(Boolean).map((stockData, idx) => (
                <div key={stockData.symbol} className="flex-1 flex flex-col gap-6">

                  {/* CHART SECTION */}
                  <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-bold tracking-tight">{stockData.symbol}</h2>
                          <button onClick={() => toggleWatchlist(stockData)} className={`p-2 rounded-full transition ${user?.watchlist?.includes(stockData.symbol) ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                            <Star className={`h-6 w-6 ${user?.watchlist?.includes(stockData.symbol) ? 'fill-yellow-400' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <h2 className="text-4xl font-mono font-semibold">₹{stockData.current_price}</h2>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold mt-2 ${stockData.signal === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {stockData.signal === 'BUY' ? 'BUY SIGNAL' : 'SELL SIGNAL'}
                        </div>
                      </div>
                    </div>

                    <div className="h-[250px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stockData.history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                          <Tooltip />
                          <Area type="monotone" dataKey="price" stroke={idx === 0 ? "#3b82f6" : "#8b5cf6"} fill={idx === 0 ? "#3b82f633" : "#8b5cf633"} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* --- TRADE ACTIONS WITH BEHAVIORAL CHECK (Only for primary stock in dual view, or both if needed) --- */}
                  {idx === 0 && !compareData && (
                    <div className="bg-slate-800/80 border border-slate-600 rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-blue-400" />
                        Behavioral Action Control
                      </h3>

                      {!showConfirmation ? (
                        <>
                          <div className="mb-6 flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700 w-fit">
                            <label className="text-slate-300 font-semibold text-sm">Quantity:</label>
                            <input
                              type="number" min="1" value={quantity}
                              onChange={(e) => setQuantity(Number(e.target.value))}
                              className="bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-1 w-24"
                            />
                          </div>

                          <div className="flex gap-4">
                            <button
                              onClick={() => analyzeBehavior('BUY')}
                              disabled={aiLoading}
                              className="flex-1 py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-500 transition disabled:opacity-50"
                            >
                              {aiLoading ? "AI analyzing bias..." : "Plan to BUY"}
                            </button>
                            <button
                              onClick={() => analyzeBehavior('SELL')}
                              disabled={aiLoading}
                              className="flex-1 py-4 rounded-xl font-bold text-lg bg-red-600 hover:bg-red-500 transition disabled:opacity-50"
                            >
                              {aiLoading ? "AI analyzing bias..." : "Plan to SELL"}
                            </button>
                          </div>

                          {userIntent && !showScoreCard && !aiLoading && (
                            <button
                              onClick={() => setShowScoreCard(true)}
                              className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-extrabold text-xl shadow-lg shadow-blue-900/20 animate-pulse"
                            >
                              VIEW SCORE CARD
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="bg-green-500/20 border border-green-500 rounded-xl p-6 text-center animate-bounce-in">
                          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                          <h3 className="text-2xl font-bold text-green-400">Trade Successful</h3>
                          <p className="text-slate-300 mt-2">Successfully processed {userIntent} for {quantity} units.</p>
                          <button onClick={() => { setUserIntent(null); setShowConfirmation(false); }} className="mt-4 text-blue-400 underline font-semibold">
                            Perform New Analysis
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* COMPARISON TRIGGER BUTTON */}
              {data && compareData && !showCompareScoreCard && (
                <div className="w-full mt-4 flex justify-center pb-8 animate-fade-in-up">
                  <button
                    onClick={runComparison}
                    disabled={aiLoading}
                    className="py-4 px-12 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-extrabold text-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] flex items-center gap-3 transition-all"
                  >
                    <BrainCircuit className="w-6 h-6" />
                    {aiLoading ? "PROCESSING BEHAVIORAL VECTORS..." : "RUN AI COMPARISON"}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Use a placeholder if there's no data so the screen isn't entirely empty initially */}
        {!data && (
          <div className="w-full max-w-lg mt-20 text-center animate-fade-in-up opacity-50">
            <BrainCircuit className="w-24 h-24 text-slate-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-500">Awaiting Input</h3>
            <p className="text-slate-500 mt-2">Search for a stock symbol to analyze real-time market behavior.</p>
          </div>
        )}

      </div>

      {/* --- PROFILE DRAWER OVERLAY --- */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col p-6 overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <User className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">{user?.username || 'Trader'}</h2>
                  <p className="text-slate-400 text-sm">Active Workspace</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Drawer Content (Portfolio & Trade History) */}
            <div className="flex-1 space-y-8">
              <Portfolio user={user} />
              <TradeHistory user={user} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;