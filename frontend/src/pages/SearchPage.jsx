// pages/SearchPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion }               from 'framer-motion';
import {
  Search, SlidersHorizontal, X,
  ChevronDown, BookOpen
} from 'lucide-react';
import { courseAPI }    from '../services/api';
import CourseCard       from '../components/CourseCard';
import Loader           from '../components/Loader';

const CATEGORIES = [
  'All', 'Web Development', 'Mobile Development',
  'Data Science', 'Machine Learning', 'Design', 'Business', 'Other'
];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First'    },
  { value: 'popular',    label: 'Most Popular'    },
  { value: 'price-low',  label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search:   searchParams.get('q')        || '',
    category: searchParams.get('category') || 'All',
    level:    searchParams.get('level')    || 'All',
    sortBy:   searchParams.get('sort')     || 'newest',
    minPrice: '',
    maxPrice: '',
    page:     1
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.search)              params.search   = filters.search;
        if (filters.category !== 'All')  params.category = filters.category;
        if (filters.level    !== 'All')  params.level    = filters.level;
        if (filters.sortBy)              params.sortBy   = filters.sortBy;
        if (filters.minPrice)            params.minPrice = filters.minPrice;
        if (filters.maxPrice)            params.maxPrice = filters.maxPrice;
        params.page  = filters.page;
        params.limit = 12;

        const { data } = await courseAPI.getAll(params);
        setCourses(data.courses);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters(p => ({ ...p, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '', category: 'All', level: 'All',
      sortBy: 'newest', minPrice: '', maxPrice: '', page: 1
    });
  };

  const hasActiveFilters =
    filters.category !== 'All' || filters.level !== 'All' ||
    filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]
      transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Search Header ──────────────────────────────────── */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search size={20} className="absolute left-4 top-1/2
              -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              placeholder="Search courses, topics, instructors..."
              className="w-full pl-12 pr-12 py-4 border-2
                border-[var(--border-light)] rounded-2xl text-base
                bg-[var(--surface-1)] text-[var(--text-primary)]
                focus:outline-none focus:border-blue-500 transition
                shadow-[var(--shadow-sm)]"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2
                  text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {loading ? 'Searching...' : (
                <>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {total}
                  </span>{' '}
                  {filters.search
                    ? `results for "${filters.search}"`
                    : 'courses available'
                  }
                </>
              )}
            </p>
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`flex items-center gap-2 text-sm px-4 py-2
                rounded-xl border transition-colors
                ${showFilters || hasActiveFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}>
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-white text-blue-600 rounded-full
                  text-xs font-bold flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Filters Panel ─────────────────────────────────── */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0   }}
            className="bg-[var(--surface-1)] border border-[var(--border-light)]
              rounded-2xl p-5 mb-6 shadow-[var(--shadow-sm)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {/* Category */}
              <div>
                <label className="block text-xs font-medium
                  text-[var(--text-secondary)] mb-1.5">Category</label>
                <select value={filters.category}
                  onChange={e => updateFilter('category', e.target.value)}
                  className="w-full border border-[var(--border-light)]
                    rounded-xl px-3 py-2 text-sm bg-[var(--surface-1)]
                    text-[var(--text-primary)] focus:outline-none
                    focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-xs font-medium
                  text-[var(--text-secondary)] mb-1.5">Level</label>
                <select value={filters.level}
                  onChange={e => updateFilter('level', e.target.value)}
                  className="w-full border border-[var(--border-light)]
                    rounded-xl px-3 py-2 text-sm bg-[var(--surface-1)]
                    text-[var(--text-primary)] focus:outline-none
                    focus:ring-2 focus:ring-blue-500">
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-medium
                  text-[var(--text-secondary)] mb-1.5">Sort By</label>
                <select value={filters.sortBy}
                  onChange={e => updateFilter('sortBy', e.target.value)}
                  className="w-full border border-[var(--border-light)]
                    rounded-xl px-3 py-2 text-sm bg-[var(--surface-1)]
                    text-[var(--text-primary)] focus:outline-none
                    focus:ring-2 focus:ring-blue-500">
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-medium
                  text-[var(--text-secondary)] mb-1.5">Price Range ($)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min"
                    value={filters.minPrice}
                    onChange={e => updateFilter('minPrice', e.target.value)}
                    min="0"
                    className="w-1/2 border border-[var(--border-light)]
                      rounded-xl px-2 py-2 text-sm bg-[var(--surface-1)]
                      text-[var(--text-primary)] focus:outline-none
                      focus:ring-2 focus:ring-blue-500"
                  />
                  <input type="number" placeholder="Max"
                    value={filters.maxPrice}
                    onChange={e => updateFilter('maxPrice', e.target.value)}
                    min="0"
                    className="w-1/2 border border-[var(--border-light)]
                      rounded-xl px-2 py-2 text-sm bg-[var(--surface-1)]
                      text-[var(--text-primary)] focus:outline-none
                      focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="mt-4 text-sm text-red-500 hover:text-red-700
                  flex items-center gap-1">
                <X size={13} /> Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {/* ── Results ───────────────────────────────────────── */}
        {loading ? (
          <Loader text="Searching courses..." />
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto
              text-[var(--text-muted)] mb-4 opacity-30" />
            <h2 className="text-xl font-semibold
              text-[var(--text-primary)] mb-2">
              No courses found
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              Try different keywords or adjust your filters
            </p>
            <button onClick={clearFilters}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2
              lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map((course, i) => (
                <motion.div key={course._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: i * 0.04 }}>
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="px-4 py-2 border border-[var(--border-light)]
                    rounded-xl text-sm text-[var(--text-secondary)]
                    hover:bg-[var(--bg-hover)] disabled:opacity-40
                    disabled:cursor-not-allowed transition-colors">
                  ← Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button key={page}
                      onClick={() => updateFilter('page', page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium
                        transition-colors
                        ${filters.page === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}>
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="px-4 py-2 border border-[var(--border-light)]
                    rounded-xl text-sm text-[var(--text-secondary)]
                    hover:bg-[var(--bg-hover)] disabled:opacity-40
                    disabled:cursor-not-allowed transition-colors">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;