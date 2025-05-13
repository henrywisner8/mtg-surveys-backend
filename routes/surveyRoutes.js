const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // ✅ connect to Neon

// GET all surveys
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// POST a new survey
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

module.exports = router;