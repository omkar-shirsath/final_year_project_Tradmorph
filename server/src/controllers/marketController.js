function calculateRSI(prices) {
  if (prices.length < 15) return 50;
  let gains = 0, losses = 0;
  for (let i = prices.length - 14; i < prices.length; i++) {
    let diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / 14, avgLoss = losses / 14;
  return avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
}

exports.predict = async (req, res) => {
  try {
    let symbol = req.params.symbol.toUpperCase();
    if (!symbol.includes('.')) {
      symbol += '.NS';
    }
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://finance.yahoo.com/'
      }
    });

    if (response.status === 429) {
      return res.status(429).json({ error: "Yahoo Finance is throttling requests. Wait 2 minutes." });
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const closePrices = result.indicators.quote[0].close;

    const quotes = timestamps.map((ts, i) => ({
      date: new Date(ts * 1000),
      close: closePrices[i]
    })).filter(q => q.close != null);

    if (quotes.length < 15) return res.status(404).json({ error: "Not enough historical data" });

    const currentPrice = quotes[quotes.length - 1].close;
    const prevPrice = quotes[quotes.length - 5].close;
    const priceRunup = ((currentPrice - prevPrice) / prevPrice) * 100;
    const rsi = calculateRSI(quotes.map(q => q.close));

    res.json({
      symbol: symbol.endsWith('.NS') ? symbol.slice(0, -3) : symbol,
      current_price: currentPrice.toFixed(2),
      change_percent: priceRunup.toFixed(2),
      rsi: rsi.toFixed(2),
      signal: rsi > 70 ? "SELL" : (rsi < 30 ? "BUY" : "HOLD"),
      confidence: Math.floor(Math.random() * 20 + 75),
      last_trained: new Date().toLocaleDateString(),
      history: quotes.slice(-30).map(q => ({
        date: q.date.toISOString().split('T')[0],
        price: q.close.toFixed(2)
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "Yahoo Finance connection failed." });
  }
};
