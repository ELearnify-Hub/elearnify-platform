// pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Code2,
  Database,
  FileText,
  Flame,
  GraduationCap,
  Layers3,
  Palette,
  PlayCircle,
  Radio,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: PlayCircle,
    title: 'Video Lessons',
    desc: 'Watch expert-led lectures and continue learning at your own pace.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Radio,
    title: 'Live Classes',
    desc: 'Join real-time interactive classes through built-in rooms, Meet, or Zoom.',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    desc: 'Get study plans, course recommendations, quiz help, and platform guidance.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: Award,
    title: 'Certificates',
    desc: 'Complete courses and earn certificates that can be verified anytime.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
];

const CATEGORIES = [
  { title: 'Web Development', icon: Code2, bg: 'from-blue-500/10 to-cyan-500/10', tags: ['React', 'Node.js', 'MERN'], path: '/courses?category=Web%20Development' },
  { title: 'Mobile Development', icon: Smartphone, bg: 'from-emerald-500/10 to-teal-500/10', tags: ['Apps', 'UI', 'APIs'], path: '/courses?category=Mobile%20Development' },
  { title: 'Data Science', icon: Database, bg: 'from-purple-500/10 to-pink-500/10', tags: ['SQL', 'Python', 'Analysis'], path: '/courses?category=Data%20Science' },
  { title: 'Machine Learning', icon: Sparkles, bg: 'from-indigo-500/10 to-violet-500/10', tags: ['AI', 'Models', 'Projects'], path: '/courses?category=Machine%20Learning' },
  { title: 'Design', icon: Palette, bg: 'from-orange-500/10 to-rose-500/10', tags: ['UI/UX', 'Figma', 'Branding'], path: '/courses?category=Design' },
  { title: 'Business', icon: Briefcase, bg: 'from-yellow-500/10 to-amber-500/10', tags: ['Growth', 'Skills', 'Career'], path: '/courses?category=Business' },
];

const STATS = [
  { icon: Users, value: '1K+', label: 'Happy Students' },
  { icon: BookOpen, value: '50+', label: 'Courses' },
  { icon: FileText, value: '100+', label: 'Study Resources' },
  { icon: Star, value: '4.9', label: 'Learning Rating' },
];

const learningSteps = [
  { icon: Target, title: 'Choose your goal', text: 'Pick from dynamic course categories based on your interest.' },
  { icon: PlayCircle, title: 'Learn with content', text: 'Study through videos, PDFs, lessons, quizzes, and live classes.' },
  { icon: Bot, title: 'Ask AI anytime', text: 'Use ELearnify AI to explain concepts and plan your next steps.' },
  { icon: Award, title: 'Earn certificate', text: 'Complete courses and verify your achievements professionally.' },
];

const HomePage = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <section className="relative overflow-hidden border-b border-[var(--border-light)] bg-[var(--bg-secondary)] transition-colors duration-200">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div animate={{ y: [0, -16, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <motion.div animate={{ y: [0, 16, 0], x: [0, -10, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <motion.span initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
              <Flame size={14} className="text-yellow-500" /> Advanced MERN E-Learning Platform
            </motion.span>

            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-4xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-7xl">
              Learn live,
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">practice smarter.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              ELearnify brings courses, live classes, quizzes, certificates, and AI-powered study support into one clean learning platform.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[var(--shadow-lg)]">
                Browse Courses <ArrowRight size={18} />
              </Link>
              <Link to="/live-classes" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-8 py-4 text-base font-bold text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--bg-hover)]">
                Join Live Class <Radio size={18} />
              </Link>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative hidden lg:block">
            <div className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-lg)]">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><GraduationCap /></div>
                    <div><p className="font-bold">Live React Class</p><p className="text-sm text-blue-100">Starting today at 7 PM</p></div>
                  </div>
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold">LIVE</span>
                </div>
                <div className="grid gap-3">
                  {['Instructor-led session', 'AI-powered practice plan', 'Certificate-ready progress'].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                      <Sparkles size={16} /> <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {STATS.slice(0, 3).map(({ icon: Icon, value, label }) => (
                  <div key={label} className="rounded-2xl bg-[var(--bg-secondary)] p-4 text-center">
                    <Icon className="mx-auto mb-2 text-blue-600 dark:text-blue-400" size={20} />
                    <p className="font-extrabold text-[var(--text-primary)]">{value}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[var(--bg-primary)] py-16 transition-colors duration-200">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }, index) => (
            <motion.div key={label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-[1.5rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center shadow-[var(--shadow-sm)]">
              <Icon className="mx-auto mb-2 text-blue-600 dark:text-blue-400" size={22} />
              <p className="text-3xl font-extrabold text-[var(--text-primary)]">{value}</p>
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--bg-secondary)] py-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Explore categories</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)] md:text-4xl">Choose your learning path</h2>
            <p className="mt-3 text-[var(--text-secondary)]">Hover the cards to reveal actions and animated icons.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ title, icon: Icon, bg, tags, path }, index) => (
              <motion.div key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} whileHover={{ y: -6 }}>
                <Link to={path} className={`group relative block min-h-56 overflow-hidden rounded-[1.75rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)] transition hover:border-blue-300 hover:shadow-[var(--shadow-md)]`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-0 transition duration-300 group-hover:opacity-100`} />
                  <div className="absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-[var(--bg-secondary)] transition duration-300 group-hover:scale-125" />
                  <Icon className="absolute bottom-8 right-8 text-blue-500/40 transition duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:scale-125 group-hover:text-blue-600 dark:text-blue-400/50" size={54} />
                  <div className="relative">
                    <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{title}</h3>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">{tag}</span>)}
                    </div>
                    <span className="mt-8 inline-flex translate-y-2 items-center gap-2 text-sm font-bold text-blue-600 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:text-blue-400">
                      Explore Category <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-primary)] py-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Platform features</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)] md:text-4xl">Everything your e-learning project needs</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -5 }} className="group rounded-[1.75rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)] transition hover:border-blue-300 hover:shadow-[var(--shadow-md)]">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${bg} transition group-hover:scale-110`}>
                  <Icon size={24} className={color} />
                </div>
                <h3 className="mb-2 text-base font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-secondary)] py-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 shadow-[var(--shadow-sm)]">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">How it works</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">A complete student journey</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-4">
              {learningSteps.map(({ icon: Icon, title, text }, index) => (
                <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }} className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white"><Icon size={22} /></div>
                  <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {!isLoggedIn && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">Ready to start learning?</h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-blue-100">Join ELearnify and experience courses, AI, certificates, and live learning in one project.</p>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 font-bold text-blue-700 shadow-lg transition-colors hover:bg-blue-50">
                Create Free Account <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
