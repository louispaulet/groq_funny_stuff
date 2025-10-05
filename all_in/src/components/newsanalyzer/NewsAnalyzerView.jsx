import { CATEGORY_LABELS, CATEGORY_ORDER } from './constants';

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

export default function NewsAnalyzerView({ news, loading, classifications, filter }) {
  if (loading) {
    return <div className="p-4 text-center">Loading news...</div>;
  }

  return (
    <div className="space-y-16">
      {CATEGORY_ORDER.map((category) => {
        const items = (news[category] || []).slice(0, 5);
        if (!items.length) return null;

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, index) => {
                const key = `${category}-${index}`;
                const classification = classifications?.[key];
                if (!articleMatchesFilter(filter, classification)) return null;
                const sentimentClass = getSentimentStyles(classification?.sentiment);

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
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                          {classification?.sentiment
                            ? `${classification.sentiment} news`
                            : classification?.status === 'pending'
                              ? 'classifying…'
                              : 'not classified'}
                        </span>
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
