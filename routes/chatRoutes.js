const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

// ✅ Initialize OpenAI with API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;

router.post('/chat', async (req, res) => {
  const { message, thread_id: existingThreadId } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    console.log("📥 Received from frontend - thread_id:", existingThreadId);

    let thread_id = existingThreadId;

    if (!thread_id) {
      console.log("⚡ Creating new thread...");
      const thread = await openai.beta.threads.create();
      console.log("✅ New thread created:", thread.id);
      thread_id = thread.id;
    }

    if (!thread_id || !thread_id.startsWith('thread')) {
      console.error("❌ Invalid thread_id after creation:", thread_id);
      return res.status(500).json({ error: "Failed to create a valid thread ID" });
    }

    console.log("💬 Using thread_id for API calls:", thread_id);

    // Add message to thread
    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: message
    });

    // Create run
    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: ASSISTANT_ID
    });

    // Continue with your polling logic...
    // ...
    
  } catch (err) {
    console.error("❌ Chat error:", err.response?.data || err.message || err);
    res.status(500).json({ error: err.response?.data || err.message || "Unexpected server error" });
  }
});


module.exports = router;
