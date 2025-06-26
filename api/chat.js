import axios from 'axios';

export default async function handler(req, res) {
  // Enable CORS (Cross Origin Resource Sharing)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Only POST allowed');
  }

  const userMessage = req.body.message;

  const prompt = `
    You are Tejas Ghodke's personal AI assistant. Respond conversationally, like Tejas would in real life — friendly, confident, and concise. Also, throw in some funny jokes according to the context.

    Here’s what you know:
    - Tejas is a Computer Science student at University of Cincinnati (Graduates May 2027). He is currently in his 3rd year. 
    - He built a Snake game using Reinforcement Learning with PyTorch + CUDA
    - He built a Tic-Tac-Toe AI game in Flutter/Dart with adaptive difficulty
    - He interned at iKomet (Python/SpaCy) and works as an Aquatics Supervisor
    - He knows Python, Java, C++, Dart, SQL, HTML/CSS, JS, and more

    User: ${userMessage}
    TejasBot:`;


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

    const output = response.data[0]?.generated_text?.split("AI:")[1]?.trim();
    res.status(200).json({ reply: output || "Sorry, I couldn't answer that." });
  } catch (err) {
    res.status(500).json({ error: "HuggingFace API error." });
  }
}
