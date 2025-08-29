// File: /api/trends.js
import axios from 'axios';

export default async function handler(request, response) {
  try {
    const apiKey = process.env.VITE_SERPAPI_KEY; 
    const trendsResponse = await axios.get(`https://serpapi.com/search.json?engine=google_trends_trending_now&api_key=${apiKey}`);
    
    // THIS IS THE NEW DEBUGGING LINE
    console.log('SerpAPI Response:', trendsResponse.data); 
    
    // The original line that sends the data
    response.status(200).json(trendsResponse.data.trending_searches);

  } catch (error) {
    // This part is NOT running, which is why we don't see errors in the log
    console.error("Error fetching trends:", error);
    response.status(500).json({ error: 'Failed to fetch trends' });
  }
}