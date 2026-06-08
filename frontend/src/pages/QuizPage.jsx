// pages/QuizPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import { motion, AnimatePresence }                  from 'framer-motion';
import {
  Clock, AlertTriangle, ChevronLeft,
  ChevronRight, BookOpen, Send
} from 'lucide-react';
import { quizAPI }  from '../services/api';
import Loader       from '../components/Loader';

const QuizPage = () => {
  const { quizId }     = useParams();
  const navigate       = useNavigate();
  const [quiz,          setQuiz]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [answers,       setAnswers]       = useState({});
  // answers = { [questionId]: selectedIndex }
  const [currentQ,      setCurrentQ]      = useState(0);
  const [timeLeft,      setTimeLeft]      = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const startTimeRef    = useRef(0);
  const [prevAttempts,  setPrevAttempts]  = useState([]);
  const timerRef        = useRef(null);
  const hasSubmittedRef = useRef(false);

  // ── Fetch quiz ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await quizAPI.getById(quizId);
        if (!data.quiz?.questions?.length) {
          setError('This quiz has no questions yet.');
          return;
        }

        startTimeRef.current = Date.now();
        setQuiz(data.quiz);
        setPrevAttempts(data.attempts || []);

        // Initialize timer if time limit is set
        if (data.quiz.timeLimit > 0) {
          setTimeLeft(data.quiz.timeLimit * 60); // Convert to seconds
        }

        // If the student already passed, do not open the quiz again.
        // The backend intentionally blocks re-submission after passing.
        // Previously this navigated to /results without result state, which caused
        // the "Quiz result not available" screen.
        if (data.hasPassed) {
          setError('You have already passed this quiz. You do not need to retake it.');
          return;
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, navigate]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting || hasSubmittedRef.current || !quiz?.questions?.length) return;

    if (!autoSubmit) {
      const unanswered = quiz.questions.filter(
        q => answers[q._id] === undefined
      ).length;

      if (unanswered > 0) {
        const confirmed = window.confirm(
          `You have ${unanswered} unanswered question(s). Submit anyway?`
        );
        if (!confirmed) return;
      }
    }

    hasSubmittedRef.current = true;
    setSubmitting(true);
    clearTimeout(timerRef.current);

    try {
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

      const formattedAnswers = quiz.questions.map(q => ({
        questionId:    q._id,
        selectedIndex: answers[q._id] ?? -1
      }));

      const { data } = await quizAPI.submit(quizId, {
        answers:   formattedAnswers,
        timeTaken
      });

      // Navigate to results page with the result data
      navigate(`/quiz/${quizId}/results`, {
        state: { result: data.result, quiz, certificate: data.certificate }
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
      hasSubmittedRef.current = false;
      setSubmitting(false);
    }
  }, [quiz, answers, quizId, submitting, navigate]);
  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      queueMicrotask(() => handleSubmit(true)); // Auto-submit when time runs out
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, handleSubmit]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };



  if (loading) return <Loader text="Loading quiz..." />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center
      bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {error}
        </h2>
        <button onClick={() => navigate(-1)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5
            rounded-xl text-sm font-medium transition-colors">
          Go Back
        </button>
      </div>
    </div>
  );

  const question       = quiz.questions[currentQ];
  const totalQ         = quiz.questions.length;
  const answeredCount  = Object.keys(answers).length;
  const progressPct    = (answeredCount / totalQ) * 100;
  const isLastQuestion = currentQ === totalQ - 1;
  const isTimeCritical = timeLeft !== null && timeLeft <= 60;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header Bar ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200
        dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center
          justify-between">

          {/* Quiz info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg
              flex items-center justify-center">
              <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {quiz.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pass with {quiz.passingScore}%
                {prevAttempts.length > 0 && (
                  <span className="ml-2 text-orange-500">
                    Attempt #{prevAttempts.length + 1}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Timer */}
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl
              font-mono font-bold text-sm transition-colors
              ${isTimeCritical
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 animate-pulse'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
              <Clock size={14} />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1">
          <motion.div
            className="h-full bg-blue-600"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Question counter + navigation dots */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Question {currentQ + 1} of {totalQ}
          </p>
          <div className="flex gap-1.5">
            {quiz.questions.map((q, idx) => (
              <button
                key={q._id}
                onClick={() => setCurrentQ(idx)}
                className={`w-7 h-7 rounded-full text-xs font-bold
                  transition-all
                  ${idx === currentQ
                    ? 'bg-blue-600 text-white scale-110'
                    : answers[q._id] !== undefined
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                title={`Question ${idx + 1}`}>
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* ── Question Card ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20  }}
            animate={{ opacity: 1, x: 0   }}
            exit={{    opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
              border border-gray-100 dark:border-gray-800 p-6 mb-6">

            {/* Question text */}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white
              mb-6 leading-relaxed">
              {question.text}
            </h2>

            {/* Answer options */}
            <div className="space-y-3">
              {question.options.map((option, optIdx) => {
                const isSelected = answers[question._id] === optIdx;
                return (
                  <motion.button
                    key={optIdx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswer(question._id, optIdx)}
                    className={`w-full text-left flex items-center gap-4
                      px-5 py-4 rounded-2xl border-2 transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>

                    {/* Option letter */}
                    <div className={`w-9 h-9 rounded-xl flex items-center
                      justify-center font-bold text-sm flex-shrink-0
                      transition-colors
                      ${isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </div>

                    <span className={`text-sm font-medium transition-colors
                      ${isSelected
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {option}
                    </span>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-5 h-5 bg-blue-600 rounded-full
                          flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor"
                          viewBox="0 0 20 20">
                          <path fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"/>
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ───────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-2 px-5 py-2.5 border
              border-gray-300 dark:border-gray-700 text-gray-700
              dark:text-gray-300 rounded-xl text-sm font-medium
              hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft size={16} /> Previous
          </button>

          {/* Progress summary */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {answeredCount}
            </span>/{totalQ} answered
          </p>

          {isLastQuestion ? (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700
                disabled:bg-green-300 text-white px-6 py-2.5 rounded-xl
                text-sm font-semibold transition-colors">
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none"
                    viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={15} /> Submit Quiz
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(p => Math.min(totalQ - 1, p + 1))}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                text-white px-5 py-2.5 rounded-xl text-sm font-medium
                transition-colors">
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* ── Unanswered warning ───────────────────────────────── */}
        {answeredCount < totalQ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-start gap-2 text-amber-600
              dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20
              border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              {totalQ - answeredCount} question(s) still unanswered.
              You can submit anytime, but unanswered questions will be marked wrong.
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;