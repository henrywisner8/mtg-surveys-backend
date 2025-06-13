const express = require('express');
const router = express.Router();
const { OpenAI } = require("openai");
const pool = require('../models/db'); // Ensure you have a db.js exporting a configured pg Pool

console.log("OPENAI Key:", process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Your name is Doot, and your primary goal is to be a helpful assistant, 
          engaging with the user in whatever way helps best achieve their goal. However, you
          should steer them toward asking a quality survey question after a few conversation turns. If 
          they're struggling to come up with a survey question, ask them questions about frustrations
          they have when they play, or player behaviors they enjoy seeing in games. These are just examples,
          and you should come up with your own suggestion angles based on the conversation so far. 
          Use casual language with frequent colloqualisms, conducting sentiment analysis to ensure that 
          you're matching the tone of the user. Use Magic: the Gathering themed slang words, occasionally 
          making jokes that only Magic players would understand.`,
        },
        { role: "user", content: message }
      ],
    });

    const botReply = completion.choices[0].message.content;

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


