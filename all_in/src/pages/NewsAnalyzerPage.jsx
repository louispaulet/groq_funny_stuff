// Trigger rebuild
import { useCallback, useEffect, useRef, useState } from 'react';
import { getExperienceById } from '../config/experiences';
import ExperiencePage from './ExperiencePage';
import NewsAnalyzerNav from '../components/newsanalyzer/NewsAnalyzerNav';
import NewsAnalyzerView from '../components/newsanalyzer/NewsAnalyzerView';
import { CATEGORY_ORDER } from '../components/newsanalyzer/constants';
import { CLASSIFICATION_MODELS } from '../components/newsanalyzer/modelConfig';
import { createRemoteObject } from '../lib/objectApi';
import { incrementNewsClassificationCount } from '../lib/newsAnalyzerStats';

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
  const modelIndexRef = useRef(0);
  const isMountedRef = useRef(true);
  const throttleTimeoutRef = useRef(null);

  useEffect(() => {
    classificationsRef.current = classifications;
  }, [classifications]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
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
    const modelsCount = CLASSIFICATION_MODELS.length;
    const modelInfo = modelsCount ? CLASSIFICATION_MODELS[modelIndexRef.current % modelsCount] : null;
    if (modelsCount) {
      modelIndexRef.current = (modelIndexRef.current + 1) % modelsCount;
    }

    (async () => {
      try {
        const { payload } = await createRemoteObject({
          structure: CLASSIFICATION_STRUCTURE,
          prompt: buildPrompt(item),
          strict: true,
          model: modelInfo?.id,
        });
        const sentiment = typeof payload?.sentiment === 'string' ? payload.sentiment.toLowerCase() : null;
        const normalized = sentiment === 'good' || sentiment === 'bad' ? sentiment : null;
        if (isMountedRef.current) {
          setClassifications((prev) => {
            const previousStatus = prev[key]?.status;
            const nextStatus = normalized ? 'complete' : 'error';
            if (normalized && previousStatus !== 'complete') {
              incrementNewsClassificationCount();
            }
            return {
              ...prev,
              [key]: {
                ...(prev[key] || {}),
                sentiment: normalized,
                status: nextStatus,
                modelId: modelInfo?.id || null,
                modelLabel: modelInfo?.label || null,
                error: normalized ? null : prev[key]?.error || null,
              },
            };
          });
        }
      } catch (error) {
        console.error('Failed to classify article', error);
        if (isMountedRef.current) {
          setClassifications((prev) => ({
            ...prev,
            [key]: {
              ...(prev[key] || {}),
              sentiment: null,
              status: 'error',
              modelId: modelInfo?.id || null,
              modelLabel: modelInfo?.label || null,
              error: error?.message || 'Classification failed',
            },
          }));
        }
      } finally {
        processingRef.current = false;
        if (throttleTimeoutRef.current) {
          clearTimeout(throttleTimeoutRef.current);
        }
        if (isMountedRef.current) {
          throttleTimeoutRef.current = setTimeout(() => {
            throttleTimeoutRef.current = null;
            runNextClassification();
          }, 1000);
        }
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchAllNews = async () => {
      setLoading(true);
      const allNews = {};

      await Promise.all(
        CATEGORY_ORDER.map(async (category) => {
          try {
            const url = `${BASE_URL}news/${category}`;
            const response = await fetch(url, { headers: { Accept: 'application/json' } });
            const payload = await response.json();
            allNews[category] = (payload?.items || []).slice(0, 10);
          } catch (error) {
            console.error(`Failed to fetch news for category: ${category}`, error);
            allNews[category] = [];
          }
        }),
      );

      if (cancelled || !isMountedRef.current) return;

      classificationQueueRef.current = [];
      processingRef.current = false;
      setClassifications({});
      setNews(allNews);
      setLoading(false);
    };

    fetchAllNews();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!Object.keys(news).length) return;

    const newTasks = [];
    const pendingUpdates = {};

    for (const category of CATEGORY_ORDER) {
      const items = news[category] || [];
      items.forEach((item, index) => {
        const key = `${category}-${index}`;
        if (!classificationsRef.current[key]) {
          newTasks.push({ category, index, item });
          pendingUpdates[key] = { sentiment: null, status: 'pending', modelId: null, modelLabel: null };
        }
      });
    }

    if (!newTasks.length) return;

    setClassifications((prev) => ({ ...prev, ...pendingUpdates }));
    classificationQueueRef.current.push(...newTasks);
    runNextClassification();
  }, [loading, news, runNextClassification]);

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
