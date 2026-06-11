# 🎓 ELearnify — Advanced MERN Stack E-Learning Platform

ELearnify is a full-stack e-learning platform built using the MERN stack. It provides a complete online learning experience with role-based dashboards, course management, curriculum modules, video/PDF lessons, quizzes, certificates, live classes, AI-powered assistance, contact support, and a modern responsive UI.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## 🌐 Live Demo

Update these links after deployment:

- **Frontend:** `https://your-frontend-url.vercel.app`
- **Backend API:** `https://your-backend-url.onrender.com/api/health`

Local development:

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api/health`

---

## 📌 Project Overview

ELearnify is designed as a professional online learning platform where:

- Students can browse courses, enroll, learn through lessons, attempt quizzes, join live classes, and earn certificates.
- Instructors can create and manage courses, curriculum, lessons, quizzes, and live classes.
- Admins can manage the full platform, users, courses, live classes, analytics, certificates, and support messages.
- AI Assistant helps users with course recommendations, study planning, quiz support, instructor content ideas, and platform guidance.

The project has been enhanced with modern UI/UX, light/dark mode support, AI integration, live class support, contact/about pages, and dashboard improvements.

---

## ✨ Major Features

### 👨‍🎓 Student Features

- Student registration and login
- Google OAuth login support
- JWT-based protected access
- Browse/search/filter courses
- Enroll in courses
- View enrolled courses in My Courses
- Access course curriculum
- Watch video lessons
- Access PDF study materials
- Attempt quizzes
- View quiz results
- Earn certificates
- Verify certificates
- Join live classes
- Use ELearnify AI Assistant
- Contact support
- Manage profile and security settings
- Light/dark mode support

---

### 👨‍🏫 Instructor Features

- Instructor dashboard
- Create and manage courses
- Add/edit/delete modules
- Add video and PDF lessons
- Mark lessons as free preview
- Create/manage quizzes
- Use AI Quiz Generator
- Create live classes
- Start live classes
- Manage own live class sessions
- Use Google Meet, Zoom, Jitsi, or custom meeting links
- View course-related insights

---

### 👨‍💼 Admin Features

- Admin dashboard
- Role-based admin access
- Manage all users
- Manage all courses
- Publish/unpublish courses
- Manage curriculum
- Manage quizzes
- Manage certificates
- Manage live classes
- Start/complete/cancel live sessions
- View analytics and platform statistics
- View contact/support messages
- Manage students and instructors
- Access AI-powered platform help

---

### 🤖 ELearnify AI Assistant

The platform includes a dedicated AI assistant powered by Gemini API.

AI Assistant can help with:

- Course recommendations
- Study plan creation
- Quiz preparation
- Lesson explanation
- Certificate guidance
- Live class help
- Platform navigation
- Instructor quiz/content ideas
- Admin improvement suggestions

AI is available through:

- `/ai-assistant` page
- Floating **Ask AI** button
- AI recommendation cards
- AI quick prompts
- AI quiz generator for instructors/admins

---

### 🔴 Live Classes

ELearnify supports live class management for real-time learning.

Live class features:

- Admin and instructors can create live classes
- Students can view and join live classes
- Role-based permissions
- Scheduled date/time
- Duration support
- Course-linked live classes
- Live status: scheduled, live, completed, cancelled
- Meeting providers:
  - Jitsi embedded room
  - Google Meet link
  - Zoom link
  - Custom meeting link
- Start class button for admin/instructor
- Join class button for students
- Live class room page
- Agenda and resources support

---

### 🧾 Contact Us & Support

The platform includes a professional Contact Us page with:

- Contact form
- Support category
- Email
- Phone
- Address
- Social media links
- Help/support details
- MongoDB storage for contact messages
- Admin access to support messages

---

### ℹ️ About Us Page

The About Us page explains the platform professionally with:

- Mission and vision
- Platform highlights
- Interactive feature cards
- Learning journey section
- Stats/impact section
- Student, instructor, and admin benefits
- AI and live learning highlights

---

### 🎨 UI/UX Improvements

The frontend has been improved with:

- Modern learning-based UI
- Responsive layouts
- Dynamic homepage sections
- Animated category cards
- Hover effects
- Smooth transitions
- Better cards, buttons, forms, and tables
- Professional footer
- Cleaner navbar
- Light/dark mode improvements
- Reduced visual clutter
- Better empty/loading/error states

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, React Router DOM |
| Styling | Tailwind CSS, CSS variables, responsive design |
| UI Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs, Passport, Google OAuth |
| Security | Protected routes, role-based middleware, 2FA support |
| File Upload | Multer |
| AI | Google Gemini API |
| Live Classes | Jitsi Meet embed, Google Meet/Zoom/custom links |
| Email/Support | Contact message storage, Gmail config support |
| Deployment | Vercel frontend, Render backend, MongoDB Atlas |

---

## 📁 Project Structure

```text
e-learning-app/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── certificateController.js
│   │   ├── contactController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   ├── instructorController.js
│   │   ├── liveClassController.js
│   │   ├── moduleController.js
│   │   ├── notificationController.js
│   │   ├── quizController.js
│   │   ├── reviewController.js
│   │   └── twoFactorController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── ChatHistory.js
│   │   ├── ContactMessage.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── LiveClass.js
│   │   ├── Module.js
│   │   ├── Notification.js
│   │   ├── Quiz.js
│   │   ├── Review.js
│   │   └── User.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── instructorRoutes.js
│   │   ├── liveClassRoutes.js
│   │   ├── moduleRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── twoFactorRoutes.js
│   ├── services/
│   │   └── aiService.js
│   ├── uploads/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIAssistantWidget.jsx
│   │   │   ├── AIQuizGenerator.jsx
│   │   │   ├── AIRecommendationCards.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AboutUsPage.jsx
│   │   │   ├── AIAssistantPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ContactUsPage.jsx
│   │   │   ├── CourseDetailPage.jsx
│   │   │   ├── CoursesPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── InstructorDashboard.jsx
│   │   │   ├── LiveClassesPage.jsx
│   │   │   ├── LiveClassRoomPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create `backend/.env` locally.

