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
    return <div className="p-4">Loading news...</div>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(news).map(([category, items]) => (
        <section key={category}>
          <h2 className="text-2xl font-bold mb-4">{CATEGORY_LABELS[category]}</h2>
          <div className="grid">
            {items.map((item, index) => (
              <article key={index} className="card">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="title">
                  {item.title}
                </a>
                <div className="meta">
                  {new Date(item.publishedAt).toLocaleString()} • {item.sourceTitle}
                </div>
                <div className="badges">
                  {item.sourceTitle && <span className="badge">{item.sourceTitle}</span>}
                  {item.link && (
                    <span className="badge">
                      {new URL(item.link).hostname.replace(/^www\./, '')}
                    </span>
                  )}
                </div>
                {item.description && <p className="text-sm text-slate-500" dangerouslySetInnerHTML={{ __html: item.description }}></p>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
