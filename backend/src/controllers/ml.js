const { exec } = require('child_process');
const path = require('path');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_DIR = path.join(__dirname, '../../../../ml-service');

exports.retrainModels = async (req, res) => {
  try {
    const trainScript = path.join(ML_SERVICE_DIR, 'train_models.py');
    exec(`python "${trainScript}"`, { cwd: ML_SERVICE_DIR, timeout: 120000 }, async (err, stdout, stderr) => {
      if (err) {
        console.error('Training error:', stderr);
        return res.status(500).json({ error: 'Model training failed', detail: stderr });
      }
      try {
        await axios.post(`${ML_SERVICE_URL}/reload`);
      } catch (_) {}
      res.json({ success: true, output: stdout });
    });
    res.json({ status: 'training_started', message: 'Model retraining started. This takes ~30 seconds.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start retraining' });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    const mlHealth = await axios.get(`${ML_SERVICE_URL}/`).then(r => r.data).catch(() => ({ status: 'offline' }));
    res.json({
      api:      { status: 'online' },
      ml:       mlHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
};
