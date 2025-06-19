const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

// ✅ Initialize OpenAI with API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const ASSISTANT_ID = process.env.ASSISTANT_ID;

console.log(`🚀 Starting chatRoutes`);
console.log(`🔑 API Key present: ${!!process.env.OPENAI_API_KEY}`);
console.log(`🤖 Assistant ID: ${ASSISTANT_ID}`);

// ✅ POST /api/chat
router.post('/', async (req, res) => {
  const { message, thread_id: existingThreadId } = req.body;
  console.log("📥 Incoming chat POST body:", req.body);

  if (!message) {
    console.warn("⚠ No message provided");
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    let thread_id = existingThreadId;

    if (!thread_id) {
      console.log("⚡ Creating new thread...");
      const thread = await openai.beta.threads.create();
      console.log("📌 Thread creation response:", thread);
      if (!thread || !thread.id || !thread.id.startsWith('thread')) {
        console.error("❌ Invalid thread created:", thread);
        return res.status(500).json({ error: "Failed to create a valid thread ID" });
      }
      thread_id = thread.id;
    }

    console.log("💬 Adding message to thread", thread_id);
    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: message
    });

    console.log("🚀 Creating run");
    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: ASSISTANT_ID
    });
    console.log("📌 Run response:", run);

    res.json({
      status: run.status,
      thread_id,
      run_id: run.id
    });

  } catch (err) {
    console.error("❌ Chat error detail:", err.response?.data || err.message || err);
    res.status(500).json({ error: err.response?.data || err.message || "Unexpected server error" });
  }
});

// ✅ POST /api/chat/status
router.post('/status', async (req, res) => {
  const { thread_id, run_id } = req.body;
  console.log("📥 Incoming status POST body:", req.body);

  if (!thread_id || !run_id) {
    console.warn("⚠ Missing thread_id or run_id");
    return res.status(400).json({ error: "Missing thread_id or run_id" });
  }

  try {
    const run = await openai.beta.threads.runs.retrieve(thread_id, run_id);
    console.log("🔍 Run status:", run.status);

    if (run.status !== 'completed') {
      return res.json({ status: run.status });
    }

    const messagesRes = await openai.beta.threads.messages.list(thread_id);
    const messages = messagesRes.data
      .filter(m => m.role === 'assistant')
      .map(m => m.content[0].text.value);

    res.json({ status: 'completed', messages });
  } catch (err) {
    console.error("❌ Status check error:", err.response?.data || err.message || err);
    res.status(500).json({ error: err.response?.data || err.message || "Unexpected server error" });
  }
});

module.exports = router;
