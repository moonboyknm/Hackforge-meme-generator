// File: /api/trends.js
import axios from 'axios';

export default async function handler(request, response) {
  try {
    const apiKey = process.env.VITE_SERPAPI_KEY;
    const trendsResponse = await axios.get(`https://serpapi.com/search.json?engine=google_trends_trending_now&api_key=${apiKey}`);
    
    // Debug log to see the API response structure
    console.log('SerpAPI Response keys:', Object.keys(trendsResponse.data));
    console.log('Trending searches count:', trendsResponse.data.trending_searches?.length);
    
    // Return the trending_searches array directly
    if (trendsResponse.data.trending_searches) {
      response.status(200).json(trendsResponse.data.trending_searches);
    } else {
      console.error('No trending_searches found in API response');
      response.status(500).json({ error: 'No trending data available' });
    }

  } catch (error) {
    console.error("Error fetching trends:", error.response?.data || error.message);
    response.status(500).json({ error: 'Failed to fetch trends' });
  }
}