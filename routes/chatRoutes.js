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

    if (!thread_id || thread_id === 'undefined') {
      console.log("Creating new thread...");
      const thread = await openai.beta.threads.create();
      console.log("OpenAI thread response:", thread);

      if (!thread?.id || !thread.id.startsWith('thread')) {
        console.error("❌ Invalid thread response from OpenAI", thread);
        return res.status(500).json({ error: "Failed to create a valid thread" });
      }

      thread_id = thread.id;
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

    if (!run?.id) {
      console.error("❌ Invalid run response from OpenAI", run);
      return res.status(500).json({ error: "Failed to start a valid run" });
    }

    console.log("✅ Returning to client:", { thread_id, run_id: run.id, status: run.status });
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
  console.log("✅ /status raw request body:", req.body);

  // Use unique variable names that won't get overridden
  const clientThreadId = req.body.thread_id;
  const clientRunId = req.body.run_id;

  if (!clientThreadId || !clientRunId) {
    console.warn("⚠ Missing thread_id or run_id", { clientThreadId, clientRunId });
    return res.status(400).json({ error: "Missing thread_id or run_id" });
  }

  console.log("🟣 About to call OpenAI with:", { clientThreadId, clientRunId });

  try {
    // Safely pass clientThreadId + clientRunId to OpenAI API
    const run = await openai.beta.threads.runs.retrieve(clientThreadId, clientRunId);
    console.log("✅ OpenAI run retrieved:", run);

    if (run.status !== 'completed') {
      return res.json({ status: run.status });
    }

    const messagesRes = await openai.beta.threads.messages.list(clientThreadId);
    console.log("✅ OpenAI messages list:", messagesRes);

    const messages = messagesRes.data
      .filter(m => m.role === 'assistant')
      .map(m => m.content[0].text.value);

    console.log("✅ Parsed assistant messages:", messages);

    res.json({ status: 'completed', messages });

  } catch (err) {
    console.error("❌ OpenAI API status error:", err.response?.data || err.message || err);
    res.status(500).json({
      error: err.response?.data || err.message || "Unexpected server error"
    });
  }
});


module.exports = router;

