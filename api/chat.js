import hf from "@huggingface/inference";
import http from "http";

const client = new hf.InferenceClient(process.env.HF_TOKEN);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).send("OK");
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const userMessage = req.body.message;

  try {
    const output = await client.textGeneration({
      model: "Qwen/Qwen2.5-1.5B-Instruct",
      inputs: `
You are Tejas Ghodke's AI assistant. Respond as Tejas would—friendly, confident, and concise. Add humor when appropriate.
You know:
- Tejas is a 3rd-year CS student at University of Cincinnati (Graduates May 2027)
- Built a Snake game with PyTorch + CUDA
- Built Tic-Tac-Toe AI in Flutter/Dart
- Interned at iKomet (Python/SpaCy)
- Works part-time as Aquatics Supervisor
- Knows Python, Java, C++, Dart, HTML/CSS, SQL, JS

User: ${userMessage}
`,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.9
      },
      provider: "auto"
    });

    res.status(200).json({ reply: output.generated_text.trim() });
  } catch (error) {
    console.error("HF Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "HuggingFace API Error" });
  }
}
