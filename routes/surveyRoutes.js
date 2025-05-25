const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // ✅ connect to Neon
const jwt = require('jsonwebtoken');

// ✅ Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// ✅ GET all surveys
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, question, options FROM surveys ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// ✅ POST a new survey
router.post('/', async (req, res) => {
  const { question, options } = req.body;
  if (!question || !options) {
    return res.status(400).json({ error: 'Missing question or options' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO surveys (question, options) VALUES ($1, $2) RETURNING *',
      [question, options]
    );

    console.log('Survey saved to DB:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// ✅ Vote on a survey option (authenticated, one vote per user)
router.post('/:id/vote', authenticateToken, async (req, res) => {
  const surveyId = req.params.id;
  const userId = req.user.id;
  const { option } = req.body;

  try {
    // Check if the user has already voted
    const existing = await pool.query(
      'SELECT * FROM votes WHERE survey_id = $1 AND user_id = $2',
      [surveyId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You have already voted on this survey.' });
    }

    // Record the vote
    await pool.query(
      'INSERT INTO votes (survey_id, user_id, option) VALUES ($1, $2, $3)',
      [surveyId, userId, option]
    );

    res.status(201).json({ message: 'Vote recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

module.exports = router;
