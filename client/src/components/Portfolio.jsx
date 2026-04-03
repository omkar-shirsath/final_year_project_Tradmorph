import React from 'react';
import { Briefcase, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Portfolio = ({ user }) => {
  if (!user || !user.portfolio || user.portfolio.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center mb-6">
        <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-400">Portfolio Empty</h3>
        <p className="text-slate-500 text-sm">You haven't bought any stocks yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-6 h-6 text-blue-400" />
        <h3 className="text-2xl font-bold">Your Holdings</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-sm border-b border-slate-700">
              <th className="p-3">Symbol</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Avg. Buy Price</th>
              <th className="p-3">Total Invested</th>
            </tr>
          </thead>
          <tbody>
            {user.portfolio.map((stock, index) => (
              <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <td className="p-4 font-bold text-white">{stock.symbol}</td>
                <td className="p-4 text-slate-300">{stock.quantity}</td>
                <td className="p-4 font-mono text-blue-300">₹{stock.avgPrice.toFixed(2)}</td>
                <td className="p-4 font-mono text-green-400 font-bold">
                  ₹{(stock.avgPrice * stock.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;