// pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import GoogleAuthButton from '../components/GoogleAuthButton';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const labelClassName =
    'block text-sm font-medium text-[var(--text-primary)] mb-1';

  const inputClassName =
    'w-full border border-[var(--border-light)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--surface-1)] text-[var(--text-primary)] transition';

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role || 'student'
      });

      login(data.token, data.user);

      const roleRedirects = {
        admin: '/admin',
        instructor: '/instructor',
        student: '/dashboard'
      };

      navigate(roleRedirects[data.user.role] || '/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] transition-colors duration-200 flex items-center justify-center px-4 py-12">
      <div className="bg-[var(--surface-1)] rounded-2xl shadow-[var(--shadow-lg)] w-full max-w-md p-8 border border-[var(--border-light)] transition-colors duration-200">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <svg
              className="w-7 h-7 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Create your account
          </h1>

          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Start your learning journey today
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className={labelClassName}>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className={inputClassName}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className={labelClassName}>
              I want to join as
            </label>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: 'student',
                  label: '🎓 Student',
                  desc: 'Learn new skills'
                },
                {
                  value: 'instructor',
                  label: '👨‍🏫 Instructor',
                  desc: 'Teach & earn'
                }
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      role: value
                    }))
                  }
                  className={`p-3 border-2 rounded-xl text-left transition-all ${
                    formData.role === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-[var(--border-light)] bg-[var(--surface-1)] hover:border-blue-300'
                  }`}
                >
                  <p
                    className={`font-semibold text-sm ${
                      formData.role === value
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {label}
                  </p>

                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {desc}
                  </p>
                </button>
              ))}
            </div>

            {formData.role === 'instructor' && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Instructor accounts require admin approval before accessing instructor features.
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className={labelClassName}>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className={inputClassName}
            />
          </div>

          {/* Password */}
          <div>
            <label className={labelClassName}>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              className={inputClassName}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className={labelClassName}>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              className={inputClassName}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>

                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-light)]" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-[var(--surface-1)] px-3 text-xs text-[var(--text-secondary)] uppercase tracking-wide">
                or sign up with
              </span>
            </div>
          </div>

          {/* Google Auth */}
          <GoogleAuthButton label="Sign up with Google" />

          {/* Note about Google accounts */}
          <p className="text-center text-xs text-[var(--text-secondary)]">
            Google accounts are registered as Students by default.
            You can change your role from your profile settings.
          </p>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;