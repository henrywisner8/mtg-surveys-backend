const express = require('express');
const router = express.Router();

const surveys = []; // stores surveys while server is running

router.get('/', (req, res) => {
  res.json(surveys);
});

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

    console.log('Survey saved to DB:', result.rows[0]); // ✅ This is safe now

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});
