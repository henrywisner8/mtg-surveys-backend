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

// ✅ Global error handlers (optional, good practice)
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// ✅ Routes
const surveyRoutes = require('./routes/surveyRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/surveys', surveyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// ✅ Healthcheck route (for Railway healthcheck path `/`)
app.get('/', (req, res) => {
  res.send('MTG Surveys API is live!');
});

// ✅ Start server — only bind to Railway-injected PORT
const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ No PORT provided by Railway!');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
