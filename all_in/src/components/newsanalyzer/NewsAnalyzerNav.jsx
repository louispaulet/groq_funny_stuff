const FILTER_OPTIONS = [
  { value: 'all', label: 'All news' },
  { value: 'good', label: 'Good only' },
  { value: 'bad', label: 'Bad only' },
];

export default function NewsAnalyzerNav({ filter, onFilterChange }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-semibold">News Headlines by Category</h2>
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isActive = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-blue-500 bg-blue-500 text-white shadow-sm focus-visible:ring-blue-500'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-400'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
