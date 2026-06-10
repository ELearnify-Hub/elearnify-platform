import { useEffect, useState } from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import { aiAPI } from '../services/api';

const AIRecommendationCards = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const { data } = await aiAPI.recommendations();

        if (data.success) {
          setRecommendations(data.recommendations || []);
        }
      } catch {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
        <p className="text-sm text-[var(--text-secondary)]">Loading AI recommendations...</p>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
        <p className="text-sm text-[var(--text-secondary)]">No recommendations available yet. Publish courses first, then try again.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="text-blue-600" size={22} />
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Recommended by ELearnify AI</h2>
          <p className="text-sm text-[var(--text-secondary)]">Smart suggestions for your learning journey.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {recommendations.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)] p-5 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <BookOpen size={20} />
            </div>

            <h3 className="font-semibold text-[var(--text-primary)]">{item.title}</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.reason}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--surface-1)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                {item.level || 'Beginner'}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                {item.category || 'General'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AIRecommendationCards;