> Never commit `.env` to GitHub.

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GEMINI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-2.5-flash

EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

Recommended `.gitignore` entries:

```gitignore
.env
backend/.env
frontend/.env
node_modules
backend/node_modules
frontend/node_modules
uploads
backend/uploads
```

---

## 🚀 Run Locally

### Prerequisites

- Node.js v18+ or v20 LTS recommended
- MongoDB Atlas account or local MongoDB
- Google OAuth credentials
- Gemini API key
- Gmail app password if email features are used

---

### 1. Clone the repository

```bash
git clone https://github.com/ELearnify-Hub/elearnify-platform.git
cd elearnify-platform
```

---

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create `backend/.env` and add the required environment variables.

Start backend:

```bash
npm run dev
```

Backend should run at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

### 3. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend should run at:

```text
http://localhost:5173
```

---

## 🔑 Main API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/profile` | Private | Get logged-in user profile |
| PUT | `/api/auth/profile` | Private | Update profile |
| GET | `/api/auth/google` | Public | Start Google OAuth |
| GET | `/api/auth/google/callback` | Public | Google OAuth callback |

---

### Courses

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/courses` | Public | Get published courses |
| GET | `/api/courses/:id` | Public | Get course details |
| POST | `/api/courses` | Admin/Instructor | Create course |
| PUT | `/api/courses/:id` | Admin/Instructor | Update course |
| DELETE | `/api/courses/:id` | Admin/Instructor | Delete course |
| PUT | `/api/courses/:id/publish` | Admin/Instructor | Publish/unpublish course |

---

### Curriculum / Modules

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/courses/:courseId/modules` | Private | Get course modules |
| POST | `/api/courses/:courseId/modules` | Instructor/Admin | Add module |
| PUT | `/api/courses/:courseId/modules/:moduleId` | Instructor/Admin | Update module |
| DELETE | `/api/courses/:courseId/modules/:moduleId` | Instructor/Admin | Delete module |
| POST | `/api/courses/:courseId/modules/:moduleId/lessons` | Instructor/Admin | Add lesson |
| PUT | `/api/courses/:courseId/modules/:moduleId/lessons/:lessonId` | Instructor/Admin | Update lesson |
| DELETE | `/api/courses/:courseId/modules/:moduleId/lessons/:lessonId` | Instructor/Admin | Delete lesson |

---

### Enrollments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/enrollments/:courseId` | Student | Enroll in course |
| GET | `/api/enrollments/my-courses` | Student | Get enrolled courses |
| DELETE | `/api/enrollments/:courseId` | Student | Unenroll from course |

---

### Quizzes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/quiz/course/:courseId` | Private | Get course quiz |
| POST | `/api/quiz` | Instructor/Admin | Create quiz |
| POST | `/api/quiz/:quizId/submit` | Student | Submit quiz |
| GET | `/api/quiz/result/:resultId` | Student | View quiz result |

---

### Certificates

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/certificates/generate` | Student | Generate certificate |
| GET | `/api/certificates/my-certificates` | Student | Get user certificates |
| GET | `/api/certificates/verify/:certificateId` | Public | Verify certificate |

---

### Live Classes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/live-classes` | Private | Get live classes |
| GET | `/api/live-classes/:id` | Private | Get single live class |
| POST | `/api/live-classes` | Instructor/Admin | Create live class |
| PUT | `/api/live-classes/:id` | Instructor/Admin | Update live class |
| PATCH | `/api/live-classes/:id/status` | Instructor/Admin | Update live class status |
| DELETE | `/api/live-classes/:id` | Instructor/Admin | Delete live class |

