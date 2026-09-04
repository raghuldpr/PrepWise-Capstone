import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import {
  Briefcase,
  Building,
  GraduationCap,
  Target,
  ArrowRight,
  AlertCircle,
  Sun,
  Moon,
  Loader2,
  Calendar,
} from 'lucide-react';

export const Goals = () => {
  const { updateUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    targetRole: 'Software Development Engineer',
    targetCompany: '',
    education: 'B.Tech Computer Science',
    college: '',
    graduationYear: 2026,
    careerGoal: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!formData.targetRole.trim()) {
      setFieldErrors({ targetRole: 'Target role is required.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        targetRole: formData.targetRole.trim(),
        targetCompany: formData.targetCompany.trim() || null,
        education: formData.education.trim() || null,
        college: formData.college.trim() || null,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null,
        careerGoal: formData.careerGoal.trim() || null,
      };

      const response = await api.post('/onboarding/goals', payload);

      // Update user state locally
      updateUser({ onboardingCompleted: true });

      navigate('/onboarding/complete');
    } catch (err) {
      console.error('Failed to save goals', err);
      if (err.response && err.response.data && err.response.data.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setGeneralError(err.response.data.message);
      } else {
        setGeneralError('Failed to save career goals. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const popularRoles = [
    'Software Development Engineer (SDE)',
    'Backend Engineer',
    'Frontend Engineer',
    'Full Stack Developer',
    'Data Scientist / ML Engineer',
    'DevOps / Cloud Engineer',
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 bg-[var(--bg-canvas)] text-[var(--text-primary)] font-body">
      {/* Header */}
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img
            src="/apple-touch-icon.png"
            alt="PrepWise"
            className="w-10 h-10 rounded-xl object-contain shadow-xs shrink-0"
            onError={(e) => { e.currentTarget.src = '/favicon-32x32.png'; }}
          />
          <span className="font-extrabold text-2xl tracking-tight text-[#111111] dark:text-white font-heading">
            PrepWise
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-surface text-primary hover:bg-surface-alt transition-colors"
          title="Toggle theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto my-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-2">
            <span>Step 1: Skills ✓</span>
            <span className="text-[#C85232]">Step 2 of 2: Target & Goals</span>
          </div>
          <div className="w-full bg-[#EAE6DF] dark:bg-[#2A2A2A] h-2 rounded-full overflow-hidden">
            <div className="bg-[#C85232] h-full w-full transition-all duration-300"></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 font-heading text-[#111111] dark:text-white">
            Set Your Target Role & Career Goals
          </h1>
          <p className="text-base text-[#5E5B56] dark:text-[#A0A0A0]">
            PrepWise uses your target company and role to customize interview questions, resume ATS keywords, and daily practice plans.
          </p>
        </div>

        {generalError && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <div className="card-warm dark:bg-[#1E1E1E]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Role */}
            <div>
              <label
                htmlFor="targetRole"
                className="block text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white mb-2"
              >
                Target Job Role *
              </label>
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E5B56] dark:text-[#A0A0A0]">
                  <Briefcase size={18} />
                </div>
                <input
                  id="targetRole"
                  name="targetRole"
                  type="text"
                  required
                  placeholder="e.g. Software Development Engineer"
                  value={formData.targetRole}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    fieldErrors.targetRole
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] focus:ring-[#C85232]'
                  } bg-white dark:bg-[#242424] text-[#111111] dark:text-white focus:outline-none focus:ring-2 text-sm`}
                />
              </div>
              {fieldErrors.targetRole && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-2">
                  {fieldErrors.targetRole}
                </p>
              )}

              {/* Quick Select Role Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {popularRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, targetRole: role }))
                    }
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      formData.targetRole === role
                        ? 'border-[#C85232] bg-[#C85232] text-white'
                        : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] text-[#5E5B56] dark:text-[#A0A0A0] hover:bg-[#EAE6DF] dark:hover:bg-[#2D2D2D]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Company */}
            <div>
              <label
                htmlFor="targetCompany"
                className="block text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white mb-2"
              >
                Target Company (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E5B56] dark:text-[#A0A0A0]">
                  <Building size={18} />
                </div>
                <input
                  id="targetCompany"
                  name="targetCompany"
                  type="text"
                  placeholder="e.g. Google, Amazon, TCS, Microsoft"
                  value={formData.targetCompany}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-white dark:bg-[#242424] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85232] text-sm"
                />
              </div>
            </div>

            {/* Education & College */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="college"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white mb-2"
                >
                  College / University
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E5B56] dark:text-[#A0A0A0]">
                    <GraduationCap size={18} />
                  </div>
                  <input
                    id="college"
                    name="college"
                    type="text"
                    placeholder="e.g. National Institute of Technology"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-white dark:bg-[#242424] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85232] text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="graduationYear"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white mb-2"
                >
                  Graduation Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E5B56] dark:text-[#A0A0A0]">
                    <Calendar size={18} />
                  </div>
                  <input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    placeholder="2026"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-white dark:bg-[#242424] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85232] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Career Goal */}
            <div>
              <label
                htmlFor="careerGoal"
                className="block text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white mb-2"
              >
                Career Goal or Objective (Optional)
              </label>
              <div className="relative">
                <textarea
                  id="careerGoal"
                  name="careerGoal"
                  rows={3}
                  placeholder="e.g. Master Data Structures and System Design to crack product-based company campus placement."
                  value={formData.careerGoal}
                  onChange={handleChange}
                  className="w-full p-3.5 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-white dark:bg-[#242424] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C85232] text-sm resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-terracotta text-base py-3.5 mt-4 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Completing Onboarding...
                </>
              ) : (
                <>
                  Complete Setup & Generate Plan <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] text-center text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
        PrepWise Placement Intelligence Platform © 2026
      </footer>
    </div>
  );
};

export default Goals;
