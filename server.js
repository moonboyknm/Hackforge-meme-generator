// File: server.js - local dev API server to run Vercel-style functions
// Loads .env so process.env.* is available for the API handlers
import 'dotenv/config';
import express from 'express';
import trendsHandler from './api/trends.js';
import memeHandler from './api/generate-meme.js';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req,res)=>res.json({status:'ok'}));

// Map routes to existing handlers
app.get('/api/trends', (req,res)=>trendsHandler(req,res));
app.post('/api/generate-meme', (req,res)=>memeHandler(req,res));

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
});