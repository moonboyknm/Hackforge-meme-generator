// File: /api/generate-meme.js
import Groq from 'groq-sdk';

export default async function handler(request, response) {
  const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY });

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  // Accept future extension: template (string), mode ('full' | 'caption')
  const { topic, template, mode } = request.body || {};

  if (!topic || typeof topic !== 'string') {
    return response.status(400).json({ error: 'Topic is required' });
  }

  // Supported meme templates (subset)
  const SUPPORTED_TEMPLATES = [
    'drake',
    'distracted-boyfriend',
    'two-buttons',
    'doge',
    'success-kid',
    'gru-plan',
    'change-my-mind',
    'leonardo-dicaprio',
    'buzz'
  ];

  const pickTemplate = () => {
    if (template === 'random') {
      return SUPPORTED_TEMPLATES[Math.floor(Math.random() * SUPPORTED_TEMPLATES.length)];
    }
    if (template && SUPPORTED_TEMPLATES.includes(template)) return template;
    return 'drake';
  };

  const chosenTemplate = pickTemplate();

  // Helper: remove unwanted characters / formatting for display
  const sanitizeCaption = (raw) => {
    if (!raw) return 'AI is tired, try again.';
    let c = raw.trim();
    c = c.replace(/^[\\"'“”‘’`]+|[\\"'“”‘’`]+$/g, '');         // strip wrapping quotes
    c = c.replace(/#(\w+)/g, '$1');                           // remove hashtags
    c = c.replace(/\s+/g, ' ');                               // collapse whitespace
    c = c.replace(/"{2,}/g, '"').replace(/'{2,}/g, "'");      // collapse duplicate quotes
    const MAX = 120;
    if (c.length > MAX) c = c.slice(0, MAX - 1).trimEnd() + '…';
    return c;
  };

  // Helper: encode for memegen (underscores, escape ? %), drop hashtags
  const encodeForMeme = (text) =>
    text
      .trim()
      .replace(/#(\w+)/g, '$1')
      .replace(/\s+/g, '_')
      .replace(/\?/g, '~q')
      .replace(/%/g, '~p')
      .replace(/"/g, "''")
      .slice(0, 140);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Write a very short (max 12 words) witty meme caption (no hashtags, no surrounding quotes) for the topic: "${topic}"`
      }],
      model: 'llama3-8b-8192',
      temperature: 0.9,
      max_tokens: 40
    });

    const rawCaption = chatCompletion.choices[0]?.message?.content || 'AI is tired, try again.';
    const caption = sanitizeCaption(rawCaption);

    // Caption-only mode (no image generation)
    if (mode === 'caption') {
      return response.status(200).json({ caption });
    }

    const memeText = encodeForMeme(caption);
    const memeUrl = `https://api.memegen.link/images/${chosenTemplate}/_/${memeText}.png`;

    response.status(200).json({
      caption,
      memeUrl,
      template: chosenTemplate,
      templates: SUPPORTED_TEMPLATES
    });
  } catch (error) {
    console.error('Error generating meme:', error);
    response.status(500).json({ error: 'Failed to generate meme' });
  }
}