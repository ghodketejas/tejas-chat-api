import { InferenceClient } from "@huggingface/inference";

export default async function handler(req, res) {
  const client = new InferenceClient(process.env.HUGGINGFACE_TOKEN);

  let out = "";

  const stream = client.chatCompletionStream({
    provider: "auto",
    model: "Qwen/Qwen3-0.6B",
    messages: [
      {
        role: "user",
        content: "What is the capital of France?",
      },
    ],
  });

  try {
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        out += newContent;
      }
    }
    res.status(200).json({ reply: out });
  } catch (err) {
    console.error("Streaming error:", err);
    res.status(500).json({ error: "Streaming failed." });
  }
}
