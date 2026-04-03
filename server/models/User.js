const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Wallet Balance
  virtualBalance: { type: Number, default: 100000 },

  // --- NEW: Portfolio Section ---
  portfolio: [
    {
      symbol:   { type: String, required: true },
      quantity: { type: Number, required: true },
      avgPrice: { type: Number, required: true } 
    }
  ],

  // Watchlist
  watchlist: [{ type: String }]
});

module.exports = mongoose.model('User', UserSchema);