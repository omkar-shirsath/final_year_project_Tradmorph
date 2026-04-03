import { Star, TrendingUp, Zap } from 'lucide-react';

function Sidebar({ watchlist, onSelect }) {
  // Feature 5: Hardcoded "Random" or Trending stocks for discovery
  const marketMovers = ["RELIANCE", "INFY", "HDFCBANK", "TATAMOTORS", "ZOMATO", "PAYTM"];

  return (
    <div className="hidden lg:flex flex-col w-64 bg-slate-800/30 border-r border-slate-700 p-6 h-screen sticky top-0 overflow-y-auto">
      
      {/* --- WATCHLIST SECTION --- */}
      <div className="mb-8">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" /> Your Watchlist
        </h3>
        
        {(!watchlist || watchlist.length === 0) ? (
            <p className="text-slate-600 text-xs italic">No favorites yet. Star a stock to see it here.</p>
        ) : (
            <div className="space-y-2">
            {watchlist.map((symbol) => (
                <button
                    key={symbol}
                    onClick={() => onSelect(symbol)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 transition group"
                >
                    <span className="font-bold text-white group-hover:text-blue-400">{symbol}</span>
                </button>
            ))}
            </div>
        )}
      </div>

      {/* --- MARKET MOVERS SECTION (Feature 5) --- */}
      <div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" /> Trending Now
        </h3>
        
        <div className="space-y-2">
          {marketMovers.map((symbol) => (
            <button
                key={symbol}
                onClick={() => onSelect(symbol)}
                className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/80 border border-slate-800 hover:border-slate-600 transition"
            >
                <span className="text-sm font-medium text-slate-300">{symbol}</span>
                <TrendingUp className="w-3 h-3 text-green-500 opacity-50" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Sidebar;