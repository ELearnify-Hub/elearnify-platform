// controllers/quizController.js
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const { checkAndIssueCertificate } = require('./certificateController');
const { createNotification } = require('./notificationController');

// ── Helpers ───────────────────────────────────────────────────────────────────
const normalizeModuleId = (moduleId) => {
  // Empty string / undefined should mean a course-level quiz, not an ObjectId cast error
  if (moduleId === undefined || moduleId === null || moduleId === '') return null;
  return moduleId;
};

const normalizeQuestions = (questions = []) => {
  return questions.map((q) => {
    let correctIndex = q.correctIndex;

    // Backward compatibility with older frontend field names
    if (correctIndex === undefined && q.correct !== undefined) {
      correctIndex = q.correct;
    }

    if (correctIndex === undefined && q.correctAnswer !== undefined) {
      correctIndex = q.correctAnswer;
    }

    correctIndex = Number(correctIndex);

    return {
      ...(q._id ? { _id: q._id } : {}),
      text: String(q.text || '').trim(),
      options: Array.isArray(q.options)
        ? q.options.map((opt) => String(opt || '').trim())
        : [],
      correctIndex: Number.isNaN(correctIndex) ? 0 : correctIndex,
      explanation: q.explanation || '',
      points: q.points ? Number(q.points) : 1
    };
  });
};

