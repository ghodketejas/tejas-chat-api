// api/chat.js
const { InferenceClient } = require("@huggingface/inference");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const HF_API_TOKEN = process.env.HF_API_TOKEN;

  try {
    const client = new InferenceClient(HF_API_TOKEN);

    // Use chatCompletion for a simple response
    const result = await client.chatCompletion({
      model: "Qwen/Qwen2.5-1.5B-Instruct",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    // The reply is in result.choices[0].message.content
    const reply = result.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message || "Hugging Face API error" });
  }
};
