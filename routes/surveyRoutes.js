const express = require('express');
const router = express.Router();

const surveys = []; // stores surveys while server is running

router.get('/', (req, res) => {
  res.json(surveys);
});

router.post('/', (req, res) => {
  const { question, options } = req.body;
  const newSurvey = {
    id: Date.now(),
    question,
    options,
  };
  surveys.push(newSurvey);
  res.status(201).json(newSurvey);
});

module.exports = router;

