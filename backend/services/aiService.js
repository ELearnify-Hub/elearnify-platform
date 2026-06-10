// services/aiService.js
const { GoogleGenAI } = require('@google/genai');

let aiClient = null;

const getAIClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing in backend .env');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return aiClient;
};

const generateAIResponse = async (prompt) => {
  const ai = getAIClient();
  const model = process.env.AI_MODEL || 'gemini-2.5-flash';

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.5,
      maxOutputTokens: 900
    }
  });

  return response.text || 'Sorry, I could not generate a response right now.';
};

module.exports = { generateAIResponse };
