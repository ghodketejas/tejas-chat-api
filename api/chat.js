import { InferenceClient } from "@huggingface/inference";
import http from "http";

const client = new InferenceClient(process.env.HF_TOKEN);

// Server setup
const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
      const { message } = JSON.parse(body);

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

User: ${message}
          `,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
          }
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ reply: output.generated_text }));
      } catch (err) {
        console.error("HF Error:", err.message);
        res.writeHead(500).end("Error generating response.");
      }
    });
  } else {
    res.writeHead(404).end("Not Found");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`TejasBot API running on port ${PORT}`);
});
