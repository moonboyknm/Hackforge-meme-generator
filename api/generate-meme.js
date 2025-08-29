// File: /api/generate-meme.js
// Adds dynamic template validation + optional Gemini provider
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory cache for memegen templates (refresh hourly)
let TEMPLATE_CACHE = { list: [], fetchedAt: 0 };
const TEMPLATE_TTL_MS = 60 * 60 * 1000;

async function fetchTemplateList() {
  const now = Date.now();
  if (TEMPLATE_CACHE.list.length && (now - TEMPLATE_CACHE.fetchedAt) < TEMPLATE_TTL_MS) {
    return TEMPLATE_CACHE.list;
  }
  try {
    const res = await fetch('https://api.memegen.link/templates/');
    if (!res.ok) throw new Error('Template fetch failed');
    const data = await res.json();
    // Expect array of { id, name, ... }
    const ids = Array.isArray(data) ? data.map(t => t.id).filter(Boolean) : [];
    if (ids.length) {
      TEMPLATE_CACHE = { list: ids, fetchedAt: now };
      return ids;
    }
  } catch (e) {
    console.warn('Failed to refresh meme template list, using fallback:', e.message);
  }
  // Fallback (known working)
  return [
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
}

const sanitizeCaption = (raw) => {
  if (!raw) return 'AI is tired, try again.';
  let c = raw.trim();
  c = c.replace(/^[\\"'“”‘’`]+|[\\"'“”‘’`]+$/g, '');
  c = c.replace(/#(\w+)/g, '$1');
  c = c.replace(/\s+/g, ' ');
  c = c.replace(/"{2,}/g, '"').replace(/'{2,}/g, "'");
  const MAX = 120;
  if (c.length > MAX) c = c.slice(0, MAX - 1).trimEnd() + '…';
  return c;
};

const encodeForMeme = (text) =>
  text
    .trim()
    .replace(/#(\w+)/g, '$1')
    .replace(/\s+/g, '_')
    .replace(/\?/g, '~q')
    .replace(/%/g, '~p')
    .replace(/"/g, "''")
    .slice(0, 140);

async function generateCaptionGroq(groqClient, topic) {
  const chatCompletion = await groqClient.chat.completions.create({
    messages: [{
      role: 'user',
      content: `Write a very short (max 12 words) witty meme caption (no hashtags, no surrounding quotes) for the topic: "${topic}"`
    }],
    model: 'llama3-8b-8192',
    temperature: 0.9,
    max_tokens: 40
  });
  return chatCompletion.choices[0]?.message?.content;
}

async function generateCaptionGemini(topic) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('Missing GEMINI_API_KEY / GOOGLE_API_KEY');
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Write a very short (max 12 words) witty meme caption (no hashtags, no surrounding quotes) for the topic: "${topic}"`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { topic, template, mode, provider } = request.body || {};
  if (!topic || typeof topic !== 'string') {
    return response.status(400).json({ error: 'Topic is required' });
  }

  const templates = await fetchTemplateList();

  // Map UI / friendly ids to canonical memegen slugs (updated with working slugs)
  const VARIANT_MAP = {
    'success-kid': 'success',
    'successkid': 'success',
    'gru-plan': 'gru',
    'gruplan': 'gru',
    'distracted-boyfriend': 'db',
    'distracted_boyfriend': 'db',
    'distractedboyfriend': 'db',
    'two-buttons': 'ds',
    'two_buttons': 'ds',
    'twobuttons': 'ds',
    'change-my-mind': 'cmm',
    'change_my_mind': 'cmm',
    'changemymind': 'cmm',
    'leonardo-dicaprio': 'leo',
    'leonardo_dicaprio': 'leo',
    'leonardodicaprio': 'leo'
  };

  function resolveTemplate(raw) {
    if (!raw) return null;

    const candidateSet = new Set();

    const push = v => { if (v) candidateSet.add(v); };

    push(raw);
    push(raw.toLowerCase());
    // mapped direct
    push(VARIANT_MAP[raw]);
    push(VARIANT_MAP[raw.toLowerCase()]);
    // dash / underscore swaps
    const dashToUnderscore = raw.replace(/-/g, '_');
    push(dashToUnderscore);
    push(VARIANT_MAP[dashToUnderscore]);
    const underscoreToDash = raw.replace(/_/g, '-');
    push(underscoreToDash);
    push(VARIANT_MAP[underscoreToDash]);
    // condensed (remove separators)
    const condensed = raw.replace(/[-_]/g, '');
    push(condensed);
    push(VARIANT_MAP[condensed]);

    // iterate candidates in insertion order
    for (const c of candidateSet) {
      if (c && templates.includes(c)) return c;
    }
    return null;
  }

  const pickTemplate = () => {
    if (template === 'random') {
      return templates[Math.floor(Math.random() * templates.length)];
    }
    const resolved = resolveTemplate(template);
    if (resolved) return resolved;
    return 'drake';
  };

  const chosenTemplate = pickTemplate();

  // Initialize Groq client lazily (only if needed)
  const groqKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
  const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;

  try {
    let rawCaption;
    if (provider === 'gemini') {
      rawCaption = await generateCaptionGemini(topic);
    } else {
      if (!groq) {
        return response.status(500).json({ error: 'Groq API key missing. Provide provider=gemini or configure GROQ_API_KEY.' });
      }
      rawCaption = await generateCaptionGroq(groq, topic);
    }

    const caption = sanitizeCaption(rawCaption);

    if (mode === 'caption') {
      return response.status(200).json({ caption, template: chosenTemplate, templates });
    }

    const memeText = encodeForMeme(caption);
    const memeUrl = `https://api.memegen.link/images/${chosenTemplate}/_/${memeText}.png`;

    response.status(200).json({
      caption,
      memeUrl,
      template: chosenTemplate,
      requestedTemplate: template,
      resolvedTemplate: chosenTemplate,
      templates,
      provider: provider === 'gemini' ? 'gemini' : 'groq'
    });
  } catch (error) {
    console.error('Error generating meme:', error);
    response.status(500).json({ error: 'Failed to generate meme' });
  }
}