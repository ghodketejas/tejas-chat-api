import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).send('OK');
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  const userMessage = req.body.message;
  console.log("➡️ User Message:", userMessage);

  const prompt = `
You are Tejas Ghodke's personal AI assistant. Respond conversationally, like Tejas would in real life — friendly, confident, and concise. Also, throw in some funny jokes according to the context.

User: ${userMessage}
TejasBot:
  `;

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        },
      }
    );

    console.log("✅ HF Response:", JSON.stringify(response.data, null, 2));

    const output = response.data[0]?.generated_text || "Model returned no text.";
    res.status(200).json({ reply: output });

  } catch (err) {
    console.error("❌ HuggingFace API Error:", err?.response?.data || err.message || err);
    res.status(500).json({ error: "HuggingFace API error." });
  }
}
