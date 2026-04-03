const User = require('../../models/User');
const { spawn } = require('child_process');
const path = require('path');

exports.checkBehavior = async (req, res) => {
  const { rsi, priceChange, quantity, userId } = req.body;

  try {
    const user = await User.findById(userId);
    const balance_ratio = quantity / (user.virtualBalance || 100000);

    // Ensure the python path points correctly two directories up
    const scriptPath = path.join(__dirname, '../../predict_behavior.py');
    const pythonProcess = spawn('python', ['-u', scriptPath]);

    let resultData = "";
    let errorData = "";

    pythonProcess.stdin.write(JSON.stringify({
      rsi: parseFloat(rsi),
      priceChange: parseFloat(priceChange),
      quantity: parseInt(quantity),
      balance_ratio: balance_ratio
    }));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error("Python Error Output:", errorData);
        return res.status(500).json({ error: "AI process failed" });
      }

      try {
        const finalResult = JSON.parse(resultData);
        console.log("AI Decision Received:", finalResult);
        res.json(finalResult);
      } catch (e) {
        res.status(500).json({ error: "Failed to parse AI response" });
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
