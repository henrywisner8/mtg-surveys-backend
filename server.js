const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS configuration for Netlify frontend
app.use(cors({
  origin: 'https://mtgconsensus.netlify.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Middleware
app.use(express.json());

// ✅ Global error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Don't exit immediately on Railway — just log (adjust if needed)
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  // Don't exit immediately on Railway — just log (adjust if needed)
});

// ✅ Routes
app.use('/api/surveys', require('./routes/surveyRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// ✅ Healthcheck route
app.get('/', (req, res) => {
  console.log(`✅ Healthcheck ping at ${new Date().toISOString()}`);
  res.send('MTG Surveys API is live!');
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Optional: heartbeat log — only in dev
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    console.log(`💓 Server alive at ${new Date().toISOString()}`);
  }, 30000);
}

