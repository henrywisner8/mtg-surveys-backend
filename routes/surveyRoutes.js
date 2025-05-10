const express = require('express');
const router = express.Router();

// GET all surveys
router.get('/', (req, res) => {
  res.json([
    { id: 1, question: 'Is Sol Ring broken in Commander?', options: ['Yes', 'No'] },
  ]);
});

// POST a new survey
router.post('/', (req, res) => {
  const { question, options } = req.body;
  const newSurvey = { id: Date.now(), question, options };
  res.status(201).json(newSurvey);
});

module.exports = router;
