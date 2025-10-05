// Trigger rebuild
import { useState, useEffect } from 'react';
import { getExperienceById } from '../config/experiences';
import ExperiencePage from './ExperiencePage';
import NewsAnalyzerNav from '../components/newsanalyzer/NewsAnalyzerNav';
import NewsAnalyzerView from '../components/newsanalyzer/NewsAnalyzerView';

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

const BASE_URL = 'https://groq-endpoint.louispaulet13.workers.dev/';

export default function NewsAnalyzerPage() {
  const experience = getExperienceById('newsanalyzer');
  const [news, setNews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllNews = async () => {
      setLoading(true);
      const allNews = {};
      for (const category in CATEGORY_LABELS) {
        if (category === 'all') continue;
        try {
          const url = `${BASE_URL}news/${category}`;
          const response = await fetch(url, { headers: { Accept: 'application/json' } });
          const payload = await response.json();
          allNews[category] = payload.items || [];
        } catch (error) {
          console.error(`Failed to fetch news for category: ${category}`, error);
        }
      }
      setNews(allNews);
      setLoading(false);
    };

    fetchAllNews();
  }, []);

  return (
    <ExperiencePage experience={experience} navigation={<NewsAnalyzerNav />}>
      <NewsAnalyzerView news={news} loading={loading} />
    </ExperiencePage>
  );
}