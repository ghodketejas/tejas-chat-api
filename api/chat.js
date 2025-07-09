// api/chat.js
import hf from "@huggingface/inference";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const HF_API_TOKEN = process.env.HF_API_TOKEN;

  try {
    const client = hf(HF_API_TOKEN);

    const result = await client.textGeneration({
      model: "Qwen/Qwen2.5-1.5B-Instruct",
      inputs: message,
    });

    const reply = result.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message || "Hugging Face API error" });
  }
}
