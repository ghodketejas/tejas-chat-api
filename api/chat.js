import axios from "axios";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).send("OK");
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/v1/chat/completions",
      {
        model: "Qwen/Qwen3-0.6B",
        messages: [
          {
            role: "system",
            content: `You are Tejas Ghodke's personal AI assistant. Be friendly, confident, and concise. Throw in a little humor if the context allows. You know:
- Tejas is a 3rd-year CS student at University of Cincinnati (Graduates May 2027)
- He built a Snake RL game in PyTorch + CUDA
- He built a Tic-Tac-Toe bot in Flutter/Dart with adaptive difficulty
- He interned at iKomet (Python/SpaCy)
- He works part-time as an Aquatics Supervisor
- He knows Python, Java, C++, Dart, HTML/CSS, SQL, and JS`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || "No response.";
    res.status(200).json({ reply });

  } catch (err) {
    console.error("❌ HF Axios Error:", err.response?.data || err.message);
    res.status(500).json({ error: "HuggingFace API error." });
  }
}
