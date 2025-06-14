const express = require('express');
const router = express.Router();
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = "asst_ABngKEpZA76jxY4tU9Lvz8un"; // Your assistant ID

// Start a chat: create thread + run
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add user message to thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // Create a run
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    res.json({ thread_id: thread.id, run_id: run.id, status: run.status });
  } catch (err) {
    console.error("❌ OpenAI ERROR:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Something went wrong with OpenAI" });
  }
});

// Check run status + get messages if complete
router.post('/status', async (req, res) => {
  const { thread_id, run_id } = req.body;
  if (!thread_id || !run_id) {
    return res.status(400).json({ error: "thread_id and run_id required" });
  }

  try {
    const run = await openai.beta.threads.runs.retrieve(thread_id, run_id);

    if (run.status === 'completed') {
      const messagesRes = await openai.beta.threads.messages.list(thread_id);
      const messages = messagesRes.data
        .filter(m => m.role === 'assistant')
        .map(m => m.content[0].text.value);

      return res.json({ status: 'completed', messages });
    }

    return res.json({ status: run.status });
  } catch (err) {
    console.error("❌ Status check error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Error checking run status" });
  }
});

module.exports = router;
