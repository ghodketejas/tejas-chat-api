import express from 'express';
import cors from 'cors';
import { InferenceClient } from "@huggingface/inference";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://ghodketejas.github.io', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Chat API is running' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ 
        error: "Invalid message format. Please provide a valid message." 
      });
    }

    // Check if HF_TOKEN is available
    if (!process.env.HF_TOKEN) {
      console.error("HF_TOKEN environment variable is not set");
      return res.status(500).json({ 
        reply: "Chat service is currently unavailable. Please try again later." 
      });
    }

    const client = new InferenceClient(process.env.HF_TOKEN);
    let response = "";

    try {
      const stream = client.chatCompletionStream({
        provider: "auto",
        model: "Qwen/Qwen2.5-1.5B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that knows about Tejas Ghodke. Answer questions about Tejas's background, skills, projects, and experiences. Keep responses concise and friendly."
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const newContent = chunk.choices[0].delta.content;
          if (newContent) {
            response += newContent;
          }
        }
      }

      res.status(200).json({ 
        reply: response.trim() || "I'm sorry, I couldn't generate a response. Please try again." 
      });

    } catch (hfError) {
      console.error("Hugging Face API Error:", hfError.message);
      
      // Provide fallback responses for common errors
      if (hfError.message.includes('rate limit') || hfError.message.includes('quota')) {
        res.status(429).json({ 
          reply: "I'm getting too many requests right now. Please try again in a few minutes." 
        });
      } else if (hfError.message.includes('model') || hfError.message.includes('not found')) {
        res.status(503).json({ 
          reply: "The AI model is temporarily unavailable. Please try again later." 
        });
      } else {
        res.status(500).json({ 
          reply: "I'm having trouble processing your request. Please try again." 
        });
      }
    }

  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ 
      reply: "Something went wrong on our end. Please try again later." 
    });
  }
});

// Fallback route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found. Use POST /api/chat to send messages." 
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled Error:", error);
  res.status(500).json({ 
    reply: "An unexpected error occurred. Please try again." 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Chat API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
});

export default app;
