// File: /api/trends.js
import axios from 'axios';

export default async function handler(request, response) {
  try {
    // We will add the API key in Vercel, not here
    const apiKey = process.env.VITE_SERPAPI_KEY; 
    const trendsResponse = await axios.get(`https://serpapi.com/search.json?engine=google_trends_trending_now&api_key=${apiKey}`);
    
    // Send back just the list of trending searches
    response.status(200).json(trendsResponse.data.trending_searches);
  } catch (error) {
    console.error("Error fetching trends:", error);
    response.status(500).json({ error: 'Failed to fetch trends' });
  }
}