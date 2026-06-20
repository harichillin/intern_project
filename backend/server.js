/**
 * NexaCore Sentinel AI: Server Entry Point
 * Location: backend/server.js
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 NexaCore Backend running on port ${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
});