const validateQuestions = (questions = []) => {
  if (!Array.isArray(questions) || questions.length < 1) {
    return 'Quiz must have at least 1 question';
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    if (!q.text?.trim()) {
      return `Question ${i + 1} is missing text`;
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      return `Question ${i + 1} must have at least 2 options`;
    }

    if (q.options.some((opt) => !String(opt || '').trim())) {
      return `Question ${i + 1} has an empty option`;
    }

    if (
      q.correctIndex === undefined ||
      q.correctIndex < 0 ||
      q.correctIndex >= q.options.length
    ) {
      return `Question ${i + 1} has an invalid correct answer`;
    }
  }

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN — QUIZ MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// ── @route  POST /api/quiz ────────────────────────────────────────────────────
// @desc   Create a new quiz
// @access Admin
const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      moduleId,
      questions,
      passingScore,
      timeLimit,
      allowRetry,
      maxAttempts,
      showAnswers,
      shuffleQuestions
    } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const cleanQuestions = normalizeQuestions(questions);
    const questionError = validateQuestions(cleanQuestions);

    if (questionError) {
      return res.status(400).json({
        success: false,
        message: questionError
      });
    }

    const quiz = await Quiz.create({
      title,
      description: description || '',
      courseId,
      moduleId: normalizeModuleId(moduleId),
      questions: cleanQuestions,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 0,
      allowRetry: allowRetry !== undefined ? allowRetry : true,
      maxAttempts: maxAttempts || 0,
      showAnswers: showAnswers !== undefined ? showAnswers : true,
      shuffleQuestions: shuffleQuestions !== undefined ? shuffleQuestions : false,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);

      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    console.error('Create quiz error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ── @route  GET /api/quiz/course/:courseId ────────────────────────────────────
// @desc   Get all quizzes for a course
// @access Admin / Enrolled Students
const getQuizzesByCourse = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';

    const query = Quiz.find({
      courseId: req.params.courseId,
      isActive: true
    });

    if (!isAdmin) {
      query.select('-questions.correctIndex -questions.explanation');
    }

    const quizzes = await query;

    res.status(200).json({
      success: true,
      quizzes
    });

  } catch (error) {
    console.error('Get quizzes error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ── @route  GET /api/quiz/:quizId ─────────────────────────────────────────────
// @desc   Get a single quiz
// @access Enrolled Students / Admin
const getQuizById = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';

    const selectFields = isAdmin
      ? ''
      : '-questions.correctIndex -questions.explanation';

    const quiz = await Quiz.findById(req.params.quizId).select(selectFields);

    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    let attempts = [];

    if (req.user) {
      attempts = await QuizAttempt.find({
        quizId: req.params.quizId,
        userId: req.user._id
      }).sort({ attemptNumber: -1 });
    }

    res.status(200).json({
      success: true,
      quiz,
      attempts,
      totalAttempts: attempts.length,
      bestScore: attempts.length > 0
        ? Math.max(...attempts.map((a) => a.score))
        : null,
      hasPassed: attempts.some((a) => a.passed)
    });

  } catch (error) {
    console.error('Get quiz error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ── @route  PUT /api/quiz/:quizId ─────────────────────────────────────────────
// @desc   Update a quiz
// @access Admin
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const {
      title,
      description,
      courseId,
      moduleId,
      questions,
      passingScore,
      timeLimit,
      allowRetry,
      maxAttempts,
      showAnswers,
      shuffleQuestions,
      isActive
    } = req.body;

    if (courseId) {
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      quiz.courseId = courseId;
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Quiz title is required'
        });
      }

      quiz.title = String(title).trim();
    }

    if (description !== undefined) {
      quiz.description = description || '';
    }

    if (moduleId !== undefined) {
      quiz.moduleId = normalizeModuleId(moduleId);
    }

    if (questions !== undefined) {
      const cleanQuestions = normalizeQuestions(questions);
      const questionError = validateQuestions(cleanQuestions);

      if (questionError) {
        return res.status(400).json({
          success: false,
          message: questionError
        });
      }

      quiz.questions = cleanQuestions;
    }

    if (passingScore !== undefined) quiz.passingScore = Number(passingScore);
    if (timeLimit !== undefined) quiz.timeLimit = Number(timeLimit);
    if (allowRetry !== undefined) quiz.allowRetry = Boolean(allowRetry);
    if (maxAttempts !== undefined) quiz.maxAttempts = Number(maxAttempts);
    if (showAnswers !== undefined) quiz.showAnswers = Boolean(showAnswers);
    if (shuffleQuestions !== undefined) quiz.shuffleQuestions = Boolean(shuffleQuestions);
    if (isActive !== undefined) quiz.isActive = Boolean(isActive);

    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz updated',
      quiz
    });

  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      const message = error.name === 'ValidationError'
        ? Object.values(error.errors).map((e) => e.message).join(', ')
        : `Invalid ${error.path || 'value'}: ${error.value}`;

      return res.status(400).json({
        success: false,
        message
      });
    }

    console.error('Update quiz error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ── @route  DELETE /api/quiz/:quizId ──────────────────────────────────────────
// @desc   Delete a quiz and all its attempts
// @access Admin
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    await QuizAttempt.deleteMany({
      quizId: req.params.quizId
    });

    await Quiz.findByIdAndDelete(req.params.quizId);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted'
    });

  } catch (error) {
    console.error('Delete quiz error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT — QUIZ TAKING
// ─────────────────────────────────────────────────────────────────────────────

// ── @route  POST /api/quiz/:quizId/submit ─────────────────────────────────────
// @desc   Submit quiz answers and get results
// @access Private
const submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const previousAttempts = await QuizAttempt.find({
      quizId: quiz._id,
      userId: req.user._id
    });

    const alreadyPassed = previousAttempts.some((a) => a.passed);

    if (alreadyPassed) {
      return res.status(400).json({
        success: false,
        message: 'You have already passed this quiz!'
      });
    }

    if (!quiz.allowRetry && previousAttempts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Retry is not allowed for this quiz'
      });
    }

    if (quiz.maxAttempts > 0 && previousAttempts.length >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${quiz.maxAttempts} attempt(s) allowed for this quiz`
      });
    }

    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedAnswers = [];

    quiz.questions.forEach((question) => {
      totalPoints += question.points;

      const studentAnswer = answers?.find(
        (a) => a.questionId?.toString() === question._id.toString()
      );

      const selectedIndex = studentAnswer?.selectedIndex ?? -1;
      const isCorrect = selectedIndex === question.correctIndex;

      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      gradedAnswers.push({
        questionId: question._id,
        questionText: question.text,
        options: question.options,
        selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect,
        explanation: question.explanation,
        points: question.points
      });
    });

    const score = totalPoints > 0
      ? Math.round((earnedPoints / totalPoints) * 100)
      : 0;

    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      userId: req.user._id,
      courseId: quiz.courseId,
      answers: answers || [],
      score,
      correctCount,
      passed,
      attemptNumber: previousAttempts.length + 1,
      timeTaken: timeTaken || 0,
      completedAt: new Date()
    });

    // Create quiz result notification
    try {
      await createNotification({
        userId: req.user._id,
        type: 'quiz_result',
        title: passed ? '🎉 Quiz Passed!' : '📝 Quiz Submitted',
        message: `You scored ${score}% on "${quiz.title}"`,
        link: `/quiz/${quiz._id}/results`
      });
    } catch (notificationError) {
      console.error('Quiz notification error:', notificationError);
    }

    const certificate = await checkAndIssueCertificate(
      req.user._id,
      quiz.courseId,
      req.user.name
    );

    const result = {
      score,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
      passingScore: quiz.passingScore,
      attemptNumber: attempt.attemptNumber,
      timeTaken: timeTaken || 0,
      gradedAnswers: quiz.showAnswers ? gradedAnswers : [],
      canRetry: quiz.allowRetry && !passed && (
        quiz.maxAttempts === 0 ||
        attempt.attemptNumber < quiz.maxAttempts
      ),
      message: passed
        ? `🎉 Congratulations! You passed with ${score}%!`
        : `😔 You scored ${score}%. You need ${quiz.passingScore}% to pass.`
    };

    return res.status(200).json({
      success: true,
      message: passed ? 'Quiz passed!' : 'Quiz submitted',
      attempt,
      result,
      certificate
    });

  } catch (error) {
    console.error('Submit quiz error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ── @route  GET /api/quiz/:quizId/results ─────────────────────────────────────
// @desc   Get a student's quiz results history
// @access Private
const getMyResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      quizId: req.params.quizId,
      userId: req.user._id
    })
      .sort({ attemptNumber: 1 })
      .populate('quizId', 'title passingScore');

    res.status(200).json({
      success: true,
      attempts,
      bestScore: attempts.length > 0
        ? Math.max(...attempts.map((a) => a.score))
        : 0,
      hasPassed: attempts.some((a) => a.passed),
      totalAttempts: attempts.length
    });

  } catch (error) {
    console.error('Get results error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ── @route  GET /api/quiz/:quizId/admin-results ───────────────────────────────
// @desc   Get all student results for a quiz
// @access Admin
const getAdminResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      quizId: req.params.quizId
    })
      .populate('userId', 'name email')
      .sort({ completedAt: -1 });

    const passCount = attempts.filter((a) => a.passed).length;

    const avgScore = attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        )
      : 0;

    res.status(200).json({
      success: true,
      attempts,
      stats: {
        totalAttempts: attempts.length,
        passCount,
        failCount: attempts.length - passCount,
        passRate: attempts.length > 0
          ? Math.round((passCount / attempts.length) * 100)
          : 0,
        avgScore
      }
    });

  } catch (error) {
    console.error('Get admin results error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getMyResults,
  getAdminResults
};