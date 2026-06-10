// controllers/aiController.js
const Course = require('../models/Course');
const ChatHistory = require('../models/ChatHistory');
const { generateAIResponse } = require('../services/aiService');

const cleanAIJson = (text) => {
  return String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
};

const buildSystemPrompt = ({ user, message, pageContext, courses }) => {
  const courseList = courses?.length
    ? courses
        .map((course, index) => (
          `${index + 1}. ${course.title} - ${course.category || 'General'} - ${course.level || 'Beginner'}`
        ))
        .join('\n')
    : 'No course data available.';

  return `
You are ELearnify AI Assistant, a helpful learning assistant inside an e-learning platform.

User details:
Name: ${user?.name || 'Learner'}
Role: ${user?.role || 'student'}
Current page/context: ${pageContext || 'General'}

Available published courses:
${courseList}

Rules:
- Keep answers short, clear, practical, and beginner-friendly.
- Focus only on learning, courses, quizzes, progress, certificates, dashboards, and platform help.
- If the user is a student, help them study and recommend what to learn next.
- If the user is an instructor, help with course outlines, lessons, quiz questions, and content improvements.
- If the user is an admin, help with platform insights, course quality, students, instructors, and improvements.
- Do not pretend to access data that is not provided.
- Do not give unrelated answers.
- When an action requires clicking in the app, guide the user to the correct page.

User message:
${message}
`;
};

const askAI = async (req, res) => {
  try {
    const { message, pageContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const courses = await Course.find({ isPublished: true })
      .select('title category level description')
      .limit(10);

    const prompt = buildSystemPrompt({
      user: req.user,
      message: message.trim(),
      pageContext,
      courses
    });

    const reply = await generateAIResponse(prompt);

    await ChatHistory.create({
      user: req.user._id,
      role: req.user.role,
      message: message.trim(),
      reply,
      pageContext: pageContext || ''
    });

    return res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('AI assistant error:', error.message);

    return res.status(500).json({
      success: false,
      message: error.message === 'GEMINI_API_KEY is missing in backend .env'
        ? error.message
        : 'AI assistant failed to respond'
    });
  }
};

const getAIRecommendations = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select('title description category level thumbnail')
      .limit(12);

    if (!courses.length) {
      return res.status(200).json({
        success: true,
        recommendations: []
      });
    }

    const courseText = courses
      .map((course, index) => (
        `${index + 1}. ${course.title} | ${course.category || 'General'} | ${course.level || 'Beginner'} | ${course.description || 'No description'}`
      ))
      .join('\n');

    const prompt = `
You are ELearnify AI Assistant.

Recommend exactly 3 courses for this user.

User:
Name: ${req.user?.name || 'Learner'}
Role: ${req.user?.role || 'student'}

Available courses:
${courseText}

Return only valid JSON. No markdown.
Format:
[
  { "title": "Course title", "reason": "Short reason", "level": "Beginner", "category": "Category" }
]
`;

    const aiReply = await generateAIResponse(prompt);

    let recommendations;

    try {
      recommendations = JSON.parse(cleanAIJson(aiReply));
    } catch (parseError) {
      recommendations = courses.slice(0, 3).map((course) => ({
        title: course.title,
        reason: 'This course can help you continue learning on ELearnify.',
        level: course.level || 'Beginner',
        category: course.category || 'General'
      }));
    }

    return res.status(200).json({
      success: true,
      recommendations: Array.isArray(recommendations) ? recommendations.slice(0, 3) : []
    });
  } catch (error) {
    console.error('AI recommendation error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations'
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const history = await ChatHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Chat history error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to load chat history'
    });
  }
};

const generateQuizIdeas = async (req, res) => {
  try {
    if (!['admin', 'instructor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can generate quiz ideas'
      });
    }

    const { topic, difficulty = 'beginner', count = 5 } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const safeCount = Math.min(Math.max(Number(count) || 5, 3), 10);

    const prompt = `
You are ELearnify AI Assistant.

Generate ${safeCount} ${difficulty}-level quiz questions for this topic:
${topic}

Return the questions in this format:

1. Question
A. Option
B. Option
C. Option
D. Option
Correct Answer: A
Explanation: short explanation

Keep it beginner-friendly and useful for an e-learning course.
`;

    const reply = await generateAIResponse(prompt);

    return res.status(200).json({
      success: true,
      quiz: reply
    });
  } catch (error) {
    console.error('Quiz generation error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz ideas'
    });
  }
};

module.exports = {
  askAI,
  getAIRecommendations,
  getChatHistory,
  generateQuizIdeas
};
