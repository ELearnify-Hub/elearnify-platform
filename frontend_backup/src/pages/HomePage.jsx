// pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🎥', title: 'Video Lessons',    desc: 'Watch high-quality video lectures at your own pace.' },
  { icon: '📄', title: 'Study Materials',  desc: 'Download PDFs and reference materials anytime.' },
  { icon: '🏆', title: 'Certifications',   desc: 'Complete courses and showcase your new skills.' },
  { icon: '🔒', title: 'Secure Platform',  desc: 'JWT-secured accounts keep your data safe.' }
];

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Data Science',
  'Machine Learning', 'Design', 'Business'
];

const HomePage = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
          <span className="bg-blue-500 bg-opacity-40 text-blue-100 text-sm px-4 py-1.5 rounded-full">
            🎓 MERN Stack E-Learning Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
            Learn New Skills,
            <span className="text-yellow-300"> Advance Your Career</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Access expert-led courses in web development, data science, design and more.
            Learn at your own pace with video lessons and downloadable materials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link to="/courses"
              className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Browse Courses
            </Link>
            {!isLoggedIn && (
              <Link to="/register"
                className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white hover:text-blue-700 transition-colors">
                Start Free Today
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-8 text-center">
            {[
              { value: '50+',  label: 'Courses'  },
              { value: '1K+',  label: 'Students' },
              { value: '20+',  label: 'Instructors' }
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-3">
            Why Choose ELearnify?
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
            Everything you need to learn effectively in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Explore Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                to={`/courses?category=${encodeURIComponent(cat)}`}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-400 hover:text-blue-600 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-full shadow-sm transition-all text-sm font-medium">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      {!isLoggedIn && (
        <section className="bg-blue-700 dark:bg-slate-950 text-white py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-blue-100 dark:text-blue-200 mb-8">
              Join thousands of students already learning on ELearnify.
            </p>
            <Link to="/register"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-10 py-3 rounded-xl transition-colors shadow-lg">
              Create Free Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;