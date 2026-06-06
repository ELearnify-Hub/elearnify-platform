// components/ModuleBuilder.jsx
// Admin UI for building course modules and lessons
import { useState, useEffect }  from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, ChevronDown, ChevronRight,
  Pencil, Trash2, Video, FileText,
  Upload, Check, X, GripVertical,
  Eye, EyeOff
} from 'lucide-react';
import { moduleAPI } from '../services/api';

// ── Lesson Type Badge ─────────────────────────────────────────────────────────
const LessonTypeBadge = ({ type }) => {
  const config = {
    video: { icon: Video,    color: 'bg-blue-100 text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',   label: 'Video' },
    pdf:   { icon: FileText, color: 'bg-red-100  text-red-700    dark:bg-red-900/30    dark:text-red-400',    label: 'PDF'   },
    text:  { icon: FileText, color: 'bg-green-100 text-green-700 dark:bg-green-900/30  dark:text-green-400',  label: 'Text'  },
  };
  const { icon: Icon, color, label } = config[type] || config.video;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      <Icon size={10} />{label}
    </span>
  );
};

// ── Add/Edit Lesson Form ──────────────────────────────────────────────────────
const LessonForm = ({ courseId, moduleId, editLesson, onClose, onSaved }) => {
  const isEdit = !!editLesson;
  const [form, setForm] = useState({
    title:         editLesson?.title         || '',
    type:          editLesson?.type          || 'video',
    duration:      editLesson?.duration      || '',
    content:       editLesson?.content       || '',
    isFreePreview: editLesson?.isFreePreview || false
  });
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    if (!isEdit && form.type !== 'text' && !file) {
      return setError(`Please upload a ${form.type} file`);
    }

    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);

      if (isEdit) {
        await moduleAPI.updateLesson(courseId, moduleId, editLesson._id, fd);
      } else {
        await moduleAPI.addLesson(courseId, moduleId, fd);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{    opacity: 0, height: 0 }}
      className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200
        dark:border-blue-800 rounded-xl p-4 mt-3">

      <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-3">
        {isEdit ? '✏️ Edit Lesson' : '➕ Add New Lesson'}
      </h4>

      {error && (
        <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20
          border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mb-3">
          ⚠️ {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Title */}
        <input
          type="text"
          placeholder="Lesson title *"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          className="w-full border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            rounded-lg px-3 py-2 text-sm focus:outline-none
            focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-2 gap-3">
          {/* Type */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Lesson Type
            </label>
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                rounded-lg px-3 py-2 text-sm focus:outline-none
                focus:ring-2 focus:ring-blue-500">
              <option value="video">🎥 Video</option>
              <option value="pdf">📄 PDF</option>
              <option value="text">📝 Text</option>
            </select>
          </div>

          {/* Duration (video only) */}
          {form.type === 'video' && (
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Duration (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 12:34"
                value={form.duration}
                onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  rounded-lg px-3 py-2 text-sm focus:outline-none
                  focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* File upload for video/pdf */}
        {form.type !== 'text' && (
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              {form.type === 'video' ? 'Video File' : 'PDF File'}
              {!isEdit && ' *'}
            </label>
            <div className={`border-2 border-dashed rounded-lg p-3 text-center
              transition-colors cursor-pointer
              ${file
                ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
              onClick={() => document.getElementById(`file-${moduleId}`).click()}>
              <input
                id={`file-${moduleId}`}
                type="file"
                className="hidden"
                accept={form.type === 'video' ? 'video/*' : 'application/pdf'}
                onChange={e => setFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2
                  text-green-600 dark:text-green-400 text-xs">
                  <Check size={14} />
                  <span className="truncate max-w-48">{file.name}</span>
                </div>
              ) : (
                <div className="text-gray-400 text-xs">
                  <Upload size={16} className="mx-auto mb-1" />
                  Click to upload {form.type === 'video' ? 'video' : 'PDF'}
                  {isEdit && (
                    <span className="block text-gray-400 mt-0.5">
                      (Leave empty to keep existing file)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text content */}
        {form.type === 'text' && (
          <textarea
            placeholder="Write lesson content here..."
            value={form.content}
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              rounded-lg px-3 py-2 text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500 resize-none"
          />
        )}

        {/* Free preview toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setForm(p => ({ ...p, isFreePreview: !p.isFreePreview }))}
            className={`w-9 h-5 rounded-full transition-colors relative
              ${form.isFreePreview
                ? 'bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
              }`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full
              shadow transition-transform
              ${form.isFreePreview ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Free preview (non-enrolled students can view this lesson)
          </span>
        </label>

        {/* Buttons */}
        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-300 dark:border-gray-700
              text-gray-600 dark:text-gray-400 py-2 rounded-lg text-sm
              hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
              text-white py-2 rounded-lg text-sm font-medium transition-colors">
            {loading
              ? 'Saving...'
              : isEdit ? 'Save Changes' : 'Add Lesson'
            }
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// ── Module Row ────────────────────────────────────────────────────────────────
const ModuleRow = ({ module, courseId, onRefresh }) => {
  const [expanded,      setExpanded]      = useState(true);
  const [showLessonForm,setShowLessonForm] = useState(false);
  const [editLesson,    setEditLesson]     = useState(null);
  const [editingTitle,  setEditingTitle]   = useState(false);
  const [newTitle,      setNewTitle]       = useState(module.title);
  const [deleting,      setDeleting]       = useState(false);

  const handleDeleteModule = async () => {
    if (!window.confirm(`Delete module "${module.title}" and ALL its lessons?`)) return;
    setDeleting(true);
    try {
      await moduleAPI.deleteModule(courseId, module._id);
      onRefresh();
    } catch {
      alert('Failed to delete module');
      setDeleting(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!newTitle.trim()) return;
    try {
      await moduleAPI.updateModule(courseId, module._id, { title: newTitle });
      setEditingTitle(false);
      onRefresh();
    } catch {
      alert('Failed to update module title');
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId, lessonTitle) => {
    if (!window.confirm(`Delete lesson "${lessonTitle}"?`)) return;
    try {
      await moduleAPI.deleteLesson(courseId, moduleId, lessonId);
      onRefresh();
    } catch {
      alert('Failed to delete lesson');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      className="bg-white dark:bg-gray-900 border border-gray-200
        dark:border-gray-700 rounded-2xl overflow-hidden">

      {/* Module Header */}
      <div className="flex items-center gap-3 p-4 bg-gray-50
        dark:bg-gray-800/50">
        {/* Drag handle (visual only for now) */}
        <GripVertical size={16} className="text-gray-300 dark:text-gray-600
          cursor-grab flex-shrink-0" />

        {/* Expand toggle */}
        <button onClick={() => setExpanded(p => !p)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700
            dark:hover:text-white transition-colors flex-shrink-0">
          {expanded
            ? <ChevronDown size={18} />
            : <ChevronRight size={18} />
          }
        </button>

        {/* Module title (editable) */}
        {editingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  handleUpdateTitle();
                if (e.key === 'Escape') setEditingTitle(false);
              }}
              autoFocus
              className="flex-1 border border-blue-400 rounded-lg px-3 py-1.5
                text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleUpdateTitle}
              className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600
                dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors">
              <Check size={14} />
            </button>
            <button onClick={() => setEditingTitle(false)}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500
                rounded-lg hover:bg-gray-200 transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-semibold text-gray-900 dark:text-white
              text-sm truncate">
              {module.title}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500
              flex-shrink-0">
              ({module.lessons?.length || 0} lessons)
            </span>
          </div>
        )}

        {/* Module actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowLessonForm(p => !p)}
            className="flex items-center gap-1.5 text-xs bg-blue-600
              hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg
              transition-colors font-medium">
            <PlusCircle size={13} /> Add Lesson
          </button>
          <button
            onClick={() => { setEditingTitle(true); setNewTitle(module.title); }}
            className="p-1.5 text-gray-400 hover:text-blue-600
              hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg
              transition-colors">
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDeleteModule}
            disabled={deleting}
            className="p-1.5 text-gray-400 hover:text-red-600
              hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg
              transition-colors disabled:opacity-50">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Lessons List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0,    opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{    height: 0,    opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="p-4 space-y-2">

              {module.lessons?.length === 0 && !showLessonForm && (
                <div className="text-center py-6 text-gray-400
                  dark:text-gray-600 text-sm border-2 border-dashed
                  border-gray-200 dark:border-gray-700 rounded-xl">
                  <Video size={24} className="mx-auto mb-2 opacity-50" />
                  No lessons yet. Click "Add Lesson" to get started.
                </div>
              )}

              {/* Lesson rows */}
              {module.lessons?.map((lesson, idx) => (
                <motion.div
                  key={lesson._id}
                  layout
                  className="flex items-center gap-3 p-3 bg-gray-50
                    dark:bg-gray-800/30 rounded-xl border border-gray-100
                    dark:border-gray-700/50 group hover:border-blue-200
                    dark:hover:border-blue-700 transition-colors">

                  {/* Lesson number */}
                  <span className="w-6 h-6 rounded-full bg-gray-200
                    dark:bg-gray-700 flex items-center justify-center
                    text-xs font-bold text-gray-600 dark:text-gray-400
                    flex-shrink-0">
                    {idx + 1}
                  </span>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-800
                        dark:text-white truncate">
                        {lesson.title}
                      </span>
                      <LessonTypeBadge type={lesson.type} />
                      {lesson.isFreePreview && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/20
                          text-green-700 dark:text-green-400 px-2 py-0.5
                          rounded-full flex items-center gap-1">
                          <Eye size={9} /> Preview
                        </span>
                      )}
                    </div>
                    {lesson.duration && (
                      <span className="text-xs text-gray-400 mt-0.5 block">
                        ⏱ {lesson.duration}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0
                    group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditLesson(lesson);
                        setShowLessonForm(false);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600
                        hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg
                        transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(
                        module._id, lesson._id, lesson.title
                      )}
                      className="p-1.5 text-gray-400 hover:text-red-600
                        hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg
                        transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Add lesson form */}
              <AnimatePresence>
                {showLessonForm && (
                  <LessonForm
                    courseId={courseId}
                    moduleId={module._id}
                    onClose={() => setShowLessonForm(false)}
                    onSaved={() => { setShowLessonForm(false); onRefresh(); }}
                  />
                )}
                {editLesson && (
                  <LessonForm
                    courseId={courseId}
                    moduleId={module._id}
                    editLesson={editLesson}
                    onClose={() => setEditLesson(null)}
                    onSaved={() => { setEditLesson(null); onRefresh(); }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main ModuleBuilder Component ──────────────────────────────────────────────
const ModuleBuilder = ({ courseId }) => {
  const [modules,       setModules]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [addingModule,  setAddingModule]  = useState(false);
  const [newModTitle,   setNewModTitle]   = useState('');
  const [saving,        setSaving]        = useState(false);

  const fetchModules = async () => {
    try {
      const { data } = await moduleAPI.getModules(courseId);
      setModules(data.modules);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const handleAddModule = async () => {
    if (!newModTitle.trim()) return;
    setSaving(true);
    try {
      await moduleAPI.addModule(courseId, { title: newModTitle });
      setNewModTitle('');
      setAddingModule(false);
      fetchModules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add module');
    } finally {
      setSaving(false);
    }
  };

  const totalLessons = modules.reduce(
    (sum, m) => sum + (m.lessons?.length || 0), 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4
          border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Course Curriculum
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {modules.length} module{modules.length !== 1 ? 's' : ''} •{' '}
            {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setAddingModule(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
            text-white text-sm font-medium px-4 py-2 rounded-xl
            transition-colors">
          <PlusCircle size={15} /> Add Module
        </button>
      </div>

      {/* Add module form */}
      <AnimatePresence>
        {addingModule && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0   }}
            exit={{    opacity: 0, y: -10  }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200
              dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-800 dark:text-white mb-3">
              New Module
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Module 1: Getting Started"
                value={newModTitle}
                onChange={e => setNewModTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter')  handleAddModule();
                  if (e.key === 'Escape') setAddingModule(false);
                }}
                autoFocus
                className="flex-1 border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  rounded-xl px-4 py-2.5 text-sm focus:outline-none
                  focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleAddModule} disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                  text-white px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-colors">
                {saving ? 'Adding...' : 'Add'}
              </button>
              <button onClick={() => setAddingModule(false)}
                className="border border-gray-300 dark:border-gray-700
                  text-gray-600 dark:text-gray-400 px-4 py-2.5 rounded-xl
                  text-sm hover:bg-gray-50 dark:hover:bg-gray-800
                  transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module list */}
      {modules.length === 0 && !addingModule ? (
        <div className="text-center py-16 border-2 border-dashed
          border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="text-5xl mb-3">📚</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">
            No modules yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
            Start building your course curriculum by adding a module.
          </p>
          <button onClick={() => setAddingModule(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm
              font-medium px-5 py-2.5 rounded-xl transition-colors">
            Create First Module
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules
            .sort((a, b) => a.order - b.order)
            .map(module => (
              <ModuleRow
                key={module._id}
                module={module}
                courseId={courseId}
                onRefresh={fetchModules}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ModuleBuilder;