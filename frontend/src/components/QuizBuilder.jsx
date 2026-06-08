// components/QuizBuilder.jsx
// Admin component for creating and managing quizzes
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, Trash2, ChevronDown, ChevronUp,
  Check, Settings,
  AlertCircle, Clock, Award
} from 'lucide-react';
import { quizAPI } from '../services/api';

// ── Single Question Editor ────────────────────────────────────────────────────
const QuestionEditor = ({ question, index, onChange, onDelete, questionCount }) => {
  const [expanded, setExpanded] = useState(true);

  const updateOption = (optIdx, value) => {
    const newOptions = [...question.options];
    newOptions[optIdx] = value;
    onChange({ ...question, options: newOptions });
  };

  const addOption = () => {
    if (question.options.length >= 6) return;
    onChange({ ...question, options: [...question.options, ''] });
  };

  const removeOption = (optIdx) => {
    if (question.options.length <= 2) return;
    const newOptions = question.options.filter((_, i) => i !== optIdx);
    // Adjust correctIndex if needed
    let newCorrect = question.correctIndex;
    if (optIdx === question.correctIndex) newCorrect = 0;
    else if (optIdx < question.correctIndex) newCorrect--;
    onChange({ ...question, options: newOptions, correctIndex: newCorrect });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      className="bg-white dark:bg-gray-800 border border-gray-200
        dark:border-gray-700 rounded-2xl overflow-hidden">

      {/* Question header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50
        dark:bg-gray-800/80 cursor-pointer"
        onClick={() => setExpanded(p => !p)}>
        <span className="w-7 h-7 rounded-full bg-blue-600 text-white
          text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <p className="flex-1 text-sm font-medium text-gray-800 dark:text-white
          truncate">
          {question.text || `Question ${index + 1}`}
        </p>
        <div className="flex items-center gap-2">
          {question.text && question.options.every(o => o.trim()) && (
            <span className="text-green-500" title="Complete">
              <Check size={14} />
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            disabled={questionCount <= 1}
            className="p-1.5 text-gray-400 hover:text-red-500
              hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg
              transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <Trash2 size={14} />
          </button>
          {expanded
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />
          }
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0    }}
            animate={{ height: 'auto' }}
            exit={{    height: 0    }}
            className="overflow-hidden">
            <div className="p-4 space-y-4">

              {/* Question text */}
              <div>
                <label className="block text-xs font-medium text-gray-600
                  dark:text-gray-400 mb-1.5">
                  Question Text *
                </label>
                <textarea
                  value={question.text}
                  onChange={e => onChange({ ...question, text: e.target.value })}
                  placeholder="Type your question here..."
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                    rounded-xl px-3 py-2.5 text-sm focus:outline-none
                    focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Answer options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600
                    dark:text-gray-400">
                    Answer Options * (select the correct one)
                  </label>
                  <button
                    onClick={addOption}
                    disabled={question.options.length >= 6}
                    className="text-xs text-blue-600 dark:text-blue-400
                      hover:underline disabled:opacity-40
                      disabled:cursor-not-allowed">
                    + Add option
                  </button>
                </div>

                <div className="space-y-2">
                  {question.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      {/* Correct answer radio */}
                      <button
                        onClick={() => onChange({
                          ...question,
                          correctIndex: optIdx
                        })}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2
                          flex items-center justify-center transition-colors
                          ${question.correctIndex === optIdx
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                          }`}
                        title="Mark as correct answer">
                        {question.correctIndex === optIdx && (
                          <Check size={12} className="text-white" />
                        )}
                      </button>

                      {/* Option text */}
                      <input
                        type="text"
                        value={opt}
                        onChange={e => updateOption(optIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        className={`flex-1 border rounded-xl px-3 py-2 text-sm
                          focus:outline-none focus:ring-2 transition-colors
                          ${question.correctIndex === optIdx
                            ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10 text-gray-900 dark:text-white focus:ring-green-400'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500'
                          }`}
                      />

                      {/* Remove option */}
                      <button
                        onClick={() => removeOption(optIdx)}
                        disabled={question.options.length <= 2}
                        className="flex-shrink-0 p-1.5 text-gray-300
                          hover:text-red-500 dark:text-gray-600
                          dark:hover:text-red-400 transition-colors
                          disabled:cursor-not-allowed">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Correct answer indicator */}
                {question.options[question.correctIndex] && (
                  <p className="text-xs text-green-600 dark:text-green-400
                    mt-2 flex items-center gap-1">
                    <Check size={11} />
                    Correct: Option {String.fromCharCode(65 + question.correctIndex)}
                    — "{question.options[question.correctIndex]}"
                  </p>
                )}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-medium text-gray-600
                  dark:text-gray-400 mb-1.5">
                  Explanation (shown to student after submitting)
                </label>
                <input
                  type="text"
                  value={question.explanation}
                  onChange={e => onChange({ ...question, explanation: e.target.value })}
                  placeholder="Optional: explain why this answer is correct..."
                  className="w-full border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                    rounded-xl px-3 py-2 text-sm focus:outline-none
                    focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Quiz Settings Panel ───────────────────────────────────────────────────────
const QuizSettings = ({ settings, onChange }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200
    dark:border-gray-700 rounded-2xl p-5">
    <h4 className="font-semibold text-gray-900 dark:text-white text-sm
      mb-4 flex items-center gap-2">
      <Settings size={16} className="text-blue-500" />
      Quiz Settings
    </h4>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      {/* Passing score */}
      <div>
        <label className="block text-xs font-medium text-gray-600
          dark:text-gray-400 mb-1.5 flex items-center gap-1">
          <Award size={12} /> Passing Score (%)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range" min="10" max="100" step="5"
            value={settings.passingScore}
            onChange={e => onChange({ ...settings, passingScore: Number(e.target.value) })}
            className="flex-1 accent-blue-600"
          />
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 w-10">
            {settings.passingScore}%
          </span>
        </div>
      </div>

      {/* Time limit */}
      <div>
        <label className="block text-xs font-medium text-gray-600
          dark:text-gray-400 mb-1.5 flex items-center gap-1">
          <Clock size={12} /> Time Limit (0 = unlimited)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number" min="0" max="180"
            value={settings.timeLimit}
            onChange={e => onChange({ ...settings, timeLimit: Number(e.target.value) })}
            className="w-full border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900 text-gray-900 dark:text-white
              rounded-xl px-3 py-2 text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-400 flex-shrink-0">min</span>
        </div>
      </div>

      {/* Max attempts */}
      <div>
        <label className="block text-xs font-medium text-gray-600
          dark:text-gray-400 mb-1.5">
          Max Attempts (0 = unlimited)
        </label>
        <input
          type="number" min="0" max="10"
          value={settings.maxAttempts}
          onChange={e => onChange({ ...settings, maxAttempts: Number(e.target.value) })}
          className="w-full border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-900 text-gray-900 dark:text-white
            rounded-xl px-3 py-2 text-sm focus:outline-none
            focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    {/* Toggle settings */}
    <div className="mt-4 space-y-3">
      {[
        { key: 'allowRetry',       label: 'Allow students to retry failed quizzes' },
        { key: 'showAnswers',      label: 'Show correct answers after submission'  },
        { key: 'shuffleQuestions', label: 'Shuffle question order per attempt'     },
      ].map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => onChange({ ...settings, [key]: !settings[key] })}
            className={`w-10 h-5 rounded-full relative transition-colors
              ${settings[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full
              shadow transition-transform
              ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {label}
          </span>
        </label>
      ))}
    </div>
  </div>
);

// ── Main QuizBuilder Component ────────────────────────────────────────────────
const QuizBuilder = ({ courseId, moduleId = null, existingQuiz = null, onClose, onSaved }) => {
  const isEdit = !!existingQuiz;

  const [title,       setTitle]       = useState(existingQuiz?.title       || '');
  const [description, setDescription] = useState(existingQuiz?.description || '');
  const [questions,   setQuestions]   = useState(
    existingQuiz?.questions?.length > 0
      ? existingQuiz.questions
      : [{ text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]
  );
  const [settings, setSettings] = useState({
    passingScore:     existingQuiz?.passingScore     || 70,
    timeLimit:        existingQuiz?.timeLimit        || 0,
    allowRetry:       existingQuiz?.allowRetry       ?? true,
    maxAttempts:      existingQuiz?.maxAttempts      || 0,
    showAnswers:      existingQuiz?.showAnswers      ?? true,
    shuffleQuestions: existingQuiz?.shuffleQuestions ?? false,
  });
  const [activeTab, setActiveTab] = useState('questions');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
    ]);
  };

  const updateQuestion = (index, updated) => {
    setQuestions(prev => prev.map((q, i) => i === index ? updated : q));
  };

  const deleteQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const validateQuiz = () => {
    if (!title.trim()) return 'Quiz title is required';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim())
        return `Question ${i + 1}: text is required`;
      if (q.options.some(o => !o.trim()))
        return `Question ${i + 1}: all options must be filled`;
      if (q.correctIndex < 0 || q.correctIndex >= q.options.length)
        return `Question ${i + 1}: select a correct answer`;
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateQuiz();
    if (validationError) { setError(validationError); return; }

    setSaving(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        courseId,
        moduleId,
        questions,
        ...settings
      };

      if (isEdit) {
        await quizAPI.update(existingQuiz._id, payload);
      } else {
        await quizAPI.create(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const completedQuestions = questions.filter(
    q => q.text.trim() && q.options.every(o => o.trim())
  ).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex
      items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1   }}
        className="bg-gray-50 dark:bg-gray-900 rounded-2xl w-full max-w-3xl
          max-h-[92vh] flex flex-col shadow-2xl border border-gray-200
          dark:border-gray-700">

        {/* ── Modal Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4
          bg-white dark:bg-gray-900 border-b border-gray-200
          dark:border-gray-700 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              {isEdit ? '✏️ Edit Quiz' : '📝 Create Quiz'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {completedQuestions}/{questions.length} questions complete
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100
              dark:hover:bg-gray-800 flex items-center justify-center
              transition-colors text-xl">
            ×
          </button>
        </div>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="flex gap-1 px-6 py-3 bg-white dark:bg-gray-900
          border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {[
            { id: 'questions', label: `Questions (${questions.length})` },
            { id: 'settings',  label: 'Settings' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium
                transition-all
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content (scrollable) ────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0  }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200
                dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3
                rounded-xl text-sm flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {activeTab === 'questions' && (
            <>
              {/* Title & Description */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200
                dark:border-gray-700 rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600
                    dark:text-gray-400 mb-1.5">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Module 1 Assessment"
                    className="w-full border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                      rounded-xl px-4 py-2.5 text-sm focus:outline-none
                      focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600
                    dark:text-gray-400 mb-1.5">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brief description of this quiz..."
                    className="w-full border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                      rounded-xl px-4 py-2.5 text-sm focus:outline-none
                      focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Settings summary */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <span className="text-xs bg-blue-50 dark:bg-blue-900/20
                    text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full
                    flex items-center gap-1">
                    <Award size={10} /> Pass: {settings.passingScore}%
                  </span>
                  <span className="text-xs bg-purple-50 dark:bg-purple-900/20
                    text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full
                    flex items-center gap-1">
                    <Clock size={10} />
                    {settings.timeLimit > 0
                      ? `${settings.timeLimit} min limit`
                      : 'No time limit'
                    }
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700
                    text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full">
                    {settings.allowRetry ? '🔄 Retry allowed' : '🔒 No retry'}
                  </span>
                </div>
              </div>

              {/* Questions */}
              {questions.map((q, idx) => (
                <QuestionEditor
                  key={idx}
                  question={q}
                  index={idx}
                  onChange={(updated) => updateQuestion(idx, updated)}
                  onDelete={() => deleteQuestion(idx)}
                  questionCount={questions.length}
                />
              ))}

              {/* Add question button */}
              <button
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-gray-300
                  dark:border-gray-600 text-gray-500 dark:text-gray-400
                  hover:border-blue-400 dark:hover:border-blue-500
                  hover:text-blue-600 dark:hover:text-blue-400
                  rounded-2xl text-sm font-medium flex items-center
                  justify-center gap-2 transition-colors">
                <PlusCircle size={16} /> Add Another Question
              </button>
            </>
          )}

          {activeTab === 'settings' && (
            <QuizSettings settings={settings} onChange={setSettings} />
          )}
        </div>

        {/* ── Footer Actions ───────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4
          bg-white dark:bg-gray-900 border-t border-gray-200
          dark:border-gray-700 rounded-b-2xl flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {completedQuestions === questions.length
              ? <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check size={12} /> All questions complete
                </span>
              : `${questions.length - completedQuestions} question(s) incomplete`
            }
          </p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="border border-gray-300 dark:border-gray-700
                text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl
                text-sm hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                text-white font-semibold px-5 py-2.5 rounded-xl text-sm
                transition-colors flex items-center gap-2">
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving...
                </>
              ) : isEdit ? 'Save Changes' : 'Create Quiz'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizBuilder;