// components/CourseProgressCard.jsx
import { motion } from 'framer-motion';
import { Link }   from 'react-router-dom';
import { PlayCircle, Clock } from 'lucide-react';
import { SERVER_URL } from '../services/api';

const CourseProgressCard = ({ course, index }) => {
  // Simulate progress (in a real app you'd store this in DB)
  const progress = Math.floor(Math.random() * 80) + 10;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0  }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden
        border border-gray-100 dark:border-gray-800 shadow-sm
        hover:shadow-md transition-shadow group">

      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden">
        {course.thumbnail ? (
          <img src={`${SERVER_URL}/${course.thumbnail}`} alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600
            flex items-center justify-center">
            <PlayCircle size={40} className="text-white opacity-70" />
          </div>
        )}

        {/* Progress overlay badge */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white
          text-xs px-2 py-1 rounded-lg">
          {progress}% complete
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-blue-600 dark:text-blue-400
          font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
          {course.category}
        </span>

        <h3 className="font-semibold text-gray-900 dark:text-white mt-2
          mb-1 line-clamp-1 text-sm">
          {course.title}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          👨‍🏫 {course.instructor}
          {course.duration && <span className="ml-2">⏱ {course.duration}</span>}
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500
            dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <motion.div
              className="bg-blue-600 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        <Link to={`/courses/${course._id}`}
          className="flex items-center justify-center gap-2 w-full
            bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
            py-2 rounded-xl transition-colors">
          <PlayCircle size={16} />
          Continue Learning
        </Link>
      </div>
    </motion.div>
  );
};

export default CourseProgressCard;