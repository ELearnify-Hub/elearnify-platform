// pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  FileText,
  Flame,
  PlayCircle,
  Shield,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: PlayCircle,
    title: 'Video Lessons',
    desc: 'Watch expert-led video lectures at your own pace, anywhere.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    icon: FileText,
    title: 'Study Materials',
    desc: 'Download PDFs, notes and reference materials anytime.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    icon: Award,
    title: 'Certificates',
    desc: 'Complete courses and earn certificates to showcase your skills.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20'
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    desc: 'JWT-secured accounts and Google OAuth keep your data safe.',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20'
  }
];

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Design',
  'Business'
];

const STATS = [
  { icon: BookOpen, value: '50+', label: 'Courses' },
  { icon: Users, value: '1K+', label: 'Students' },
  { icon: Star, value: '4.9', label: 'Avg Rating' },
  { icon: TrendingUp, value: '20+', label: 'Instructors' }
];

const HomePage = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <section className="relative overflow-hidden border-b border-[var(--border-light)] bg-[var(--bg-secondary)] transition-colors duration-200">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
                <Flame size={14} className="text-yellow-500" />
                MERN Stack E-Learning Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="text-4xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-7xl"
            >
              Learn New Skills,
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Advance Your Career
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg"
            >
              Access expert-led courses in web development, data science, design and more. Learn at your own pace with video lessons and downloadable materials.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-[var(--shadow-md)] transition-all hover:bg-blue-700 hover:shadow-[var(--shadow-lg)]"
              >
                Browse Courses
                <ArrowRight size={18} />
              </Link>

              {!isLoggedIn && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-8 py-4 text-base font-bold text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--bg-hover)]"
                >
                  Start Free Today
                </Link>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.32 }}
              className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center shadow-[var(--shadow-sm)]"
                >
                  <div className="mb-1 flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <Icon size={16} />
                    <span className="text-2xl font-extrabold text-[var(--text-primary)]">
                      {value}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-primary)] py-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
              Why Choose ELearnify?
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Everything you need to learn effectively, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)]"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${bg}`}>
                  <Icon size={24} className={color} />
                </div>
                <h3 className="mb-2 text-base font-bold text-[var(--text-primary)]">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-secondary)] py-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
              Explore Categories
            </h2>
            <p className="text-[var(--text-secondary)]">
              Find the perfect course for your learning goals
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/courses?category=${encodeURIComponent(cat)}`}
                  className="inline-flex rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:border-blue-400 hover:text-blue-600 hover:shadow-[var(--shadow-md)] dark:hover:text-blue-400"
                >
                  {cat}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {!isLoggedIn && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">
                Ready to Start Learning?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-blue-100">
                Join thousands of students already advancing their careers on ELearnify.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 font-bold text-blue-700 shadow-lg transition-colors hover:bg-blue-50"
              >
                Create Free Account
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
