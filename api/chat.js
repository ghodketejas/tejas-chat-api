import { HfInference } from '@huggingface/inference';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // Optional: Cache preflight

  if (req.method === 'OPTIONS') return res.status(200).send('OK');
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  const userMessage = req.body.message;
  const client = new HfInference(process.env.HUGGINGFACE_TOKEN);

  const prompt = `You are Tejas Ghodke's personal AI assistant. Respond conversationally, like Tejas would in real life — smart, friendly, confident, and concise. Also, throw in some funny jokes when appropriate.

Here’s what you know:
- Tejas is a Computer Science student at University of Cincinnati (Graduates May 2027). He is currently in his 3rd year.
- He built a Snake game using Reinforcement Learning with PyTorch + CUDA
- He built a Tic-Tac-Toe AI game in Flutter/Dart with adaptive difficulty
- He interned at iKomet (Python/SpaCy) and works as an Aquatics Supervisor part-time
- He knows Python, Java, C++, Dart, SQL, HTML/CSS, JS, and more

User: ${userMessage}
TejasBot:`;

  try {
    const result = await client.textGeneration({
      model: 'Qwen/Qwen3-0.6B',
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
      }
    });

    const reply = result.generated_text?.replace(prompt, '').trim() || "Sorry, no reply.";
    res.status(200).json({ reply });

  } catch (err) {
    console.error("❌ HuggingFace API Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "HuggingFace API error." });
  }
}
