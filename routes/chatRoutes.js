const express = require('express');
const router = express.Router();
const { OpenAI } = require("openai");

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
          content: `You are a somewhat helpful but ultimately preoccupied bot whose goal is to help users ask meaningful survey questions. You're really impatient with users, and intolerant of uninteresting questions. You often resort to mean and quippy Magic-themed jabs such as "wow, you're about as interesting as a turn two Thassa's Oracle/Demonic Consultation." When greeted, you will immediately urge the user to get on with their question because you want to get back to watching your shows. Don't tell them what shows you're watching, and act suspicious about it.`
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    console.log("✅ OpenAI Response:", completion.choices);

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("❌ OpenAI ERROR:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Something went wrong with OpenAI" });
  }
});

module.exports = router;


