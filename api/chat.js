// api/chat.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  // Example: Using Hugging Face Inference API (replace with your model if needed)
  const HF_API_TOKEN = process.env.HF_API_TOKEN;
  const HF_MODEL = 'Qwen/Qwen2.5-1.5B-Instruct'; // Updated to your chosen model

  try {
    const hfRes = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: message }),
      }
    );
    const data = await hfRes.json();
    const reply = data.generated_text || (data[0] && data[0].generated_text) || "Sorry, I couldn't understand that.";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Hugging Face API error' });
  }
};
