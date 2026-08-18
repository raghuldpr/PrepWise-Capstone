import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, Lock, Mail, User, AlertCircle, Sun, Moon, Loader2, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      navigate('/onboarding');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setGeneralError('Email is already registered. Please sign in or use a different email.');
      } else if (err.response && err.response.data && err.response.data.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setGeneralError(err.response.data.message);
      } else {
        setGeneralError('Failed to complete registration. Please check your network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 transition-colors duration-200 bg-[var(--bg-canvas)] text-[var(--text-primary)] font-body">
      {/* Header */}
      <header className="flex justify-between items-center max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C85232] flex items-center justify-center text-white font-bold text-xl shadow-xs">
            P
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#111111] dark:text-white font-heading">
            PrepWise
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-surface text-primary hover:bg-surface-alt transition-colors"
          title="Toggle theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md w-full mx-auto my-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 font-heading text-[#111111] dark:text-white">
            Create Your Account
          </h1>
          <p className="text-sm md:text-base text-[#5E5B56] dark:text-[#A0A0A0]">
            Start building your career readiness with AI-powered coaching
          </p>
        </div>

        <div className="card-warm dark:bg-[#1E1E1E]">
          {generalError && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E5B56] dark:text-[#A0A0A0]">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    fieldErrors.name
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] focus:ring-[#C85232]'
                  } bg-white dark:bg-[#242424] text-[#111111] dark:text-white focus:outline-none focus:ring-2 text-sm`}
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E5B56] dark:text-[#A0A0A0]">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    fieldErrors.email
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] focus:ring-[#C85232]'
                  } bg-white dark:bg-[#242424] text-[#111111] dark:text-white focus:outline-none focus:ring-2 text-sm`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E5B56] dark:text-[#A0A0A0]">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    fieldErrors.password
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] focus:ring-[#C85232]'
                  } bg-white dark:bg-[#242424] text-[#111111] dark:text-white focus:outline-none focus:ring-2 text-sm`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E5B56] dark:text-[#A0A0A0]">
                  <Lock size={18} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    fieldErrors.confirmPassword
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] focus:ring-[#C85232]'
                  } bg-white dark:bg-[#242424] text-[#111111] dark:text-white focus:outline-none focus:ring-2 text-sm`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-terracotta text-base py-3.5 mt-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] text-center text-sm text-[#5E5B56] dark:text-[#A0A0A0]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#C85232] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] text-center text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
        PrepWise Placement Intelligence Platform © 2026
      </footer>
    </div>
  );
};

export default Register;
