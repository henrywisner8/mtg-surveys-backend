const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;

router.post('/', async (req, res) => {
  const { message, thread_id: existingThreadId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    let thread_id = existingThreadId;
    console.log("Incoming thread_id:", thread_id);

    // If thread_id is missing, null, empty, or explicitly "undefined"
    if (!thread_id || thread_id === 'undefined') {
      console.log("Creating new thread...");
      try {
        const thread = await openai.beta.threads.create();
        console.log("Thread create response:", thread);

        if (!thread || !thread.id || !thread.id.startsWith('thread')) {
          console.error("❌ Invalid thread response:", thread);
          return res.status(500).json({ error: "Failed to create a valid thread" });
        }

        thread_id = thread.id;
      } catch (err) {
        console.error("❌ Error creating thread:", err.response?.data || err.message || err);
        return res.status(500).json({ error: "OpenAI thread creation failed" });
      }
    }

    console.log(`Creating message in thread ${thread_id}...`);
    const messageRes = await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: message
    });
    console.log("Message created:", messageRes);

    console.log(`Starting run for thread ${thread_id}...`);
    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: ASSISTANT_ID
    });
    console.log("Run started:", run);

    res.json({
      status: run.status,
      thread_id,
      run_id: run.id
    });

  } catch (err) {
    console.error("❌ Chat error:", err.response?.data || err.message || err);
    res.status(500).json({
      error: err.response?.data || err.message || "Unexpected server error"
    });
  }
});


router.post('/status', async (req, res) => {
  const { thread_id, run_id } = req.body;

  if (!thread_id || !run_id) {
    return res.status(400).json({ error: "Missing thread_id or run_id" });
  }

  try {
    console.log(`Checking status for run ${run_id} in thread ${thread_id}...`);
    const run = await openai.beta.threads.runs.retrieve(thread_id, run_id);
    console.log("Run status retrieved:", run.status);

    if (run.status !== 'completed') {
      return res.json({ status: run.status });
    }

    console.log(`Fetching messages for thread ${thread_id}...`);
    const messagesRes = await openai.beta.threads.messages.list(thread_id);
    const messages = messagesRes.data
      .filter(m => m.role === 'assistant')
      .map(m => m.content[0].text.value);

    res.json({ status: 'completed', messages });

  } catch (err) {
    console.error("❌ Status check error:", err.response?.data || err.message || err);
    res.status(500).json({
      error: err.response?.data || err.message || "Unexpected server error"
    });
  }
});

module.exports = router;

