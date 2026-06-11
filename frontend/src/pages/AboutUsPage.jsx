import { motion } from 'framer-motion';
import { ArrowRight, Award, BookOpen, Bot, CalendarDays, CheckCircle, GraduationCap, Layers3, Radio, Sparkles, Target, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const platformStats = [
  { value: '50+', label: 'Skill-based courses', icon: BookOpen },
  { value: '1K+', label: 'Active learners', icon: Users },
  { value: '100+', label: 'Lessons and resources', icon: Layers3 },
  { value: '24/7', label: 'AI learning guidance', icon: Bot },
];

const featureCards = [
  {
    icon: BookOpen,
    title: 'Structured Courses',
    text: 'Organized modules, videos, PDFs, lessons, quizzes, and certificates in one learning flow.',
  },
  {
    icon: Radio,
    title: 'Live Classes',
    text: 'Interactive sessions using built-in live rooms, Google Meet, Zoom, or custom class links.',
  },
  {
    icon: Bot,
    title: 'AI Study Support',
    text: 'ELearnify AI helps learners with study plans, recommendations, quizzes, and platform guidance.',
  },
  {
    icon: Award,
    title: 'Certificates',
    text: 'Students can complete learning goals and verify certificates professionally.',
  },
];

const timeline = [
  { icon: GraduationCap, title: 'Discover', text: 'Explore categories and pick courses that match your goals.' },
  { icon: CalendarDays, title: 'Attend', text: 'Join lessons, live classes, and guided instructor sessions.' },
  { icon: Target, title: 'Practice', text: 'Attempt quizzes and use AI to strengthen weak topics.' },
  { icon: CheckCircle, title: 'Achieve', text: 'Track progress and earn verifiable certificates.' },
];

const AboutUsPage = () => {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10 text-[var(--text-primary)] transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-[var(--shadow-lg)] md:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-10 hidden h-36 w-36 rounded-[2rem] bg-white/10 p-8 md:block">
            <Sparkles className="h-full w-full text-white/80" />
          </div>

          <div className="relative max-w-4xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-blue-50">
              <Zap size={16} /> About ELearnify
            </span>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              A smarter way to learn, teach, and grow online.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-blue-100">
              ELearnify is a modern e-learning platform designed to connect students, instructors, and administrators in one simple digital learning environment. Our goal is to make online education accessible, organized, interactive, and result-oriented.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-blue-700 hover:bg-blue-50">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link to="/live-classes" className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/20">
                View Live Classes
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platformStats.map(({ icon: Icon, value, label }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -5 }}
              className="group rounded-[1.75rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)] transition hover:border-blue-300 hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:rotate-3 group-hover:scale-110 dark:bg-blue-900/30 dark:text-blue-400">
                <Icon size={24} />
              </div>
              <p className="text-3xl font-extrabold text-[var(--text-primary)]">{value}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 shadow-[var(--shadow-sm)]">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Our mission</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">Education that feels organized, interactive, and supportive.</h2>
            <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">
              Our mission is to provide a clean, student-friendly, and technology-powered platform where learners can discover courses, track progress, attend live classes, practice quizzes, earn certificates, and receive AI-powered learning support.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">
              ELearnify is built for modern digital education. It supports instructors in creating better course content and helps students stay focused with interactive tools, recommendations, and progress tracking.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureCards.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-[var(--shadow-md)]"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 opacity-0 transition group-hover:opacity-100" />
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:text-blue-400">
                  <Icon size={24} />
                </div>
                <h3 className="relative font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 shadow-[var(--shadow-sm)]">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Learning journey</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">From first lesson to final certificate</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {timeline.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="group rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 text-center transition hover:-translate-y-1"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[var(--shadow-sm)] transition group-hover:scale-110">
                  <Icon size={23} />
                </div>
                <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutUsPage;
