// pages/CoursesPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';

const CATEGORIES = ['All', 'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'Design', 'Business'];
const LEVELS     = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CoursesPage = () => {
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All');
  const [level,      setLevel]      = useState('All');
  const [searchParams] = useSearchParams();

  // Read category from URL query param (set by HomePage category links)
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setCategory(catParam);
  }, [searchParams]);

  // Fetch courses whenever filters change
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (search)              params.search   = search;
        if (category !== 'All')  params.category = category;
        if (level    !== 'All')  params.level    = level;

        const { data } = await courseAPI.getAll(params);
        setCourses(data.courses);
      } catch (err) {
        setError('Failed to load courses. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search: wait 500ms after user stops typing
    const timer = setTimeout(fetchCourses, 500);
    return () => clearTimeout(timer);
  }, [search, category, level]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Courses</h1>
        <p className="text-gray-500 dark:text-gray-400">Explore our library of expert-led courses</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4 border border-gray-200 dark:border-gray-800">

        {/* Search */}
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Level Filter */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <Loader text="Fetching courses..." />
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-300">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{courses.length} course(s) found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CoursesPage;