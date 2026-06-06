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
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 dark:text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/30 dark:text-blue-100 text-sm px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-400/20">
            🎓 MERN Stack E-Learning Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl text-slate-950 dark:text-white">
            Learn New Skills,
            <span className="block text-blue-600 dark:text-yellow-300"> Advance Your Career</span>
          </h1>
          <p className="text-slate-600 dark:text-blue-100 text-lg max-w-xl">
            Access expert-led courses in web development, data science, design and more.
            Learn at your own pace with video lessons and downloadable materials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link to="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white force-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg">
              Browse Courses
            </Link>
            {!isLoggedIn && (
              <Link to="/register"
                className="border-2 border-blue-600 text-blue-700 dark:border-white dark:text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-white dark:hover:text-blue-700 transition-colors">
                Start Free Today
              </Link>
            )}
          </div>

          <div className="flex gap-10 mt-8 text-center">
            {[
              { value: '50+',  label: 'Courses'  },
              { value: '1K+',  label: 'Students' },
              { value: '20+',  label: 'Instructors' }
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-slate-950 dark:text-white">{stat.value}</div>
                <div className="text-slate-500 dark:text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-3">
            Why Choose ELearnify?
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
            Everything you need to learn effectively in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-xl bg-slate-50 border border-slate-200 dark:border-gray-800 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
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

      {!isLoggedIn && (
        <section className="bg-blue-700 dark:bg-slate-950 text-white force-white py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4 text-white force-white">Ready to Start Learning?</h2>
            <p className="text-blue-100 mb-8">
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
