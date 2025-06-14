const express = require('express');
const router = express.Router();
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chat
router.post('/', async (req, res) => {
  const { message, thread_id } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    let currentThreadId = thread_id;

    // Create a thread if none provided
    if (!currentThreadId) {
      const thread = await openai.beta.threads.create();
      currentThreadId = thread.id;
      console.log(`🧵 Created new thread: ${currentThreadId}`);
    }

    // Post user message
    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: message,
    });

    // Start run with assistant
    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: "asst_ABngKEpZA76jxY4tU9Lvz8un",
    });

    res.json({
      thread_id: currentThreadId,
      run_id: run.id,
      message: "Run started — poll for results using thread_id + run_id!",
    });

  } catch (err) {
    console.error("❌ OpenAI ERROR:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Something went wrong with OpenAI" });
  }
});

module.exports = router;
