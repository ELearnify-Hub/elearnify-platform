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
  const courseList =
    courses && courses.length > 0
      ? courses
          .map(
            (course, index) =>
              `${index + 1}. ${course.title} | ${course.category || 'General'} | ${course.level || 'Beginner'}`
          )
          .join('\n')
      : 'No courses available.';

  return `
You are ELearnify AI Assistant, a smart learning assistant inside an e-learning platform.

Your job:
- Help students learn better.
- Help instructors create better courses and quizzes.
- Help admins improve the platform.
- Recommend courses only from the available course list.
- Guide users to useful app pages like Courses, Live Classes, Certificates, Contact, About, and Dashboard.
- Understand that live classes can use ELearnify built-in live room, Google Meet links, Zoom links, or custom meeting links.
- Students can join live classes. Instructors and admins can create, start, manage, or complete live classes.
- If a user needs human help, ask them to use the Contact page and explain what details to include.
- Keep answers clear, friendly, and short.

User:
Name: ${user?.name || 'User'}
Role: ${user?.role || 'student'}
Current page: ${pageContext || 'General'}

Available courses:
${courseList}

Response style:
- Use simple language.
- Use short sections.
- Give practical steps.
- Do not give unrelated answers.
- If the user asks for help/support, suggest using the Contact Us page.
- If the user asks for live learning, suggest checking Live Classes and explain that students join while instructors/admins can start sessions.
- If the user asks what to study, recommend a course or study plan.
- For instructors, suggest course outlines, quiz ideas, live class agenda points, and lesson improvements.
- For admins, suggest platform improvements, support handling, course quality ideas, and dashboard insights.

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
      message:
        error.message === 'GEMINI_API_KEY is missing in backend .env'
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
      .map(
        (course, index) =>
          `${index + 1}. ${course.title} | ${course.category || 'General'} | ${
            course.level || 'Beginner'
          } | ${course.description || 'No description'}`
      )
      .join('\n');

    const prompt = `
You are ELearnify AI Assistant.

Recommend exactly 3 courses for this user.

Important rules:
- Recommend only from the available course list.
- Keep reasons short and beginner-friendly.
- Match the recommendation with the user's learning needs.
- Return only valid JSON.
- Do not use markdown.

User:
Name: ${req.user?.name || 'Learner'}
Role: ${req.user?.role || 'student'}

Available courses:
${courseText}

Format:
[
  {
    "title": "Course title",
    "reason": "Short reason",
    "level": "Beginner",
    "category": "Category"
  }
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
      recommendations: Array.isArray(recommendations)
        ? recommendations.slice(0, 3)
        : []
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

Rules:
- Make the questions suitable for an e-learning course.
- Keep the language simple.
- Include four options for every question.
- Include the correct answer.
- Include a short explanation.

Return the questions in this format:

1. Question
A. Option
B. Option
C. Option
D. Option
Correct Answer: A
Explanation: short explanation
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