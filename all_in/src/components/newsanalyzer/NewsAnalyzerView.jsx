export default function NewsAnalyzerView({ items, stats, status }) {
  if (!items) {
    return null;
  }

  return (
    <div>
      <div className="stats" dangerouslySetInnerHTML={{ __html: stats }}></div>
      <div className={`status ${status.tone}`}>{status.message}</div>
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
    </div>
  );
}