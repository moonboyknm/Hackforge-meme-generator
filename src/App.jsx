// File: /src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import './App.css';

const TEMPLATES = [
  { id: 'drake', label: 'Drake' },
  { id: 'distracted-boyfriend', label: 'Distracted' },
  { id: 'two-buttons', label: 'Two Buttons' },
  { id: 'doge', label: 'Doge' },
  { id: 'success-kid', label: 'Success Kid' },
  { id: 'gru-plan', label: 'Gru Plan' },
  { id: 'change-my-mind', label: 'Change My Mind' },
  { id: 'leonardo-dicaprio', label: 'Cheers Leo' },
  { id: 'buzz', label: 'Buzz' }
];

const encodeForMeme = (text) =>
  text
    .trim()
    .replace(/#(\w+)/g, '$1')
    .replace(/\s+/g, '_')
    .replace(/\?/g, '~q')
    .replace(/%/g, '~p')
    .replace(/"/g, "''")
    .slice(0, 140);

const THEME_KEY = 'theme-pref';

function App() {
  const [trends, setTrends] = useState([]);
  const [generatedMeme, setGeneratedMeme] = useState(null);
  const [isLoadingMeme, setIsLoadingMeme] = useState(false);
  const [isLoadingCaption, setIsLoadingCaption] = useState(false);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('drake');
  const [activeTopic, setActiveTopic] = useState('');
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Persist + apply theme
  useEffect(() => {
    try {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  // Fetch trends
  useEffect(() => {
    setError('');
    fetch('/api/trends')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.slice(0, 10).map(trend => ({ query: trend.query }));
          setTrends(formatted);
        } else {
          setError('No trends data available');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Could not load trends. Please refresh.');
      });
  }, []);

  const generateMeme = useCallback(async (topic, template = selectedTemplate) => {
    if (!topic) return;
    setIsLoadingMeme(true);
    setError('');
    setActiveTopic(topic);
    setGeneratedMeme(null);
    try {
      const res = await fetch('/api/generate-meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, template })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGeneratedMeme({
          caption: data.caption,
          memeUrl: data.memeUrl,
          template: data.template || template
        });
        // If backend returns template list we could store, but for now ignore.
        if (data.template) setSelectedTemplate(data.template);
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong generating the meme.');
    } finally {
      setIsLoadingMeme(false);
    }
  }, [selectedTemplate]);

  const regenerateCaption = useCallback(async () => {
    if (!activeTopic || !generatedMeme) return;
    setIsLoadingCaption(true);
    setError('');
    try {
      const res = await fetch('/api/generate-meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic,
          template: selectedTemplate,
          mode: 'caption'
        })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.caption) {
        const memeUrl = `https://api.memegen.link/images/${selectedTemplate}/_/${encodeForMeme(data.caption)}.png`;
        setGeneratedMeme({
          caption: data.caption,
          memeUrl,
          template: selectedTemplate
        });
      }
    } catch (e) {
      console.error(e);
      setError('Failed to regenerate caption.');
    } finally {
      setIsLoadingCaption(false);
    }
  }, [activeTopic, generatedMeme, selectedTemplate]);

  const onTemplateClick = (tpl) => {
    setSelectedTemplate(tpl);
    // If a meme already exists, update only image with same caption
    if (generatedMeme) {
      const memeUrl = `https://api.memegen.link/images/${tpl}/_/${encodeForMeme(generatedMeme.caption)}.png`;
      setGeneratedMeme({ ...generatedMeme, memeUrl, template: tpl });
    }
  };

  const randomTemplate = () => {
    const pool = TEMPLATES.map(t => t.id);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    onTemplateClick(pick);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Trend → Meme Lab</h1>
          <p className="subtitle">Pick a trend, choose a template, let AI craft the punchline.</p>
        </div>
        <button
          className="mini-btn theme-toggle"
          aria-label="Toggle theme"
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          title="Toggle light / dark theme"
        >
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>
      </header>

      <main className="layout-grid">
        {/* Trends Panel */}
        <section className="panel trends-panel">
          <div className="panel-head">
            <h2>Live Trends</h2>
            <button
              className="mini-btn"
              disabled={isLoadingMeme || isLoadingCaption}
              onClick={() => {
                // simple refetch
                setTrends([]);
                fetch('/api/trends')
                  .then(r => r.json())
                  .then(d => {
                    if (Array.isArray(d)) {
                      setTrends(d.slice(0, 10).map(t => ({ query: t.query })));
                    }
                  });
              }}
            >
              ↻
            </button>
          </div>
          <ul className="trend-list">
            {trends.length === 0 && <li className="skeleton-row" />}
            {trends.map((trend, i) => (
              <li key={i} className={activeTopic === trend.query ? 'active' : ''}>
                <button
                  className="trend-btn"
                  disabled={isLoadingMeme}
                  onClick={() => generateMeme(trend.query)}
                >
                  {trend.query}
                </button>
                <button
                  className="gen-btn"
                  disabled={isLoadingMeme}
                  onClick={() => generateMeme(trend.query)}
                >
                  Generate
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Template Picker */}
        <section className="panel templates-panel">
          <div className="panel-head">
            <h2>Templates</h2>
            <div className="template-actions">
              <button className="mini-btn" onClick={randomTemplate} disabled={isLoadingMeme}>🎲</button>
            </div>
          </div>
          <div className="template-grid">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                className={`template-card ${selectedTemplate === t.id ? 'selected' : ''}`}
                onClick={() => onTemplateClick(t.id)}
                disabled={isLoadingMeme}
                title={t.id}
              >
                <span className="template-label">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Workspace / Output */}
        <section className="panel workspace-panel">
          <div className="panel-head">
            <h2>Workspace</h2>
            {activeTopic && <span className="active-topic" title="Current topic">{activeTopic}</span>}
          </div>

            {(isLoadingMeme || isLoadingCaption) && (
              <div className="loader-block">
                <div className="spinner" />
                <p>{isLoadingCaption ? 'Rewriting caption…' : 'Generating meme…'}</p>
              </div>
            )}

            {error && <div className="error-banner">{error}</div>}

            {!generatedMeme && !(isLoadingMeme || isLoadingCaption) && (
              <div className="empty-state">
                <p>Select a trend & template to start.</p>
              </div>
            )}

            {generatedMeme && !isLoadingMeme && (
              <div className="meme-output">
                <p className="caption-text">{generatedMeme.caption}</p>
                <div className="meme-frame">
                  <img
                    src={generatedMeme.memeUrl}
                    alt={`Meme template ${generatedMeme.template} with caption: ${generatedMeme.caption}`}
                    loading="lazy"
                  />
                </div>
                <div className="actions-row">
                  <button
                    className="primary-btn"
                    disabled={isLoadingCaption}
                    onClick={regenerateCaption}
                  >
                    {isLoadingCaption ? '...' : 'Regenerate Caption'}
                  </button>
                  <a
                    className="secondary-btn"
                    href={generatedMeme.memeUrl}
                    download={`meme-${generatedMeme.template}.png`}
                  >
                    Download
                  </a>
                </div>
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default App;