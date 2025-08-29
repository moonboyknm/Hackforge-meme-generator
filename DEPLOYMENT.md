# Vercel Deployment Instructions

## Quick Deploy to Vercel

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Fix API issues and configure for Vercel"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   VITE_SERPAPI_KEY = your_serpapi_key_here
   SERPAPI_KEY = your_serpapi_key_here
   VITE_GROQ_API_KEY = your_groq_api_key_here
   GROQ_API_KEY = your_groq_api_key_here
   ```

4. **Deploy**: Vercel will automatically build and deploy

## What's Fixed

✅ **Data Structure Issue**: Frontend now correctly parses SerpApi response  
✅ **API Routes**: Properly configured as Vercel serverless functions  
✅ **Environment Variables**: Set up for both local and Vercel deployment  
✅ **Error Handling**: Added proper error handling for API failures  

## File Structure for Vercel

```
├── api/                    # Vercel Serverless Functions
│   ├── trends.js          # GET /api/trends
│   └── generate-meme.js   # POST /api/generate-meme  
├── src/                   # React Frontend
├── vercel.json           # Vercel configuration
└── .env.local           # Local environment variables (not committed)
```

## Testing Locally

The app runs on standard Vite dev server:
```bash
npm run dev
# Open http://localhost:5173
```

**Note**: API routes (`/api/*`) won't work in local development without Vercel CLI, but the frontend will load and show the "Could not load trends" message, which is expected locally.

## API Endpoints

- **GET `/api/trends`**: Returns array of Google Trends objects with `query` property
- **POST `/api/generate-meme`**: Takes `{topic}` and returns `{caption, memeUrl}`

The application is now fully configured for Vercel serverless deployment! 🚀