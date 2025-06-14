const express = require('express');
const router = express.Router();
const { OpenAI } = require("openai");
const pool = require('../models/db'); // Assumes you have a configured pg Pool

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = "asst_ABngKEpZA76jxY4tU9Lvz8un";

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    // Create a new thread
    const thread = await openai.beta.threads.create();

    // Add the user message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Poll the run status until it's complete
    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    } while (runStatus.status !== "completed" && runStatus.status !== "failed");

    if (runStatus.status === "failed") {
      throw new Error("Assistant run failed");
    }

    // Get the messages in the thread
    const messages = await openai.beta.threads.messages.list(thread.id);
    const botReply = messages.data
      .filter(m => m.role === "assistant")
      .map(m => m.content?.[0]?.text?.value || "")
      .join("\n");

    // Save to DB
    await pool.query(
      'INSERT INTO chat_logs (user_message, bot_reply, timestamp) VALUES ($1, $2, NOW())',
      [message, botReply]
    );

    res.json({ reply: botReply });
  } catch (err) {
    console.error("❌ OpenAI ERROR:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Something went wrong with OpenAI" });
  }
});

module.exports = router;



