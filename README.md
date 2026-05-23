# 🎓 ELearnify — MERN Stack E-Learning Platform

A full-stack e-learning web application built with MongoDB, Express.js, React.js, and Node.js.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

---

## 🌐 Live Demo

- **Frontend:** [https://elearning-frontend.vercel.app](https://elearning-frontend.vercel.app)
- **Backend API:** [https://elearning-backend.onrender.com/api/health](https://elearning-backend.onrender.com/api/health)

---

## 📸 Features

### 👨‍🎓 Student
- Register & login securely with JWT authentication
- Browse and search courses by category and level
- Enroll in courses with one click
- Watch uploaded video lessons
- Download study material PDFs
- View all enrolled courses in personal dashboard

### 👨‍💼 Admin
- Secure admin login with role-based access
- Create, edit, and delete courses
- Upload video lessons and PDF materials per course
- Publish / unpublish courses
- View all registered students

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router DOM, Axios, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| File Upload | Multer |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (DB) |

---

## 📁 Project Structure

e-learning-app/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Navbar, Footer, CourseCard, Loader
│   │   ├── pages/          # Home, Login, Register, Courses, Admin
│   │   ├── context/        # AuthContext (global auth state)
│   │   └── services/       # Axios API service layer
│   └── vercel.json
│
└── backend/                # Express REST API
├── config/             # MongoDB connection
├── controllers/        # Business logic
├── middleware/         # JWT auth, Multer upload
├── models/             # User, Course schemas
├── routes/             # API endpoints
└── server.js

---

## 🚀 Run Locally

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/ELearnify-Hub/elearnify-platform.git
cd elearnify-platform
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/elearning
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser

http://localhost:5173

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new student |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/profile` | Private | Get user profile |
| GET | `/api/auth/students` | Admin | Get all students |

### Courses
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/courses` | Public | Get all published courses |
| GET | `/api/courses/:id` | Public | Get single course |
| POST | `/api/courses` | Admin | Create course |
| PUT | `/api/courses/:id` | Admin | Update course |
| DELETE | `/api/courses/:id` | Admin | Delete course |
| POST | `/api/courses/:id/upload-video` | Admin | Upload video |
| POST | `/api/courses/:id/upload-pdf` | Admin | Upload PDF |
| PUT | `/api/courses/:id/publish` | Admin | Toggle publish |

### Enrollments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/enrollments/:courseId` | Student | Enroll in course |
| GET | `/api/enrollments/my-courses` | Student | Get enrolled courses |
| DELETE | `/api/enrollments/:courseId` | Student | Unenroll |

---

## 👨‍💻 Author

Built as a complete MERN Stack internship project.

**GitHub:** [@ELearnify-Hub](https://github.com/ELearnify-Hub)