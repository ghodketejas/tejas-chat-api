import { InferenceClient } from "@huggingface/inference";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).send("OK");
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const userMessage = req.body.message;
  console.log("User message:", userMessage);

  const client = new InferenceClient(process.env.HUGGINGFACE_TOKEN);

  try {
    const response = await client.chatCompletion({
      model: "Qwen/Qwen3-0.6B",
      messages: [
        {
          role: "system",
          content: `You are Tejas Ghodke's personal AI assistant. Respond conversationally, like Tejas would in real life — smart, friendly, confident, and concise. Also, throw in some funny jokes when appropriate.

Here’s what you know:
- Tejas is a Computer Science student at University of Cincinnati (Graduates May 2027). He is currently in his 3rd year.
- He built a Snake game using Reinforcement Learning with PyTorch + CUDA
- He built a Tic-Tac-Toe AI game in Flutter/Dart with adaptive difficulty
- He interned at iKomet (Python/SpaCy) and works as an Aquatics Supervisor part-time
- He knows Python, Java, C++, Dart, SQL, HTML/CSS, JS, and more`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = response.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't answer that.";
    res.status(200).json({ reply });

  } catch (err) {
    console.error("❌ HuggingFace API Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "HuggingFace API error." });
  }
}
