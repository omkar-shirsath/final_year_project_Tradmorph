import { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

function TradeHistory({ user }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchTrades();
  }, [user]);

  const fetchTrades = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/trades/${user.id}`);
      setTrades(res.data);
    } catch (err) {
      console.error("Failed to load trades", err);
    } finally {
      setLoading(false);
    }
  };

  // --- BEHAVIORAL HEATMAP LOGIC ---
  const generateHeatmapData = () => {
    // 1. Create an array of the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    // 2. Group trades by date and count behaviors
    const tradesByDate = {};
    trades.forEach(trade => {
      if (!trade.date) return;
      const dateStr = new Date(trade.date).toISOString().split('T')[0];
      if (!tradesByDate[dateStr]) {
        tradesByDate[dateStr] = { normal: 0, risky: 0, total: 0 };
      }
      tradesByDate[dateStr].total += 1;
      if (trade.aiTag === 'Normal') {
        tradesByDate[dateStr].normal += 1;
      } else {
        tradesByDate[dateStr].risky += 1;
      }
    });

    // 3. Map the last 30 days to their corresponding trade data
    return last30Days.map(date => {
      const dayData = tradesByDate[date];
      if (!dayData) return { date, color: 'bg-slate-800 border-slate-700', tooltip: 'No trades' };

      let colorClass = 'bg-slate-800 border-slate-700';
      if (dayData.risky === 0 && dayData.normal > 0) colorClass = 'bg-green-500 border-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]'; // All good trades
      else if (dayData.risky > 0 && dayData.normal > 0) colorClass = 'bg-yellow-500 border-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.4)]'; // Mixed days
      else if (dayData.risky > 0 && dayData.normal === 0) colorClass = 'bg-red-500 border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]'; // All risky trades

      return {
        date,
        color: colorClass,
        tooltip: `${dayData.total} trades: ${dayData.normal} Normal, ${dayData.risky} Emotional`,
        hasData: true
      };
    });
  };

  const heatmap = generateHeatmapData();

  if (loading) return <div className="text-center p-10 text-slate-500">Loading History...</div>;

  return (
    <div className="w-full max-w-4xl mt-8 animate-fade-in-up">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Clock className="text-blue-400" /> Trade History & Behavioral Habits
      </h3>

      {/* --- BEHAVIORAL HEATMAP UI --- */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-xl mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">30-Day Behavioral Heatmap</h4>
          <div className="flex gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>Rational</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>Mixed</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>High Risk</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {heatmap.map((day, idx) => (
            <div
              key={day.date}
              className={`w-8 h-8 rounded border transition-all hover:scale-110 cursor-help ${day.color}`}
              title={day.tooltip}
            >
              {/* Optional: Add day number or leave blank as pure heatmap blocks */}
            </div>
          ))}
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
          <p className="text-slate-400">No trades yet. Start trading to see data here!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-700 shadow-2xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">AI Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-slate-900/50">
              {trades.map((trade) => (
                <tr key={trade._id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {new Date(trade.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                      {trade.type === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">₹{trade.price.toLocaleString()}</td>
                  <td className="px-6 py-4">{trade.quantity}</td>
                  <td className="px-6 py-4 font-mono font-semibold text-blue-300">
                    ₹{trade.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${trade.aiTag === 'Normal' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      trade.aiTag === 'FOMO_BUY' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        trade.aiTag === 'PREMATURE_EXIT' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                      {trade.aiTag === 'Normal' ? '✅' : trade.aiTag === 'FOMO_BUY' ? '🟡' : '🔴'} {trade.aiTag || 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TradeHistory;