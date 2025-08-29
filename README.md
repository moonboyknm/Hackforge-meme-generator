# AI Trend-to-Meme Generator

A React application that fetches real-time Google Trends and generates AI-powered memes using Groq's LLM.

## Features

- 🔥 **Real-time Google Trends**: Fetches current trending topics using SerpApi
- 🤖 **AI-Generated Captions**: Uses Groq's fast LLM to create witty meme captions
- 🖼️ **Instant Meme Creation**: Generates memes using Memegen.link API
- ⚡ **Serverless Architecture**: Built for Vercel deployment

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Vercel Serverless Functions
- **APIs**: SerpApi (Google Trends) + Groq (AI) + Memegen.link (Memes)

## Deployment on Vercel

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/meme-generator)

### 2. Set Environment Variables

In your Vercel dashboard, add these environment variables:

```
VITE_SERPAPI_KEY=your_serpapi_key_here
SERPAPI_KEY=your_serpapi_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Get API Keys

- **SerpApi**: Sign up at [serpapi.com](https://serpapi.com) for Google Trends access
- **Groq**: Get your API key from [console.groq.com](https://console.groq.com)

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create `.env` file:
   ```
   VITE_SERPAPI_KEY=your_serpapi_key_here
   VITE_GROQ_API_KEY=your_groq_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   SERPAPI_KEY=your_serpapi_key_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: `http://localhost:5173`

## How It Works

1. **Load Trends**: App fetches top 10 Google Trends on page load
2. **Select Topic**: Click any trend to generate a meme
3. **AI Magic**: Groq generates a witty caption for the selected trend
4. **Instant Meme**: Caption is formatted and displayed as a meme image

## Project Structure

```
├── api/
│   ├── trends.js          # SerpApi integration for Google Trends
│   └── generate-meme.js   # Groq AI + Memegen.link integration
├── src/
│   ├── App.jsx           # Main React component
│   ├── App.css           # Styling
│   └── main.jsx          # React entry point
├── vercel.json           # Vercel deployment configuration
└── package.json          # Dependencies and scripts
```

## API Endpoints

- **GET `/api/trends`**: Fetch current Google Trends
- **POST `/api/generate-meme`**: Generate meme with AI caption

## Built For Hackathons ⚡

This project is optimized for rapid deployment and demonstration at hackathons:
- ✅ Single command deployment on Vercel
- ✅ Real-time data from Google Trends
- ✅ Fast AI responses with Groq
- ✅ No database required
- ✅ Serverless and scalable
