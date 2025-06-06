const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'https://mtgconsensus.netlify.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

// Route imports
const surveyRoutes = require('./routes/surveyRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes'); // ✅ FIXED: no period, after app defined

// Mount routes
app.use('/api/surveys', surveyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); // ✅ Moved to the correct place

app.get('/', (req, res) => {
  res.send('MTG Surveys API is live!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
