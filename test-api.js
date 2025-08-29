// File: test-api.js
import 'dotenv/config';

const fetchFn = global.fetch;
if (!fetchFn) {
  console.error('Global fetch not available in this Node version.');
  process.exit(1);
}

const BASE = process.env.TEST_BASE || 'http://localhost:8787';

const templates = [
  'drake',
  'distracted-boyfriend',
  'two-buttons',
  'doge',
  'success-kid',
  'gru-plan',
  'change-my-mind',
  'leonardo-dicaprio',
  'buzz',
  'random'
];

const providers = ['groq', 'gemini'];

async function testOne(topic, template, provider) {
  const body = {
    topic,
    template,
    provider,
    mode: 'caption'
  };
  const res = await fetchFn(`${BASE}/api/generate-meme`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    console.error(`FAIL template=${template} provider=${provider}`, data.error || res.statusText);
  } else {
    console.log(`OK   template=${data.template} provider=${provider} caption="${data.caption}"`);
  }
  return data;
}

async function main() {
  const topic = process.env.TEST_TOPIC || 'AI startups funding winter';
  for (const provider of providers) {
    if (provider === 'gemini' && !(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)) {
      console.warn('Skipping provider gemini (no GEMINI_API_KEY or GOOGLE_API_KEY set)');
      continue;
    }
    for (const t of templates) {
      await testOne(topic, t, provider);
    }
  }
  console.log('Done.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});