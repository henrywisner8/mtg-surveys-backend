const express = require('express');
const cors = require('cors');
require('dotenv').config();

const surveyRoutes = require('./routes/surveyRoutes');

const app = express();

// ✅ Enable CORS for all origins (you can restrict this later)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ✅ Use your survey routes
app.use('/api/surveys', surveyRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// ✅ Health check route
app.get('/', (req, res) => {
  res.send('MTG Surveys API is live!');
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));