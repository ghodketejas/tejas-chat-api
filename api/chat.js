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

  // Read personal info from Vercel Blob
  let personalInfo;
  try {
    const blobRes = await fetch("https://9afcliaguh2tfza0.public.blob.vercel-storage.com/personal_info.json");

    if (!blobRes.ok) {
      throw new Error(`Failed to fetch blob: ${blobRes.status} ${blobRes.statusText}`);
    }

    personalInfo = await blobRes.json();
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch personal_info.json from blob: " + e.message });
  }

  // Format info for system prompt
  function formatExperience(exp) {
    return exp.map(e => `- ${e.title} at ${e.company} (${e.location}, ${e.dates}): ${e.highlights.join(" ")}`).join("\n");
  }
  function formatProjects(projs) {
    return projs.map(p => `- ${p.name} (${p.location}, ${p.dates}): ${p.highlights.join(" ")}`).join("\n");
  }

  // Helper formatters for additional sections
  function formatLanguages(langs = {}) {
    return Object.entries(langs).map(([lang, level]) => `- ${lang}: ${level}`).join("\n");
  }
  function formatPreviousEducation(prev = []) {
    return prev.map(e => `- ${e.institution} (${e.level}, ${e.location}${e.stream ? `, ${e.stream}` : ""})`).join("\n");
  }
  function formatFunFacts(facts = {}) {
    const prettyKey = (k) => k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return Object.entries(facts).map(([k, v]) => `- ${prettyKey(k)}: ${v}`).join("\n");
  }

  const infoString = `
=== Personal Profile ===
Name: ${personalInfo.name}
Bio: ${personalInfo.bio}

=== Contact ===
Location: ${personalInfo.contact?.location}
Email: ${personalInfo.contact?.email}
Phone: ${personalInfo.contact?.phone}
LinkedIn: ${personalInfo.contact?.linkedin}
GitHub: ${personalInfo.contact?.github}

=== Origin ===
Hometown: ${personalInfo.origin?.hometown}
Languages:\n${formatLanguages(personalInfo.origin?.languages || {})}

=== Education ===
Current: ${personalInfo.education?.degree} @ ${personalInfo.education?.university} (Graduation: ${personalInfo.education?.graduation})
Honors: ${(personalInfo.education?.honors || []).join(", ")}
Relevant Coursework: ${(personalInfo.education?.relevant_coursework || []).join(", ")}
Previous Education:\n${formatPreviousEducation(personalInfo.previous_education || [])}

=== Experience ===
${formatExperience(personalInfo.experience || [])}

=== Projects ===
${formatProjects(personalInfo.projects || [])}

=== Skills ===
Programming: ${(personalInfo.skills?.programming || []).join(", ")}
Operating Systems: ${(personalInfo.skills?.operating_systems || []).join(", ")}
Tools & Software: ${(personalInfo.skills?.tools_software || []).join(", ")}

=== Fun Facts ===
${formatFunFacts(personalInfo["fun facts"] || {})}

Availability: ${personalInfo.availability}
  `.trim();

  const systemPrompt = {
    role: "system",
    content: `You are Tejas' personal AI assistant.
    People will talk to you naurally and you should respond in a way that is natural and human-like (with a bit of humor).
    Here is information about Tejas:\n${infoString}\n
    Only answer questions about Tejas' background, skills, and portfolio. 
    If a user asks about anything not related to Tejas, politely refuse to answer.
    Make sure you answer only what is asked.`
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
