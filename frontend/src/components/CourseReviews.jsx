// components/CourseReviews.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Edit3, Trash2, Send } from 'lucide-react';
import { reviewAPI }  from '../services/api';
import { useAuth }    from '../context/AuthContext';
import { SERVER_URL } from '../services/api';

// ── Star Rating Input ─────────────────────────────────────────────────────────
const StarInput = ({ value, onChange, size = 24 }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}>
          <Star size={size}
            className={`transition-colors
              ${(hover || value) >= star
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
              }`}
          />
        </button>
      ))}
    </div>
  );
};

// ── Star Display ──────────────────────────────────────────────────────────────
const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(star => (
      <Star key={star} size={size}
        className={rating >= star
          ? 'text-yellow-400 fill-yellow-400'
          : 'text-gray-300 dark:text-gray-600'
        }
      />
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const CourseReviews = ({ courseId, isEnrolled }) => {
  const { isLoggedIn } = useAuth();
  const [data,      setData]      = useState({ reviews: [], stats: {} });
  const [myReview,  setMyReview]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({ rating: 0, title: '', body: '' });
  const [submitting,setSubmitting]= useState(false);
  const [error,     setError]     = useState('');

  const fetchReviews = async () => {
    try {
      const [reviewsRes, myRes] = await Promise.all([
        reviewAPI.get(courseId),
        isLoggedIn ? reviewAPI.getMyReview(courseId) : Promise.resolve({ data: { review: null } })
      ]);
      setData(reviewsRes.data);
      setMyReview(myRes.data.review);
      if (myRes.data.review) {
        setForm({
          rating: myRes.data.review.rating,
          title:  myRes.data.review.title,
          body:   myRes.data.review.body
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) { setError('Please select a rating'); return; }
    setSubmitting(true);
    setError('');
    try {
      await reviewAPI.create(courseId, form);
      await fetchReviews();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await reviewAPI.delete(courseId);
      setMyReview(null);
      setForm({ rating: 0, title: '', body: '' });
      await fetchReviews();
    } catch { alert('Failed to delete review'); }
  };

  const { reviews = [], stats = {} } = data;

  return (
    <div className="bg-[var(--surface-1)] rounded-2xl border
      border-[var(--border-light)] overflow-hidden shadow-[var(--shadow-sm)]">

      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-light)]
        flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">
            Student Reviews
          </h3>
          {stats.totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarDisplay rating={Math.round(stats.avgRating)} size={14} />
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {stats.avgRating}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>

        {isLoggedIn && isEnrolled && (
          <button
            onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-1.5 text-sm bg-blue-600
              hover:bg-blue-700 text-white px-4 py-2 rounded-xl
              transition-colors font-medium">
            <Edit3 size={14} />
            {myReview ? 'Edit Review' : 'Write Review'}
          </button>
        )}
      </div>

      {/* Write / Edit Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[var(--border-light)]">
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <p className="text-red-500 text-sm">⚠️ {error}</p>
              )}

              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  Your Rating *
                </p>
                <StarInput
                  value={form.rating}
                  onChange={v => setForm(p => ({ ...p, rating: v }))}
                  size={28}
                />
              </div>

              <input
                type="text"
                placeholder="Review title (optional)"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                maxLength={100}
                className="w-full border border-[var(--border-light)] rounded-xl
                  px-4 py-2.5 text-sm bg-[var(--surface-1)]
                  text-[var(--text-primary)] focus:outline-none
                  focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Share your experience with this course..."
                value={form.body}
                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                maxLength={1000}
                rows={4}
                className="w-full border border-[var(--border-light)] rounded-xl
                  px-4 py-2.5 text-sm bg-[var(--surface-1)]
                  text-[var(--text-primary)] focus:outline-none
                  focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-[var(--border-light)]
                    text-[var(--text-secondary)] py-2.5 rounded-xl text-sm
                    hover:bg-[var(--bg-hover)] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !form.rating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700
                    disabled:bg-blue-300 text-white font-semibold py-2.5
                    rounded-xl text-sm transition-colors flex items-center
                    justify-center gap-2">
                  <Send size={14} />
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="p-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4
              border-blue-200 border-t-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)]">
            <Star size={32} className="mx-auto mb-3 opacity-30" />
            <p>No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: i * 0.05 }}
                className="pb-4 border-b border-[var(--border-light)]
                  last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl overflow-hidden
                      bg-blue-600 flex items-center justify-center
                      text-white text-sm font-bold flex-shrink-0">
                      {(() => {
                        const displayAvatar = review.userId?.profilePicture || review.userId?.avatar;
                        const avatarSrc = displayAvatar
                          ? displayAvatar.startsWith('http')
                            ? displayAvatar
                            : `${SERVER_URL}/${displayAvatar}`
                          : '';

                        return avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={review.userId?.name || 'User'}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          review.userId?.name?.charAt(0).toUpperCase()
                        );
                      })()}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]
                        text-sm">
                        {review.userId?.name}
                      </p>
                      <StarDisplay rating={review.rating} size={12} />
                    </div>
                  </div>

                  {/* Delete own review */}
                  {myReview?._id === review._id && (
                    <button onClick={handleDelete}
                      className="p-1.5 text-[var(--text-muted)]
                        hover:text-red-500 hover:bg-red-50
                        dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {review.title && (
                  <p className="font-semibold text-[var(--text-primary)]
                    text-sm mt-2">
                    {review.title}
                  </p>
                )}
                {review.body && (
                  <p className="text-sm text-[var(--text-secondary)] mt-1
                    leading-relaxed">
                    {review.body}
                  </p>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseReviews;