const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    // Create a new thread
    const thread = await openai.beta.threads.create();

    // Add user message to thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_ABngKEpZA76jxY4tU9Lvz8un",  // Your assistant ID
    });

    // Poll for completion
    let completedRun;
    while (true) {
      completedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (completedRun.status === 'completed') break;
      if (completedRun.status === 'failed') throw new Error("Assistant run failed");
      await new Promise(resolve => setTimeout(resolve, 1000));  // Wait 1 sec
    }

    // Get the messages
    const messages = await openai.beta.threads.messages.list(thread.id);

    const reply = messages.data
      .filter(m => m.role === 'assistant')
      .map(m => m.content[0].text.value)
      .join("\n");

    res.json({ reply: reply || "No reply generated." });
  } catch (err) {
    console.error("❌ OpenAI ERROR:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Something went wrong with the assistant" });
  }
});

module.exports = router;



