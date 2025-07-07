import { InferenceClient } from "@huggingface/inference";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const userMessage = req.body.message || "Hello!";
  const client = new InferenceClient(process.env.HF_TOKEN);
  let out = "";

  try {
    const stream = client.chatCompletionStream({
      provider: "auto",
      model: "Qwen/Qwen2.5-1.5B-Instruct",
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        out += newContent;
      }
    }

    res.status(200).json({ reply: out.trim() });

  } catch (error) {
    console.error("HF Error:", error.message);
    res.status(500).json({ reply: "Something went wrong 😬" });
  }
}
