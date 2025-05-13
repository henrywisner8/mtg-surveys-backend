const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Allow only your Netlify frontend
app.use(cors({
  origin: 'https://transcendent-genie-422cbc.netlify.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const surveyRoutes = require('./routes/surveyRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/surveys', surveyRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('MTG Surveys API is live!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
