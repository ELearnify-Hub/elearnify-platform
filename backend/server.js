// server.js — Entry point of our Express application

// Load environment variables from .env file FIRST
// This must be the very first line before any other imports
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import our database connection function
const connectDB = require('./config/db');

// Initialize Express application
const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware Setup ─────────────────────────────────────────────────────────

// CORS Configuration
// Allows local development and deployed frontend
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite development server
    'http://localhost:4173', // Vite preview server
    process.env.FRONTEND_URL // Production frontend URL
  ].filter(Boolean),
  credentials: true
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/courses/:courseId/modules', require('./routes/moduleRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));

// ─── Health Check Route ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-Learning API is running!',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API Health Check: http://localhost:${PORT}/api/health\n`);
});