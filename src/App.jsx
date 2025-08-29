// File: /src/App.jsx
import { useState, useEffect } from 'react';
import './App.css'; // We'll add styles to this file next

function App() {
  const [trends, setTrends] = useState([]);
  const [generatedMeme, setGeneratedMeme] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch trends when the app loads
    setIsLoading(true);
    fetch('/api/trends')
      .then(res => res.json())
      .then(data => {
        // Take the first 10 trends from the first group
        setTrends(data[0].title_queries.slice(0, 10));
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load trends. Please refresh.');
        setIsLoading(false);
      });
  }, []);

  const handleGenerateMeme = (topic) => {
    setIsLoading(true);
    setGeneratedMeme(null); // Clear previous meme
    setError(''); // Clear previous error

    fetch('/api/generate-meme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setGeneratedMeme(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Something went wrong. Please try again.');
        setIsLoading(false);
      });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Trend-to-Meme Generator</h1>
        <p>Click a trend to instantly generate a meme with an AI-powered caption.</p>
      </header>
      
      <main className="main-content">
        <div className="trends-column">
          <h2>Top 10 Google Trends</h2>
          <ul>
            {trends.map((trend, index) => (
              <li key={index}>
                <span>{trend.query}</span>
                <button onClick={() => handleGenerateMeme(trend.query)} disabled={isLoading}>
                  Generate
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="meme-column">
          {isLoading && <div className="loader"><span>🧠</span><p>Generating...</p></div>}
          {error && <div className="error-message">{error}</div>}
          {generatedMeme && (
            <div className="meme-card">
              <p className="meme-caption">"{generatedMeme.caption}"</p>
              <img src={generatedMeme.memeUrl} alt={`Meme for ${generatedMeme.caption}`} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;