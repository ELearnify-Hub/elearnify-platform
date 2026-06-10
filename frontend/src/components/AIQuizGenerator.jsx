import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { aiAPI } from '../services/api';

const AIQuizGenerator = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setQuiz('');

    try {
      const { data } = await aiAPI.quizIdeas({ topic, difficulty, count });
      setQuiz(data.success ? data.quiz : data.message || 'Could not generate quiz.');
    } catch (error) {
      setQuiz(error?.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="text-blue-600" />
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">AI Quiz Generator</h2>
          <p className="text-sm text-[var(--text-secondary)]">Generate quiz ideas for your course topic.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Topic, e.g. React Hooks"
          className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500"
        />

        <select
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
          className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <input
          type="number"
          min="3"
          max="10"
          value={count}
          onChange={(event) => setCount(event.target.value)}
          className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500"
        />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? 'Generating...' : 'Generate Quiz Ideas'}
      </button>

      {quiz && (
        <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-[var(--bg-secondary)] p-5 text-sm text-[var(--text-primary)]">
          {quiz}
        </pre>
      )}
    </div>
  );
};

export default AIQuizGenerator;
