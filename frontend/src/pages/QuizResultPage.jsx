// pages/QuizResultPage.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion }  from 'framer-motion';
import {
  CheckCircle, XCircle, RotateCcw, ArrowRight,
  Award, Clock, Target, BookOpen
} from 'lucide-react';
import { quizAPI } from '../services/api';

const QuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams();

  const routeResult = location.state?.result || null;
  const routeCertificate = location.state?.certificate || null;
  const [result, setResult] = useState(routeResult);
  const [loading, setLoading] = useState(!routeResult);
  const [error, setError] = useState('');

  useEffect(() => {
    if (routeResult) return;

    const fetchLatestResult = async () => {
      try {
        const { data } = await quizAPI.getMyResults(quizId);
        const attempts = data.attempts || [];

        if (!attempts.length) {
          setError('No quiz result found for this quiz yet.');
          return;
        }

        const latestAttempt = attempts[attempts.length - 1];
        const quizInfo = latestAttempt.quizId || {};
        const passingScore = quizInfo.passingScore ?? 70;

        setResult({
          score: latestAttempt.score ?? 0,
          passed: !!latestAttempt.passed,
          correctCount: latestAttempt.correctCount ?? 0,
          totalQuestions: latestAttempt.answers?.length || 0,
          passingScore,
          attemptNumber: latestAttempt.attemptNumber ?? attempts.length,
          timeTaken: latestAttempt.timeTaken ?? 0,
          gradedAnswers: [],
          canRetry: !latestAttempt.passed,
          message: latestAttempt.passed
            ? `You already passed this quiz with ${latestAttempt.score}%.`
            : `Your latest score is ${latestAttempt.score}%. You need ${passingScore}% to pass.`
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz result.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, [quizId, routeResult]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <p className="text-gray-600 dark:text-gray-300 font-medium">Loading quiz result...</p>
      </div>
    );
  }

  // When the page is opened directly and no saved attempt exists.
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="max-w-md text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz result not available
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {error || 'Please submit the quiz first or return to your course page.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    score, passed, correctCount, totalQuestions,
    passingScore, attemptNumber, timeTaken,
    gradedAnswers, canRetry, message
  } = result;

  const formatTime = (secs) => {
    if (!secs) return 'N/A';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Score Card ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1   }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
            border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">

          {/* Header banner */}
          <div className={`px-6 py-8 text-center text-white
            ${passed
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-red-500 to-orange-500'
            }`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}>
              {passed ? (
                <Award size={56} className="mx-auto mb-3 text-yellow-300" />
              ) : (
                <XCircle size={56} className="mx-auto mb-3 text-white/80" />
              )}
            </motion.div>

            <h1 className="text-2xl font-extrabold mb-2">
              {passed ? '🎉 You Passed!' : '😔 Not Quite There'}
            </h1>
            <p className="text-white/90 text-sm">
              {message}
            </p>

            {/* Score circle */}
            <div className="mt-6">
              <div className={`inline-flex items-center justify-center
                w-28 h-28 rounded-full border-4 border-white/30
                bg-white/20 mx-auto`}>
                <div className="text-center">
                  <p className="text-4xl font-extrabold">{score}%</p>
                  <p className="text-xs text-white/70">Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x
            divide-y sm:divide-y-0 divide-gray-100 dark:divide-gray-800">
            {[
              { icon: CheckCircle, label: 'Correct',   value: `${correctCount}/${totalQuestions}`, color: 'text-green-500' },
              { icon: Target,      label: 'Pass Mark',  value: `${passingScore}%`,                  color: 'text-blue-500'  },
              { icon: Clock,       label: 'Time Taken', value: formatTime(timeTaken),               color: 'text-purple-500'},
              { icon: BookOpen,    label: 'Attempt',    value: `#${attemptNumber}`,                 color: 'text-orange-500'},
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="p-4 text-center">
                <Icon size={20} className={`${color} mx-auto mb-1`} />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {routeCertificate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 mb-6">
            <h2 className="font-bold text-green-700 dark:text-green-400">
              🎉 Certificate Generated!
            </h2>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Certificate ID: {routeCertificate.certificateId}
            </p>
            <button
              onClick={() => navigate(`/courses/${routeCertificate.courseId}`)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
              Go to Course to Download
            </button>
          </motion.div>
        )}

        {/* ── Answer Review ────────────────────────────────────────── */}
        {gradedAnswers?.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Answer Review
            </h2>

            {gradedAnswers.map((q, idx) => (
              <motion.div
                key={q.questionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white dark:bg-gray-900 rounded-2xl border-2
                  overflow-hidden
                  ${q.isCorrect
                    ? 'border-green-200 dark:border-green-800'
                    : 'border-red-200 dark:border-red-800'
                  }`}>

                {/* Question header */}
                <div className={`px-5 py-3 flex items-center gap-3
                  ${q.isCorrect
                    ? 'bg-green-50 dark:bg-green-900/10'
                    : 'bg-red-50 dark:bg-red-900/10'
                  }`}>
                  {q.isCorrect
                    ? <CheckCircle size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                    : <XCircle    size={18} className="text-red-600   dark:text-red-400   flex-shrink-0" />
                  }
                  <span className="text-sm font-semibold text-gray-800
                    dark:text-white">
                    Q{idx + 1}: {q.questionText}
                  </span>
                </div>

                <div className="px-5 py-4 space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectOpt  = optIdx === q.correctIndex;
                    const isStudentAns  = optIdx === q.selectedIndex;
                    const isWrongAnswer = isStudentAns && !isCorrectOpt;

                    return (
                      <div key={optIdx}
                        className={`flex items-center gap-3 px-4 py-2.5
                          rounded-xl text-sm transition-colors
                          ${isCorrectOpt
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                            : isWrongAnswer
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                        <span className={`w-6 h-6 rounded-full flex items-center
                          justify-center text-xs font-bold flex-shrink-0
                          ${isCorrectOpt
                            ? 'bg-green-500 text-white'
                            : isWrongAnswer
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isCorrectOpt && (
                          <span className="text-xs text-green-600
                            dark:text-green-400 font-medium flex-shrink-0">
                            ✓ Correct
                          </span>
                        )}
                        {isStudentAns && isWrongAnswer && (
                          <span className="text-xs text-red-500
                            dark:text-red-400 font-medium flex-shrink-0">
                            Your answer
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-2 px-4 py-3 bg-blue-50
                      dark:bg-blue-900/10 border border-blue-200
                      dark:border-blue-800 rounded-xl">
                      <p className="text-xs text-blue-700 dark:text-blue-400
                        leading-relaxed">
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Action Buttons ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {canRetry && (
            <button
              onClick={() => navigate(`/quiz/${quizId}`, { replace: true })}
              className="flex-1 flex items-center justify-center gap-2
                bg-orange-500 hover:bg-orange-600 text-white font-semibold
                py-3 rounded-xl transition-colors">
              <RotateCcw size={16} /> Try Again
            </button>
          )}

          <button
            onClick={() => navigate(-2)}
            className="flex-1 flex items-center justify-center gap-2
              bg-blue-600 hover:bg-blue-700 text-white font-semibold
              py-3 rounded-xl transition-colors">
            <ArrowRight size={16} />
            {passed ? 'Continue Learning' : 'Back to Course'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;