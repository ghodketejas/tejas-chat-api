# Tejas Chat API

A personal chatbot API that answers questions about Tejas Ghodke using AI powered by Hugging Face's inference API.

## Features

- 🤖 AI-powered responses using Hugging Face models
- 🌐 CORS-enabled for cross-origin requests
- 🔒 Environment variable security
- 📊 Health check endpoint
- ⚡ Optimized for Render deployment
- 🛡️ Comprehensive error handling

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI Provider**: Hugging Face Inference API
- **Deployment**: Render

## Environment Variables

Create a `.env` file in the root directory or set these in your Render environment:

```env
HF_TOKEN=your_huggingface_token_here
PORT=3000
```

### Getting Hugging Face Token

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to Settings → Access Tokens
4. Create a new token with read permissions
5. Copy the token and use it as `HF_TOKEN`

## Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd tejas-chat-api
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your HF_TOKEN
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Tell me about Tejas"}'
   ```

## Render Deployment

### Automatic Deployment

1. Connect your GitHub repository to Render
2. Create a new **Web Service**
3. Configure the service:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `HF_TOKEN`

### Manual Deployment

1. **Install Render CLI:**
   ```bash
   npm install -g @render/cli
   ```

2. **Deploy:**
   ```bash
   render deploy
   ```

## API Endpoints

### POST `/api/chat`

Send a message to the chatbot.

**Request:**
```json
{
  "message": "What projects has Tejas worked on?"
}
```

**Response:**
```json
{
  "reply": "Tejas has worked on several interesting projects including..."
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Chat API is running"
}
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid message format
- Missing environment variables
- Hugging Face API errors
- Rate limiting
- Model unavailability
- Network issues

## CORS Configuration

The API is configured to accept requests from:
- `https://ghodketejas.github.io` (production)
- `http://localhost:3000` (development)
- `http://localhost:5000` (alternative development)

## Usage Example

```javascript
const response = await fetch('https://your-render-url.onrender.com/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Tell me about Tejas Ghodke'
  })
});

const data = await response.json();
console.log(data.reply);
```

## Troubleshooting

### Common Issues

1. **"Chat service is currently unavailable"**
   - Check if `HF_TOKEN` is set correctly
   - Verify your Hugging Face token is valid

2. **CORS errors**
   - Ensure your domain is in the allowed origins
   - Check if the API is accessible

3. **Rate limiting**
   - Hugging Face has rate limits on free accounts
   - Consider upgrading your Hugging Face plan

### Logs

Check Render logs for detailed error information:
```bash
render logs <service-name>
```

## License

MIT License - see LICENSE file for details.

## Author

Tejas Ghodke - [GitHub](https://github.com/ghodketejas)
