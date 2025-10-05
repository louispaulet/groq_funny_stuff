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

export default function NewsAnalyzerView({ news, loading }) {
  if (loading) {
    return <div className="p-4 text-center">Loading news...</div>;
  }

  return (
    <div className="space-y-12">
      {Object.entries(news).map(([category, items]) => (
        <section key={category}>
          <h2 className="text-3xl font-bold mb-6 text-blue-400">{CATEGORY_LABELS[category]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <article key={index} className="bg-slate-800/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-400/20 transition-shadow duration-300">
                <div className="p-6">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-slate-100 hover:text-blue-400 transition-colors duration-300">
                    {item.title}
                  </a>
                  <div className="mt-3 text-sm text-slate-400">
                    {new Date(item.publishedAt).toLocaleString()} • {item.sourceTitle}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.sourceTitle && <span className="badge bg-blue-500/20 text-blue-300 border-blue-400/50">{item.sourceTitle}</span>}
                    {item.link && (
                      <span className="badge bg-slate-700/50 text-slate-300 border-slate-600/50">
                        {new URL(item.link).hostname.replace(/^www\./, '')}
                      </span>
                    )}
                  </div>
                  {item.description && <p className="mt-4 text-slate-300" dangerouslySetInnerHTML={{ __html: item.description }}></p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}