// Trigger rebuild
import { useCallback, useEffect, useRef, useState } from 'react';
import { getExperienceById } from '../config/experiences';
import ExperiencePage from './ExperiencePage';
import NewsAnalyzerNav from '../components/newsanalyzer/NewsAnalyzerNav';
import NewsAnalyzerView from '../components/newsanalyzer/NewsAnalyzerView';
import { CATEGORY_ORDER } from '../components/newsanalyzer/constants';
import { createRemoteObject } from '../lib/objectApi';

const BASE_URL = 'https://groq-endpoint.louispaulet13.workers.dev/';
const CLASSIFICATION_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    sentiment: {
      type: 'string',
      enum: ['good', 'bad'],
    },
  },
  required: ['sentiment'],
};

function buildPrompt(item) {
  const parts = [
    'Please classify the following news article while adhering the schema:',
    '',
    `Title: ${item.title || 'N/A'}`,
  ];
  if (item.description) parts.push(`Description: ${item.description}`);
  if (item.sourceTitle) parts.push(`Source: ${item.sourceTitle}`);
  if (item.publishedAt) parts.push(`Published At: ${item.publishedAt}`);
  if (item.content) parts.push(`Content: ${item.content}`);
  return parts.join('\n');
}

export default function NewsAnalyzerPage() {
  const experience = getExperienceById('newsanalyzer');
  const [news, setNews] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [classifications, setClassifications] = useState({});
  const classificationsRef = useRef(classifications);
  const classificationQueueRef = useRef([]);
  const processingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    classificationsRef.current = classifications;
  }, [classifications]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runNextClassification = useCallback(() => {
    if (!isMountedRef.current) return;
    if (processingRef.current) return;
    const nextTask = classificationQueueRef.current.shift();
    if (!nextTask) return;
    processingRef.current = true;
    const { category, index, item } = nextTask;
    const key = `${category}-${index}`;

    (async () => {
      try {
        const { payload } = await createRemoteObject({
          structure: CLASSIFICATION_STRUCTURE,
          prompt: buildPrompt(item),
          objectType: 'news-sentiment',
          strict: true,
        });
        const sentiment = typeof payload?.sentiment === 'string' ? payload.sentiment.toLowerCase() : null;
        const normalized = sentiment === 'good' || sentiment === 'bad' ? sentiment : null;
        if (isMountedRef.current) {
          setClassifications((prev) => ({
            ...prev,
            [key]: {
              sentiment: normalized,
              status: normalized ? 'complete' : 'error',
            },
          }));
        }
      } catch (error) {
        console.error('Failed to classify article', error);
        if (isMountedRef.current) {
          setClassifications((prev) => ({
            ...prev,
            [key]: {
              sentiment: null,
              status: 'error',
              error: error?.message || 'Classification failed',
            },
          }));
        }
      } finally {
        processingRef.current = false;
        if (isMountedRef.current) {
          setTimeout(runNextClassification, 0);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const fetchAllNews = async () => {
      setLoading(true);
      const allNews = {};
      for (const category of CATEGORY_ORDER) {
        try {
          const url = `${BASE_URL}news/${category}`;
          const response = await fetch(url, { headers: { Accept: 'application/json' } });
          const payload = await response.json();
          allNews[category] = (payload.items || []).slice(0, 5);
        } catch (error) {
          console.error(`Failed to fetch news for category: ${category}`, error);
          allNews[category] = [];
        }
      }
      classificationQueueRef.current = [];
      processingRef.current = false;
      if (isMountedRef.current) {
        setClassifications({});
        setNews(allNews);
        setLoading(false);
      }
    };

    fetchAllNews();
  }, []);

  useEffect(() => {
    if (!Object.keys(news).length) return;

    const newTasks = [];
    const pendingUpdates = {};

    for (const category of CATEGORY_ORDER) {
      const items = news[category] || [];
      items.forEach((item, index) => {
        const key = `${category}-${index}`;
        if (!classificationsRef.current[key]) {
          newTasks.push({ category, index, item });
          pendingUpdates[key] = { sentiment: null, status: 'pending' };
        }
      });
    }

    if (!newTasks.length) return;

    setClassifications((prev) => ({ ...prev, ...pendingUpdates }));
    classificationQueueRef.current.push(...newTasks);
    runNextClassification();
  }, [news, runNextClassification]);

  return (
    <ExperiencePage
      experience={experience}
      navigation={<NewsAnalyzerNav filter={filter} onFilterChange={setFilter} />}
    >
      <NewsAnalyzerView
        news={news}
        loading={loading}
        classifications={classifications}
        filter={filter}
      />
    </ExperiencePage>
  );
}
