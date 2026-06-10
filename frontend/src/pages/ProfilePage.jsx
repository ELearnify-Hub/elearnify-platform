// pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Camera, BookOpen, Award,
  Lock, Eye, EyeOff, Edit3, Save, X,
  Clock, Target, GraduationCap
} from 'lucide-react';
import { authAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import { SERVER_URL } from '../services/api';
import { Link } from 'react-router-dom';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const MiniStat = ({ icon: Icon, value, label, color }) => (
  <div className="bg-[var(--surface-1)] border border-[var(--border-light)] rounded-2xl p-4 text-center shadow-[var(--shadow-sm)]">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
      <Icon size={20} />
    </div>
    <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</p>
  </div>
);

// ── Avatar Upload ─────────────────────────────────────────────────────────────
const AvatarUpload = ({ user, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const inputRef = useRef();

  const displayAvatar = user?.profilePicture || user?.avatar;

  const avatarSrc = displayAvatar
    ? displayAvatar.startsWith('http')
      ? displayAvatar
      : `${SERVER_URL}/${displayAvatar}`
    : '';

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('avatar', file);

      const { data } = await authAPI.updateProfile(fd);
      onUpload(data.user);
      setShowPhotoOptions(false);
    } catch (err) {
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleResetToGooglePhoto = async () => {
    if (!user?.avatar) return;

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('removeProfilePicture', 'true');

      const { data } = await authAPI.updateProfile(fd);
      onUpload(data.user);
      setShowPhotoOptions(false);
    } catch (err) {
      alert('Failed to switch back to Google photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-24 h-24 mx-auto">
      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-[var(--shadow-md)]">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={user?.name || 'User'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span>{user?.name?.charAt(0).toUpperCase()}</span>
        )}
      </div>

      {/* Edit photo button */}
      <button
        type="button"
        onClick={() => setShowPhotoOptions((prev) => !prev)}
        disabled={uploading}
        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-colors disabled:opacity-60"
        title="Edit photo"
      >
        {uploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <Camera size={15} />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* Photo options dropdown */}
      {showPhotoOptions && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-44 bg-[var(--surface-1)] border border-[var(--border-light)] rounded-xl shadow-[var(--shadow-lg)] p-2 z-30">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Upload Photo
          </button>

          {user?.profilePicture && user?.avatar && (
            <button
              type="button"
              onClick={handleResetToGooglePhoto}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-[var(--bg-hover)] transition-colors"
            >
              Use Google Photo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Edit Profile Form ─────────────────────────────────────────────────────────
const EditProfileForm = ({ user, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: user.name || '',
    bio: user.bio || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('bio', form.bio);

      const { data } = await authAPI.updateProfile(fd);
      onSave(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
          ⚠️ {error}
        </p>
      )}

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Full Name
        </label>

        <input
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 text-sm bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Bio{' '}
          <span className="text-[var(--text-muted)]">
            ({form.bio.length}/300)
          </span>
        </label>

        <textarea
          value={form.bio}
          onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
          maxLength={300}
          rows={3}
          placeholder="Tell us about yourself..."
          className="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 text-sm bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-[var(--border-light)] text-[var(--text-secondary)] py-2 rounded-xl text-sm hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center gap-1.5"
        >
          <X size={14} /> Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 disabled:bg-blue-300"
        >
          <Save size={14} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// ── Change Password Form ──────────────────────────────────────────────────────
const ChangePasswordForm = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [show, setShow] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message.text && (
        <div
          className={`px-4 py-3 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
        <div key={field}>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1 capitalize">
            {field.replace(/([A-Z])/g, ' $1').trim()}
          </label>

          <div className="relative">
            <input
              type={show[field] ? 'text' : 'password'}
              value={form[field]}
              onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
              required
              className="w-full border border-[var(--border-light)] rounded-xl px-4 py-2.5 pr-10 text-sm bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              type="button"
              onClick={() => setShow(p => ({ ...p, [field]: !p[field] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              {show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Lock size={14} />
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
};

// ── Main Profile Page ─────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState(user);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          authAPI.getStats(),
          enrollmentAPI.getMyCourses()
        ]);

        setStats(statsRes.data.stats);
        setCourses(coursesRes.data.courses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setProfile(updatedUser);

    const token = localStorage.getItem('token');

    if (token) {
      login(token, { ...user, ...updatedUser });
    }

    setEditing(false);
  };

  const TABS = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'courses', label: '📚 My Courses' },
    { id: 'security', label: '🔒 Password' }
  ];

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <Loader text="Loading profile..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your account">
      <div className="max-w-4xl mx-auto">

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <MiniStat
            icon={BookOpen}
            value={stats?.enrolledCourses || 0}
            label="Enrolled"
            color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />

          <MiniStat
            icon={Target}
            value={`${stats?.avgQuizScore || 0}%`}
            label="Avg Score"
            color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          />

          <MiniStat
            icon={Award}
            value={stats?.certificates || 0}
            label="Certificates"
            color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          />

          <MiniStat
            icon={GraduationCap}
            value={stats?.quizzesPassed || 0}
            label="Quizzes Passed"
            color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Avatar + Info */}
          <div className="space-y-4">

            {/* Profile Card */}
            <div className="bg-[var(--surface-1)] border border-[var(--border-light)] rounded-2xl p-5 text-center shadow-[var(--shadow-sm)]">
              <AvatarUpload user={profile} onUpload={handleProfileUpdate} />

              <div className="mt-5">
                <h2 className="font-bold text-[var(--text-primary)] text-lg">
                  {profile?.name}
                </h2>

                <p className="text-xs text-[var(--text-secondary)] mt-0.5 capitalize">
                  {profile?.role} Account
                </p>

                {profile?.bio && (
                  <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
                <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
                  <Clock size={11} />
                  Member since{' '}
                  {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Auth provider badge */}
            <div className="bg-[var(--surface-1)] border border-[var(--border-light)] rounded-2xl p-4 shadow-[var(--shadow-sm)]">
              <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">
                Sign-in Method
              </p>

              <div className="flex items-center gap-2">
                {profile?.authProvider === 'google' ? (
                  <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                    <svg width="16" height="16" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                    </svg>
                    Google Account
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                    <Lock size={14} className="text-blue-500" />
                    Email & Password
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Tabs */}
          <div className="lg:col-span-2 space-y-4">

            {/* Tab navigation */}
            <div className="flex gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-light)]">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[var(--surface-1)] text-blue-600 dark:text-blue-400 shadow-[var(--shadow-sm)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-[var(--surface-1)] border border-[var(--border-light)] rounded-2xl p-5 shadow-[var(--shadow-sm)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Personal Information
                  </h3>

                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <EditProfileForm
                    user={profile}
                    onSave={handleProfileUpdate}
                    onCancel={() => setEditing(false)}
                  />
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: 'Full Name', value: profile?.name },
                      { label: 'Email', value: profile?.email },
                      { label: 'Role', value: profile?.role, extra: 'capitalize' },
                      { label: 'Bio', value: profile?.bio || '—' }
                    ].map(({ label, value, extra }) => (
                      <div
                        key={label}
                        className="flex flex-col sm:flex-row sm:items-center gap-1 pb-3 border-b border-[var(--border-light)] last:border-0 last:pb-0"
                      >
                        <span className="text-xs font-medium text-[var(--text-secondary)] sm:w-28 flex-shrink-0">
                          {label}
                        </span>

                        <span className={`text-sm text-[var(--text-primary)] ${extra || ''}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="bg-[var(--surface-1)] border border-[var(--border-light)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
                <div className="px-5 py-4 border-b border-[var(--border-light)]">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Enrolled Courses ({courses.length})
                  </h3>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen size={32} className="mx-auto text-[var(--text-muted)] mb-3" />

                    <p className="text-[var(--text-secondary)] text-sm mb-3">
                      Not enrolled in any courses yet
                    </p>

                    <Link
                      to="/courses"
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      Browse Courses →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-light)]">
                    {courses.map(course => (
                      <div
                        key={course._id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                          {course.thumbnail ? (
                            <img
                              src={`${SERVER_URL}/${course.thumbnail}`}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen size={18} className="m-auto mt-1.5 text-blue-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {course.title}
                          </p>

                          <p className="text-xs text-[var(--text-secondary)]">
                            {course.category} • {course.level}
                          </p>
                        </div>

                        <Link
                          to={`/courses/${course._id}`}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                        >
                          Continue →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'security' && (
              <div className="bg-[var(--surface-1)] border border-[var(--border-light)] rounded-2xl p-5 shadow-[var(--shadow-sm)]">
                <h3 className="font-semibold text-[var(--text-primary)] mb-5">
                  Change Password
                </h3>

                {profile?.authProvider === 'google' ? (
                  <div className="text-center py-6">
                    <p className="text-[var(--text-secondary)] text-sm">
                      You signed in with Google. Password changes must be done through your Google account settings.
                    </p>
                  </div>
                ) : (
                  <ChangePasswordForm />
                )}

                <div className="mt-5 pt-5 border-t border-[var(--border-light)]">
                  <Link
                    to="/security"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    🔐 Manage Two-Factor Authentication →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;