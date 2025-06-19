const express = require('express');
const router = express.Router();

// In-memory example store (replace with DB logic)
const surveys = [];

// GET /api/surveys — list surveys
router.get('/', (req, res) => {
  res.json(surveys);
});

// POST /api/surveys — create a new survey
router.post('/', (req, res) => {
  const { question, options } = req.body;
  if (!question || !options || !Array.isArray(options)) {
    return res.status(400).json({ error: 'Invalid survey data' });
  }
  const newSurvey = {
    id: surveys.length + 1,
    question,
    options,
    voteCounts: options.reduce((acc, opt) => {
      acc[opt] = 0;
      return acc;
    }, {})
  };
  surveys.push(newSurvey);
  res.status(201).json(newSurvey);
});

// POST /api/surveys/:id/vote — vote on a survey
router.post('/:id/vote', (req, res) => {
  const survey = surveys.find(s => s.id === parseInt(req.params.id));
  if (!survey) {
    return res.status(404).json({ error: 'Survey not found' });
  }
  const { option } = req.body;
  if (!survey.options.includes(option)) {
    return res.status(400).json({ error: 'Invalid option' });
  }
  survey.voteCounts[option]++;
  res.json({ success: true, voteCounts: survey.voteCounts });
});

module.exports = router;

