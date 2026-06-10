// pages/CoursesPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';

const CATEGORIES = [
  'All',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Design',
  'Business'
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};
        if (search) params.search = search;
        if (category !== 'All') params.category = category;
        if (level !== 'All') params.level = level;

        const { data } = await courseAPI.getAll(params);
        setCourses(data.courses || []);
      } catch (err) {
        setError('Failed to load courses. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCourses, 500);
    return () => clearTimeout(timer);
  }, [search, category, level]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">
            All Courses
          </h1>
          <p className="text-[var(--text-secondary)]">
            Explore our library of expert-led courses
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-sm)] md:flex-row">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <Loader text="Fetching courses..." />
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center text-[var(--text-muted)]">
            <div className="mb-4 text-5xl">📚</div>
            <p className="text-lg font-medium text-[var(--text-primary)]">
              No courses found
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              {courses.length} course(s) found
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;