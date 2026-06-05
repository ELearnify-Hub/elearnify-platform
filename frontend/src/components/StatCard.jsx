// components/StatCard.jsx
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, delay = 0, trend }) => {
  const colors = {
    blue:   'bg-blue-50   dark:bg-blue-900/20  text-blue-600   dark:text-blue-400',
    green:  'bg-green-50  dark:bg-green-900/20 text-green-600  dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red:    'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm
        border border-gray-100 dark:border-gray-800 cursor-default">

      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color] || colors.blue}`}>
          <Icon size={22} />
        </div>

        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full
            ${trend >= 0
              ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50   text-red-600   dark:bg-red-900/20   dark:text-red-400'
            }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <motion.p
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}>
          {value}
        </motion.p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;