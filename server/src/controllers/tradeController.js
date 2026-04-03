const User = require('../../models/User');
const Transaction = require('../../models/Transaction');

exports.trade = async (req, res) => {
  const { userId, stock, type, price, quantity, aiTag } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const tradePrice = Number(price);
    const tradeQty = Number(quantity);
    const totalCost = tradePrice * tradeQty;

    if (type === 'BUY') {
      if (user.virtualBalance < totalCost) return res.status(400).json({ error: "Insufficient Funds" });
      user.virtualBalance -= totalCost;
      const idx = user.portfolio.findIndex(p => p.symbol === stock);
      if (idx > -1) {
        user.portfolio[idx].avgPrice = ((user.portfolio[idx].avgPrice * user.portfolio[idx].quantity) + totalCost) / (user.portfolio[idx].quantity + tradeQty);
        user.portfolio[idx].quantity += tradeQty;
      } else {
        user.portfolio.push({ symbol: stock, quantity: tradeQty, avgPrice: tradePrice });
      }
    } else {
      const idx = user.portfolio.findIndex(p => p.symbol === stock);
      if (idx === -1 || user.portfolio[idx].quantity < tradeQty) return res.status(400).json({ error: "Insufficient Holdings" });
      user.virtualBalance += totalCost;
      user.portfolio[idx].quantity -= tradeQty;
      if (user.portfolio[idx].quantity <= 0) user.portfolio.splice(idx, 1);
    }

    await user.save();
    const newTx = new Transaction({
      userId, symbol: stock, type, quantity: tradeQty, price: tradePrice, totalAmount: totalCost, aiTag: aiTag || "Normal", date: new Date()
    });
    await newTx.save();
    res.json({ message: "Trade Executed", newBalance: user.virtualBalance, portfolio: user.portfolio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTrades = async (req, res) => {
  try {
    const trades = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleWatchlist = async (req, res) => {
  const { userId, symbol } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const index = user.watchlist.indexOf(symbol);
    index === -1 ? user.watchlist.push(symbol) : user.watchlist.splice(index, 1);
    await user.save();
    res.json({ watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
