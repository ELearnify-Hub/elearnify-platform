import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const quickPrompts = [
  "What should I learn next?",
  "How do I join live classes?",
  "Help me prepare for a quiz",
  "How do I contact support?",
];

const AIAssistantWidget = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I am ELearnify AI. Ask me about courses, quizzes, certificates, or your learning path.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const hiddenPaths = ['/login', '/register', '/forgot-password'];
  const shouldHide = hiddenPaths.some((path) => location.pathname.startsWith(path));

  if (!isLoggedIn || shouldHide) return null;

  const sendMessage = async (customMessage) => {
    const finalMessage = customMessage || input;

    if (!finalMessage.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: finalMessage }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiAPI.ask({
        message: finalMessage,
        pageContext: location.pathname
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Sorry, I could not answer that right now.'
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: error?.response?.data?.message || 'Something went wrong. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700"
      >
        <Bot size={18} />
        Ask AI
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[92vw] max-w-md overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] shadow-2xl sm:right-6">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <div>
                <h3 className="font-semibold">ELearnify AI</h3>
                <p className="text-xs text-blue-100">Learning assistant</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-white/20"
              aria-label="Close AI assistant"
            >
              <X size={18} />
            </button>
          </div>

          <div className="h-80 space-y-3 overflow-y-auto bg-[var(--bg-secondary)] p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'bg-[var(--surface-1)] text-[var(--text-primary)] shadow-sm'
                }`}
              >
                {message.text}
              </div>
            ))}

            {loading && (
              <div className="w-fit rounded-2xl bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-secondary)] shadow-sm">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border-light)] bg-[var(--surface-1)] p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-900/30 dark:text-blue-200"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') sendMessage();
                }}
                placeholder="Ask about your learning..."
                className="flex-1 rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:opacity-60"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantWidget;
