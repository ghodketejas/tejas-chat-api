// api/chat.js
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

  // Read personal info from environment variable
  let personalInfo;
  try {
    personalInfo = JSON.parse(process.env.PERSONAL_INFO_JSON);
  } catch (e) {
    return res.status(500).json({ error: "PERSONAL_INFO_JSON is missing or invalid. The chatbot cannot answer questions without it." });
  }

  // Format info for system prompt
  function formatExperience(exp) {
    return exp.map(e => `- ${e.title} at ${e.company} (${e.location}, ${e.dates}): ${e.highlights.join(" ")}`).join("\n");
  }
  function formatProjects(projs) {
    return projs.map(p => `- ${p.name} (${p.location}, ${p.dates}): ${p.highlights.join(" ")}`).join("\n");
  }
  const infoString = `Name: ${personalInfo.name}\nBio: ${personalInfo.bio}\nContact: ${personalInfo.contact?.email}, ${personalInfo.contact?.phone}, ${personalInfo.contact?.linkedin}, ${personalInfo.contact?.github}\nEducation: ${personalInfo.education?.degree} at ${personalInfo.education?.university}, Graduation: ${personalInfo.education?.graduation}, Honors: ${(personalInfo.education?.honors || []).join(", ")}, Coursework: ${(personalInfo.education?.relevant_coursework || []).join(", ")}\nExperience:\n${formatExperience(personalInfo.experience || [])}\nProjects:\n${formatProjects(personalInfo.projects || [])}\nSkills: Programming: ${(personalInfo.skills?.programming || []).join(", ")}; OS: ${(personalInfo.skills?.operating_systems || []).join(", ")}; Tools: ${(personalInfo.skills?.tools_software || []).join(", ")}\nAvailability: ${personalInfo.availability}`;

  const systemPrompt = {
    role: "system",
    content: `You are Tejas' personal AI assistant. Here is information about Tejas:\n${infoString}\nOnly answer questions about Tejas' background, skills, and portfolio. If a user asks about anything not related to Tejas, politely refuse to answer.`
  };

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
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
        model: "mistralai/Mistral-7B-Instruct-v0.2",
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
