import { useState } from 'react';

const CATEGORY_LABELS = {
  top: 'Top Stories',
  world: 'World',
  us: 'US',
  business: 'Business',
  technology: 'Technology',
  politics: 'Politics',
  health: 'Health',
  entertainment: 'Entertainment',
  travel: 'Travel',
  all: 'Everything',
};

export default function NewsAnalyzerNav({ onFetch, loading }) {
  const [categories, setCategories] = useState(['top', 'world', 'technology']);
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(50);
  const [baseUrl, setBaseUrl] = useState('http://localhost:8787');

  const handleFetch = () => {
    onFetch({ categories, keyword, limit, baseUrl });
  };

  const handleCategoryChange = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setCategories(values);
  };

  return (
    <div className="panel">
      <div className="controls">
        <label>
          Categories (⌘/Ctrl + click for multi)
          <select multiple size="8" value={categories} onChange={handleCategoryChange} className="w-full">
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <div className="flex-row">
          <label>
            Keyword filter (optional)
            <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. climate, AI, markets" />
          </label>
          <label>
            Result limit
            <input type="number" min="5" max="150" step="5" value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))} />
          </label>
        </div>

        <label>
          Worker base URL
          <input type="url" inputMode="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://groq-endpoint.example.workers.dev" />
        </label>

        <div className="flex-row">
          <button onClick={handleFetch} disabled={loading}>
            {loading ? 'Loading...' : 'Load headlines'}
          </button>
        </div>
      </div>
    </div>
  );
}