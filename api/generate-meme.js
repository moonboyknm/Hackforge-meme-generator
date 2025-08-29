// File: /api/generate-meme.js
import Groq from 'groq-sdk';

export default async function handler(request, response) {
  // Initialize Groq client inside the handler to ensure env vars are loaded
  const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY });
  // Ensure it's a POST request
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  // Get the 'topic' from the request body
  const { topic } = request.body;
  if (!topic) {
    return response.status(400).json({ error: 'Topic is required' });
  }

  try {
    // 1. Generate caption with Groq AI
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: `Write a very short, witty meme caption for the topic: "${topic}"` }],
      model: 'llama3-8b-8192', // Fast and powerful model
    });
    const caption = chatCompletion.choices[0]?.message?.content || "AI is tired, try again.";
    
    // 2. Format the caption for a URL
    const formatText = (text) => text.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/#/g, '~h');
    const memeText = formatText(caption);
    const memeTemplate = 'drake'; // Using the Drake meme template
    const memeUrl = `https://api.memegen.link/images/${memeTemplate}/_/${memeText}.png`;

    // 3. Send the final data back to the frontend
    response.status(200).json({ caption, memeUrl });

  } catch (error) {
    console.error("Error generating meme:", error);
    response.status(500).json({ error: 'Failed to generate meme' });
  }
}