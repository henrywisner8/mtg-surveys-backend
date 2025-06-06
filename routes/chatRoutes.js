const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    res.json({ reply: completion.data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong with OpenAI" });
  }
});

module.exports = router;

console.log("OPENAI Key:", process.env.OPENAI_API_KEY);
