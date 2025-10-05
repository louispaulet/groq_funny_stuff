import { CATEGORY_LABELS, CATEGORY_ORDER } from './constants';
import { CLASSIFICATION_MODELS, getClassificationModelById } from './modelConfig';

function getCategoryProgress(category, items, classifications) {
  return items.reduce(
    (acc, _item, index) => {
      const classification = classifications?.[`${category}-${index}`];
      if (!classification) return acc;

      if (classification.status === 'pending') acc.hasPending = true;
      if (classification.status === 'complete') acc.hasComplete = true;
      if (classification.status === 'error') acc.hasError = true;
      return acc;
    },
    { hasPending: false, hasComplete: false, hasError: false },
  );
}

function articleMatchesFilter(filter, classification) {
  if (filter === 'all') return true;
  if (!classification || !classification.sentiment) return false;
  return classification.sentiment === filter;
}

function getSentimentStyles(sentiment) {
  if (sentiment === 'good') {
    return 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-500/40';
  }
  if (sentiment === 'bad') {
    return 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/40';
  }
  return 'bg-white dark:bg-slate-800 border border-transparent';
}

export default function NewsAnalyzerView({
  news,
  loading,
  classifications,
  filter,
  activationCounts,
  onActivateCategory,
}) {
  if (loading) {
    return <div className="p-4 text-center">Loading news...</div>;
  }

  return (
    <div className="space-y-16">
      <section aria-label="Model legend" className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          Model legend
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          {CLASSIFICATION_MODELS.map((model) => (
            <span
              key={model.id}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300"
            >
              <span className={`h-3 w-3 rounded-full ${model.dotClass}`} aria-hidden="true"></span>
              <span>{model.label}</span>
            </span>
          ))}
        </div>
      </section>
      {CATEGORY_ORDER.map((category) => {
        const items = (news[category] || []).slice(0, 10);
        if (!items.length) return null;

        const { hasPending, hasComplete, hasError } = getCategoryProgress(category, items, classifications);
        const activationCount = activationCounts?.[category] || 0;
        const isActivated = activationCount > 0;
        let buttonLabel = 'Classify';
        let buttonDisabled = !items.length;

        if (isActivated) {
          if (hasPending) {
            buttonLabel = 'Classifying…';
            buttonDisabled = true;
          } else if (hasError) {
            buttonLabel = 'Retry classification';
            buttonDisabled = false;
          } else if (hasComplete) {
            buttonLabel = 'Classified';
            buttonDisabled = true;
          } else {
            buttonLabel = 'Classify';
            buttonDisabled = !items.length;
          }
        }

        return (
          <section key={category}>
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-slate-900 px-4 text-2xl font-serif text-gray-500 dark:text-gray-400">{CATEGORY_LABELS[category]}</span>
              </div>
            </div>
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!buttonDisabled && onActivateCategory) {
                    onActivateCategory(category);
                  }
                }}
                disabled={buttonDisabled}
                className={`inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white ${
                  buttonDisabled ? 'cursor-not-allowed opacity-60 hover:border-slate-300 hover:text-slate-600 dark:hover:border-slate-600 dark:hover:text-slate-200' : ''
                }`}
              >
                {buttonLabel}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, index) => {
                const key = `${category}-${index}`;
                const classification = classifications?.[key];
                if (!articleMatchesFilter(filter, classification)) return null;
                const sentimentClass = getSentimentStyles(classification?.sentiment);
                const modelInfo = getClassificationModelById(classification?.modelId);

                return (
                  <article
                    key={index}
                    className={`rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ${sentimentClass}`}
                  >
                    <div className="p-6">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl font-serif text-gray-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                      >
                        {item.title.replace(/Fixture:/g, '')}
                      </a>
                      <div className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                        {new Date(item.publishedAt).toLocaleString()} • {item.sourceTitle}
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                          {classification?.sentiment
                            ? `${classification.sentiment} news`
                            : classification?.status === 'pending'
                              ? 'classifying…'
                              : 'not classified'}
                        </span>
                        {modelInfo && (
                          <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                            <span className={`h-2.5 w-2.5 rounded-full ${modelInfo.dotClass}`} aria-hidden="true"></span>
                            <span>{modelInfo.label}</span>
                          </span>
                        )}
                        {classification?.status === 'error' && (
                          <span className="text-xs text-rose-500">Classification failed</span>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.sourceTitle && (
                          <span className="badge bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600">
                            {item.sourceTitle}
                          </span>
                        )}
                        {item.link && (
                          <span className="badge bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600">
                            {new URL(item.link).hostname.replace(/^www\./, '')}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p
                          className="mt-4 text-gray-600 dark:text-slate-300"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        ></p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
