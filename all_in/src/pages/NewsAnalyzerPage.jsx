import { useState } from 'react';
import { getExperienceById } from '../config/experiences';
import ExperiencePage from './ExperiencePage';
import NewsAnalyzerNav from '../components/newsanalyzer/NewsAnalyzerNav';
import NewsAnalyzerView from '../components/newsanalyzer/NewsAnalyzerView';

export default function NewsAnalyzerPage() {
  const experience = getExperienceById('newsanalyzer');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState('Ready. Select categories and fetch the freshest headlines.');
  const [status, setStatus] = useState({ message: '', tone: '' });
  const [loading, setLoading] = useState(false);

  const fetchNews = async ({ categories, keyword, limit, baseUrl }) => {
    setLoading(true);
    setStatus({ message: 'Fetching news from the worker…', tone: 'warn' });

    const categoryPath = encodeURIComponent(categories.join(','));
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (limit) params.set('limit', String(limit));

    let url;
    try {
      const base = new URL(baseUrl);
      if (!/^https?:$/i.test(base.protocol)) {
        throw new Error('Base URL must use http or https.');
      }
      url = new URL(`/news/${categoryPath}${params.toString() ? `?${params}` : ''}`, base).toString();
    } catch (error) {
      setStatus({ message: 'Please provide a valid http(s) base URL for the worker.', tone: 'error' });
      setStats('Request aborted.');
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      const payload = await response.json();

      const label = categories
        .map((key) => CATEGORY_LABELS[key] || key)
        .join(', ');

      setStats(`Fetched <strong>${payload.itemCount}</strong> headlines from <strong>${payload.feedCount}</strong> feed(s).`);

      const fixtureCount = Array.isArray(payload.fixturesUsed) ? payload.fixturesUsed.length : 0;
      let statusLevel = response.ok ? 'ok' : 'warn';
      let statusText = response.ok
        ? `Success! Showing ${label} news.`
        : `Some feeds failed (${payload.failures.length}). Showing what we could recover.`;

      if (fixtureCount > 0) {
        statusLevel = 'warn';
        statusText = `Served ${label} news with ${fixtureCount} fixture fallback${fixtureCount > 1 ? 's' : ''}.`;
      }

      setStatus({ message: statusText, tone: statusLevel });
      setItems(payload.items || []);
    } catch (error) {
      setStatus({ message: `Error: ${error.message}`, tone: 'error' });
      setStats('Request failed.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExperiencePage experience={experience} navigation={<NewsAnalyzerNav onFetch={fetchNews} loading={loading} />}>
      <NewsAnalyzerView items={items} stats={stats} status={status} />
    </ExperiencePage>
  );
}

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