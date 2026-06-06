// components/CourseCard.jsx — Reusable card displayed in course listings
import { Link } from 'react-router-dom';

const LEVEL_COLORS = {
  Beginner:     'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced:     'bg-red-100 text-red-700'
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
    enrolledStudents = []
  } = course;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">

      {/* Thumbnail */}
      <div className="relative">
        {thumbnail ? (
          <img
            src={`http://localhost:5000/${thumbnail}`}
            alt={title}
            className="w-full h-44 object-cover"
          />
        ) : (
          /* Placeholder when no thumbnail */
          <div className="w-full h-44 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
            <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
            </svg>
          </div>
        )}

        {/* Price badge */}
        <span className="absolute top-3 right-3 bg-white text-blue-700 font-bold text-sm px-2 py-1 rounded-lg shadow">
          {price === 0 ? 'Free' : `$${price}`}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Category + Level */}
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
            {category}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_COLORS[level] || 'bg-gray-100 text-gray-600'}`}>
            {level}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-grow">
          {description}
        </p>

        {/* Meta info */}
        <div className="text-xs text-gray-400 dark:text-gray-500 flex flex-col gap-1 mb-4">
          <span>👨‍🏫 {instructor}</span>
          {duration && <span>⏱ {duration}</span>}
          <span>👥 {enrolledStudents.length} students enrolled</span>
        </div>

        {/* CTA Button */}
        <Link
          to={`/courses/${_id}`}
          className="mt-auto block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-sm">
          View Course
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;