---

### AI Assistant

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/ai/ask` | Private | Ask ELearnify AI |
| GET | `/api/ai/recommendations` | Private | Get AI course recommendations |
| GET | `/api/ai/history` | Private | Get AI chat history |
| POST | `/api/ai/quiz-ideas` | Instructor/Admin | Generate quiz ideas |

---

### Contact / Support

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/contact` | Public | Send contact message |
| GET | `/api/contact` | Admin | View contact messages |

---

### Reviews / Notifications / Security

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reviews/:courseId` | Student | Add course review |
| GET | `/api/reviews/:courseId` | Public | Get course reviews |
| GET | `/api/notifications` | Private | Get notifications |
| POST | `/api/2fa/setup` | Private | Set up 2FA |
| POST | `/api/2fa/verify` | Private | Verify 2FA |

---

## 🧪 Testing Checklist

### General

- [ ] Home page opens correctly
- [ ] Courses page loads
- [ ] About page works
- [ ] Contact page works
- [ ] Navbar works before login
- [ ] Footer links work after login
- [ ] Light/dark mode works consistently
- [ ] Mobile responsive layout works

---

### Authentication

- [ ] Register user
- [ ] Login user
- [ ] Google OAuth login
- [ ] Logout
- [ ] Protected routes redirect correctly
- [ ] Role-based routes work

---

### Student

- [ ] Browse courses
- [ ] Enroll in course
- [ ] View My Courses
- [ ] Open curriculum
- [ ] Watch video lesson
- [ ] Open/download PDF lesson
- [ ] Attempt quiz
- [ ] View quiz result
- [ ] Generate/view certificate
- [ ] Verify certificate
- [ ] Join live class
- [ ] Use AI assistant
- [ ] Send contact message

---

### Instructor

- [ ] Instructor dashboard opens
- [ ] Create course
- [ ] Edit course
- [ ] Add module
- [ ] Add video lesson
- [ ] Add PDF lesson
- [ ] Create quiz
- [ ] Use AI quiz generator
- [ ] Create live class
- [ ] Start own live class
- [ ] Complete/cancel live class

---

### Admin

- [ ] Admin dashboard opens
- [ ] Manage courses
- [ ] Manage students
- [ ] Manage instructors
- [ ] Manage live classes
- [ ] Start/complete/cancel live classes
- [ ] View analytics
- [ ] View certificates
- [ ] View contact messages
- [ ] Use AI assistant

---

## 🧯 Common Issues & Fixes

### Vite is not recognized

Run inside `frontend`:

```bash
npm install
npm run dev
```

If needed:

```bash
npm install vite --save-dev
```

---

### Backend crashes because `.env` is missing

Create:

```text
backend/.env
```

Add MongoDB URI, JWT secret, session secret, frontend URL, Gemini API key, and OAuth keys.

---

### Gemini AI does not reply

Check:

```env
GEMINI_API_KEY=your_real_key
AI_MODEL=gemini-2.5-flash
```

Then restart backend.

---

### Dark mode looks mixed

Restart frontend and hard refresh browser:

```text
Ctrl + Shift + R
```

Make sure the latest `frontend/src/index.css` and Tailwind config are used.

---

### CORS error

Add your frontend URL to:

```env
FRONTEND_URL=http://localhost:5173
```

For deployed frontend, use your Vercel URL.

---

## 🔐 Security Notes

- Do not commit `.env`
- Do not expose Gemini API key in frontend
- Do not expose MongoDB credentials
- Do not expose Gmail app password
- Use strong JWT and session secrets
- Rotate keys if they are accidentally shared
- Keep API keys only in backend environment variables
- Use role-based middleware for admin/instructor/student permissions

---

## 🚢 Deployment Notes

### Frontend

Deploy `frontend` on Vercel.

Recommended environment variable:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

### Backend

Deploy `backend` on Render.

Required environment variables:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=https://your-frontend-url.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback
GEMINI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-2.5-flash
EMAIL_USER=your_email
EMAIL_PASS=your_gmail_app_password
```

---

## 📌 Final Project Status

ELearnify now includes the major features expected in a modern e-learning platform:

- Course marketplace
- Student, instructor, and admin dashboards
- Curriculum builder
- Video/PDF lessons
- Quizzes and results
- Certificates and verification
- Live classes
- AI assistant
- Contact/support system
- About page
- Reviews and notifications
- Authentication and role-based access
- Google OAuth
- 2FA/security settings
- Light/dark mode
- Professional responsive UI

---

## 👨‍💻 Author

Built as a complete MERN Stack e-learning platform project.

**Developer:** Arka Kundu  
**GitHub:** [@ELearnify-Hub](https://github.com/ELearnify-Hub)

---

## 📄 License

This project is for educational and portfolio purposes.
