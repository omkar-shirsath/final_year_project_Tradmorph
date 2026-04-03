const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const URI = process.env.MONGO_URI || "mongodb://localhost:27017/trademorph";

mongoose.connect(URI).then(async () => {
    console.log("Connected to local DB for test");
    const user = await User.findOne();
    if (!user) {
        console.error("No user found in DB to test");
        process.exit(1);
    }

    console.log("Testing Transaction Save with user", user._id);

    try {
        const newTx = new Transaction({
            userId: user._id,
            symbol: "TEST",
            type: "BUY",
            quantity: 1,
            price: 100,
            totalAmount: 100,
            aiTag: "Normal",
            date: new Date()
        });

        await newTx.save();
        console.log("✅ test transaction saved successfully with aiTag!");
    } catch (e) {
        console.error("❌ transaction save failed");
        console.error(e);
    }
    process.exit(0);
});
