import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit3,
  ExternalLink,
  Globe2,
  PlusCircle,
  Radio,
  Trash2,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import {
  courseAPI,
  createLiveClass,
  deleteLiveClass,
  getLiveClasses,
  updateLiveClass,
  updateLiveClassStatus,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const providerLabels = {
  jitsi: 'Built-in Live Room',
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  custom: 'Custom Link',
};

const providerHelp = {
  jitsi: 'Creates an instant embedded room inside ELearnify.',
  google_meet: 'Paste your Google Meet link created from Google Calendar/Meet.',
  zoom: 'Paste your Zoom meeting link.',
  custom: 'Paste any meeting/live stream link.',
};

const emptyForm = {
  title: '',
  description: '',
  course: '',
  scheduledAt: '',
  durationMinutes: 60,
  provider: 'jitsi',
  meetingLink: '',
  agenda: '',
  resources: '',
};

const formatDateTime = (value) => {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const toDateTimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

const LiveClassFormModal = ({ courses, editClass, onClose, onSaved }) => {
  const [form, setForm] = useState(() => {
    if (!editClass) return emptyForm;
    return {
      title: editClass.title || '',
      description: editClass.description || '',
      course: editClass.course?._id || editClass.course || '',
      scheduledAt: toDateTimeLocalValue(editClass.scheduledAt),
      durationMinutes: editClass.durationMinutes || 60,
      provider: editClass.provider || 'jitsi',
      meetingLink: editClass.provider === 'jitsi' ? '' : editClass.meetingLink || '',
      agenda: (editClass.agenda || []).join('\n'),
      resources: (editClass.resources || []).join('\n'),
    };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMinutes: Number(form.durationMinutes) || 60,
      };

      if (editClass) {
        await updateLiveClass(editClass._id, payload);
      } else {
        await createLiveClass(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save live class.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-lg)]"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Live teaching setup
            </p>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {editClass ? 'Edit Live Class' : 'Create Live Class'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-text)]">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Class title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. React Hooks Doubt Solving Session"
              className="w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Course *</label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Date and time *</label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={form.scheduledAt}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Duration</label>
            <input
              type="number"
              min="15"
              max="300"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Meeting provider</label>
            <select
              name="provider"
              value={form.provider}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]"
            >
              <option value="jitsi">Built-in Live Room</option>
              <option value="google_meet">Google Meet</option>
              <option value="zoom">Zoom</option>
              <option value="custom">Custom Link</option>
            </select>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{providerHelp[form.provider]}</p>
          </div>

          {form.provider !== 'jitsi' && (
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Meeting link *</label>
              <input
                name="meetingLink"
                value={form.meetingLink}
                onChange={handleChange}
                placeholder="Paste Google Meet, Zoom, or live stream link"
                required
                className="w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Description</label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell students what this class covers."
              className="w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Agenda points</label>
            <textarea
              name="agenda"
              rows="4"
              value={form.agenda}
              onChange={handleChange}
              placeholder="One point per line"
              className="w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Resources</label>
            <textarea
              name="resources"
              rows="4"
              value={form.resources}
              onChange={handleChange}
              placeholder="Links or notes, one per line"
              className="w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[var(--border-light)] px-5 py-3 font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-[var(--shadow-md)] hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : editClass ? 'Save Changes' : 'Create Class'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

const LiveClassesPage = () => {
  const { user, isAdmin, isInstructor } = useAuth();
  const canTeach = isAdmin || isInstructor;

  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [actionId, setActionId] = useState(null);

  const loadLiveClasses = async () => {
    try {
      const data = await getLiveClasses();
      setLiveClasses(data.liveClasses || []);
    } catch (error) {
      console.error('Live classes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const { data } = await courseAPI.getAll({ limit: 100 });
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Course loading error:', error);
    }
  };

  useEffect(() => {
    loadLiveClasses();
    loadCourses();
  }, []);

  const stats = useMemo(() => {
    const liveNow = liveClasses.filter((item) => item.status === 'live').length;
    const upcoming = liveClasses.filter((item) => item.status === 'scheduled').length;
    return { liveNow, upcoming, total: liveClasses.length };
  }, [liveClasses]);

  const handleStatus = async (id, status) => {
    setActionId(id);
    try {
      await updateLiveClassStatus(id, status);
      await loadLiveClasses();
    } catch (error) {
      alert(error.response?.data?.message || 'Could not update live class.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    setActionId(item._id);
    try {
      await deleteLiveClass(item._id);
      await loadLiveClasses();
    } catch (error) {
      alert(error.response?.data?.message || 'Could not delete live class.');
    } finally {
      setActionId(null);
    }
  };

  const canManage = (item) => {
    if (isAdmin) return true;
    return isInstructor && String(item.instructor?._id || item.instructor) === String(user?._id);
  };

  const openEdit = (item) => {
    setEditingClass(item);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingClass(null);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 text-[var(--text-primary)] transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-[var(--shadow-lg)]">
          <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full bg-white/10 blur-2xl md:block" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-blue-50">
                <Radio size={16} /> Interactive learning rooms
              </span>
              <h1 className="text-3xl font-extrabold md:text-5xl">Live Classes</h1>
              <p className="mt-3 max-w-2xl text-blue-100">
                Schedule, teach, and join real-time learning sessions using built-in rooms, Google Meet, Zoom, or custom links.
              </p>
            </div>

            {canTeach && (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                <PlusCircle size={18} /> Create Live Class
              </button>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Live Now', value: stats.liveNow, icon: Zap, color: 'text-red-500' },
            { label: 'Upcoming', value: stats.upcoming, icon: CalendarDays, color: 'text-blue-500' },
            { label: 'Total Sessions', value: stats.total, icon: Video, color: 'text-violet-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-3xl border border-[var(--border-light)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-1 text-3xl font-extrabold text-[var(--text-primary)]">{value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-secondary)]">
                  <Icon className={color} size={24} />
                </div>
              </div>
            </div>
          ))}
        </section>

        {loading ? (
          <div className="rounded-3xl border border-[var(--border-light)] bg-[var(--surface-1)] p-8 text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
            Loading live classes...
          </div>
        ) : liveClasses.length === 0 ? (
          <div className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-12 text-center shadow-[var(--shadow-sm)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Video size={34} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">No live classes yet</h2>
            <p className="mx-auto mt-2 max-w-md text-[var(--text-secondary)]">
              {canTeach
                ? 'Create your first live class and invite students to an interactive session.'
                : 'Upcoming live sessions from your instructors will appear here.'}
            </p>
            {canTeach && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                <PlusCircle size={18} /> Create Live Class
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {liveClasses.map((item, index) => {
              const managing = canManage(item);
              const isExternal = item.provider !== 'jitsi';
              return (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="group overflow-hidden rounded-[1.75rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-[var(--shadow-md)]"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-110 dark:bg-blue-900/30 dark:text-blue-400">
                        <Video size={26} />
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'live' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                            {item.status === 'live' ? '● Live Now' : item.status}
                          </span>
                          <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                            {providerLabels[item.provider] || 'Live Room'}
                          </span>
                        </div>
                        <h2 className="mt-3 text-xl font-bold text-[var(--text-primary)]">{item.title}</h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                          {item.description || 'Interactive instructor-led learning session.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-3xl bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
                    <p className="flex items-center gap-2"><CalendarDays size={16} /> {formatDateTime(item.scheduledAt)}</p>
                    <p className="flex items-center gap-2"><Clock size={16} /> {item.durationMinutes || 60} minutes</p>
                    <p className="flex items-center gap-2"><BookNameIcon /> {item.course?.title || 'Course'}</p>
                    <p className="flex items-center gap-2"><Users size={16} /> {item.instructor?.name || 'Instructor'}</p>
                  </div>

                  {item.agenda?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.agenda.slice(0, 3).map((point) => (
                        <span key={point} className="rounded-full border border-[var(--border-light)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                          {point}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {managing && (
                        <>
                          {item.status !== 'live' && item.status !== 'completed' && (
                            <button
                              type="button"
                              disabled={actionId === item._id}
                              onClick={() => handleStatus(item._id, 'live')}
                              className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              Start
                            </button>
                          )}
                          {item.status === 'live' && (
                            <button
                              type="button"
                              disabled={actionId === item._id}
                              onClick={() => handleStatus(item._id, 'completed')}
                              className="rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-xl border border-[var(--border-light)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            disabled={actionId === item._id}
                            onClick={() => handleDelete(item)}
                            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>

                    <Link
                      to={`/live-classes/${item._id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      {managing ? (isExternal ? 'Open Room' : 'Enter Room') : 'Join Class'}
                      {isExternal ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <LiveClassFormModal
            courses={courses}
            editClass={editingClass}
            onClose={() => setModalOpen(false)}
            onSaved={loadLiveClasses}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

const BookNameIcon = () => <Globe2 size={16} />;

export default LiveClassesPage;
