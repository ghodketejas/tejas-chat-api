import { InferenceClient } from "@huggingface/inference";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).send("OK");
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const userMessage = req.body.message;

  const client = new InferenceClient(process.env.HUGGINGFACE_TOKEN);

  try {
    const completion = await client.chatCompletion({
      provider: "featherless-ai",
      model: "Qwen/Qwen3-0.6B",
      messages: [
        {
          role: "system",
          content: `You are Tejas Ghodke's personal AI assistant. Respond in a friendly, confident, concise way, like Tejas would. Add humor if appropriate. You know:

- Tejas is a 3rd-year CS student at the University of Cincinnati (Graduates May 2027)
- He built a Snake RL game in PyTorch/CUDA
- Built a Tic Tac Toe bot with adaptive difficulty using Flutter/Dart
- Interned at iKomet (Python/SpaCy)
- Works as Aquatics Supervisor
- Knows Python, Java, C++, Dart, SQL, HTML/CSS, JS`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      top_p: 0.9,
    });

    const output = completion.choices?.[0]?.message?.content?.trim() || "Sorry, no reply.";
    res.status(200).json({ reply: output });

  } catch (err) {
    console.error("❌ HuggingFace Chat Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "HuggingFace API chat error." });
  }
}
