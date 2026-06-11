import { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Award,
  Video,
  MessageCircle,
  ClipboardCheck
} from 'lucide-react';
import { aiAPI } from '../services/api';
import AIRecommendationCards from '../components/AIRecommendationCards';

const starterPrompts = [
  {
    icon: BookOpen,
    title: 'Recommend courses',
    prompt: 'Recommend the best courses for me from ELearnify.'
  },
  {
    icon: Lightbulb,
    title: 'Create study plan',
    prompt: 'Create a 7-day study plan for me.'
  },
  {
    icon: ClipboardCheck,
    title: 'Prepare for quiz',
    prompt: 'Help me prepare for my next quiz.'
  },
  {
    icon: Award,
    title: 'Explain certificates',
    prompt: 'How do certificates work on ELearnify?'
  },
  {
    icon: Video,
    title: 'Live class help',
    prompt: 'How can I join a live class?'
  },
  {
    icon: MessageCircle,
    title: 'Contact support',
    prompt: 'I need help contacting support.'
  }
];

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Welcome to ELearnify AI Assistant. I can help with courses, quizzes, certificates, study plans, live classes, and platform guidance.'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (customPrompt) => {
    const finalMessage = customPrompt || input;

    if (!finalMessage.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: finalMessage }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiAPI.ask({
        message: finalMessage,
        pageContext: 'AI Assistant Page'
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'I could not generate a response right now.'
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            error?.response?.data?.message ||
            'Something went wrong while contacting AI.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={24} />
                <span className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                  Smart Learning Assistant
                </span>
              </div>

              <h1 className="text-3xl font-bold md:text-4xl">
                ELearnify AI Assistant
              </h1>

              <p className="mt-3 max-w-2xl text-blue-100">
                Get help with courses, quizzes, study planning, recommendations,
                live classes, certificates, and platform actions in one place.
              </p>
            </div>

            <div className="hidden rounded-3xl bg-white/10 p-6 md:block">
              <Bot size={72} />
            </div>
          </div>
        </section>

        <AIRecommendationCards />

        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-3xl border border-[var(--border-light)] bg-[var(--surface-1)] shadow-[var(--shadow-sm)]">
            <div className="border-b border-[var(--border-light)] p-5">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Chat with ELearnify AI
              </h2>

              <p className="text-sm text-[var(--text-secondary)]">
                Ask learning-related questions and get helpful guidance.
              </p>
            </div>

            <div className="h-[440px] space-y-4 overflow-y-auto bg-[var(--bg-secondary)] p-5">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'ml-auto bg-blue-600 text-white'
                      : 'bg-[var(--surface-1)] text-[var(--text-primary)] shadow-sm'
                  }`}
                >
                  {message.text}
                </div>
              ))}

              {loading && (
                <div className="w-fit rounded-2xl bg-[var(--surface-1)] px-5 py-3 text-sm text-[var(--text-secondary)] shadow-sm">
                  ELearnify AI is thinking...
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-[var(--border-light)] p-4">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') sendMessage();
                }}
                placeholder="Ask anything about your learning..."
                className="flex-1 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-5 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>

          <aside className="rounded-3xl border border-[var(--border-light)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]">
            <h3 className="mb-4 font-bold text-[var(--text-primary)]">
              Try asking
            </h3>

            <div className="space-y-3">
              {starterPrompts.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => sendMessage(item.prompt)}
                    className="w-full rounded-2xl border border-[var(--border-light)] p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <div className="mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-300">
                      <Icon size={18} />
                      <span className="font-semibold">{item.title}</span>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)]">
                      {item.prompt}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default AIAssistantPage;