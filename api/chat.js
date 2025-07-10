// api/chat.js
import fs from "fs/promises";
import fetch from "node-fetch";

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const HF_API_TOKEN = process.env.HF_API_TOKEN;

  // Try to read personal_info.json, fallback to default if missing/invalid
  let personalInfo = {
    name: "Tejas",
    bio: "Web developer and student at the University of Cincinnati.",
    skills: ["Python", "JavaScript", "AI", "Security"],
    projects: [
      "Personal Portfolio Website",
      "AI Chatbot",
      "Web Security Analyzer"
    ]
  };
  try {
    const file = await fs.readFile("personal_info.json", "utf-8");
    personalInfo = JSON.parse(file);
  } catch (e) {
    // Use default if file missing or invalid
  }

  // Format info for system prompt
  const infoString = `Name: ${personalInfo.name}\nBio: ${personalInfo.bio}\nSkills: ${Array.isArray(personalInfo.skills) ? personalInfo.skills.join(", ") : JSON.stringify(personalInfo.skills)}\nProjects: ${Array.isArray(personalInfo.projects) ? personalInfo.projects.join(", ") : JSON.stringify(personalInfo.projects)}`;

  const systemPrompt = {
    role: "system",
    content: `You are Tejas' personal AI assistant. Here is information about Tejas:\n${infoString}\nOnly answer questions about Tejas' background, skills, and portfolio. If a user asks about anything not related to Tejas, politely refuse to answer.`
  };

  try {
    const response = await fetch("https://router.huggingface.co/auto/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          systemPrompt,
          { role: "user", content: message }
        ],
        model: "meta-llama/Llama-3.2-3B-Instruct",
        stream: false
      })
    });
    const data = await response.json();
    console.log("Hugging Face API response:", data);
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message || "Hugging Face API error" });
  }
}
