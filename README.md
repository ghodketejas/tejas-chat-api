# tejas-chat-api

A serverless API for a personal AI chatbot, designed to answer questions about Tejas and his portfolio. Powered by Hugging Face's Meta-Llama-3-3B-Instruct model via the Featherless API.

## Features
- Serverless backend (Node.js, Vercel-ready)
- Uses Hugging Face Featherless API for OpenAI-style chat completions
- System prompt ensures the bot only answers questions about Tejas
- CORS and OPTIONS preflight support for browser and frontend compatibility

## Setup & Deployment

### 1. Clone the Repository
```
git clone https://github.com/ghodketejas/tejas-chat-api.git
cd tejas-chat-api
```

### 2. Install Dependencies
```
npm install
```

### 3. Set Environment Variables
- On Vercel, go to your project settings → Environment Variables.
- Add:
  - `HF_API_TOKEN` = your Hugging Face API token (get it from https://huggingface.co/settings/tokens)

### 4. Deploy to Vercel
- Push your code to GitHub and import the repo into Vercel.
- Vercel will auto-detect the API route and deploy your function at:
  `https://<your-vercel-project>.vercel.app/api/chat`

## API Usage

- **Endpoint:** `/api/chat`
- **Method:** `POST`
- **Request Body:**
  ```json
  { "message": "Your question here" }
  ```
- **Response:**
  ```json
  { "reply": "AI's answer here" }
  ```

## How It Works
- The backend receives a POST request with a user message.
- It prepends a system prompt describing Tejas and restricting the bot to only answer questions about Tejas.
- It sends the request to the Hugging Face Featherless API using the Meta-Llama-3-3B-Instruct model.
- The assistant's reply is returned to the frontend.

## System Prompt Example
```
You are Tejas' personal AI assistant. 
Here's what you need to know:
    - Tejas is a web developer and a student at the University of Cincinnati. 
    - He has worked on web applications, AI chatbots, and security projects. 
    - Only answer questions about Tejas' background, skills, and portfolio. 
    - If a user asks about anything not related to Tejas, politely refuse to answer.
```

## Customization
- To update Tejas' details, edit the `systemPrompt` in `api/chat.js`.
- To use a different model, change the `model` field in the API call.

## License
MIT 