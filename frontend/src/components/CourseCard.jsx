// components/CourseCard.jsx
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { SERVER_URL } from '../services/api';

const LEVEL_COLORS = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
};

const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return '';

  if (
    thumbnail.startsWith('http://') ||
    thumbnail.startsWith('https://')
  ) {
    return thumbnail;
  }

  return `${SERVER_URL}/${thumbnail}`;
};

const CourseCard = ({ course }) => {
  const {
    _id,
    title,
    description,
    instructor,
    thumbnail,
    category,
    level,
    price,
    duration,
    enrolledStudents = [],
    avgRating = 0,
    reviewCount = 0
  } = course;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <div className="relative">
        {thumbnail ? (
          <img
            src={getThumbnailUrl(thumbnail)}
            alt={title}
            className="h-44 w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}

        <div
          className={`${thumbnail ? 'hidden' : ''} flex h-44 w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600`}
        >
          <svg
            className="h-16 w-16 text-white opacity-60"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
          </svg>
        </div>

        <span className="absolute right-3 top-3 rounded-lg bg-white px-2 py-1 text-sm font-bold text-blue-700 shadow">
          {price === 0 ? 'Free' : `$${price}`}
        </span>
      </div>

      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            {category}
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              LEVEL_COLORS[level] ||
              'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            {level}
          </span>
        </div>

        <h3 className="mb-1 line-clamp-2 text-base font-bold leading-snug text-[var(--text-primary)]">
          {title}
        </h3>

        <p className="mb-3 line-clamp-2 flex-grow text-sm text-[var(--text-secondary)]">
          {description}
        </p>

        {/* Rating */}
        {avgRating > 0 && (
          <div className="mb-2 flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />

            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {avgRating}
            </span>

            <span className="text-xs text-[var(--text-muted)]">
              ({reviewCount || 0})
            </span>
          </div>
        )}

        <div className="mb-4 flex flex-col gap-1 text-xs text-[var(--text-muted)]">
          <span>
            👨‍🏫 {typeof instructor === 'object' ? instructor?.name : instructor}
          </span>

          {duration && <span>⏱ {duration}</span>}

          <span>
            👥 {enrolledStudents.length} students enrolled
          </span>
        </div>

        <Link
          to={`/courses/${_id}`}
          className="mt-auto block rounded-xl bg-blue-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          View Course
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;