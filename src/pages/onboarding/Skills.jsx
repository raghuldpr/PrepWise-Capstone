import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Code2,
  BookOpen,
  Cpu,
  Layers,
  Award,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const Skills = () => {
  const { user, updateUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState({}); // { skillId: proficiencyLevel }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isManagingExisting = Boolean(user?.onboardingCompleted);

  useEffect(() => {
    const fetchSkillsAndProfile = async () => {
      try {
        const [skillsRes, profileRes] = await Promise.allSettled([
          api.get('/skills'),
          api.get('/users/profile')
        ]);

        if (skillsRes.status === 'fulfilled') {
          setSkills(skillsRes.value.data || []);
        } else {
          throw new Error('Failed to load skills list');
        }

        // Pre-populate if user has already saved skills
        if (profileRes.status === 'fulfilled' && profileRes.value.data?.skills?.length > 0) {
          const preloaded = {};
          profileRes.value.data.skills.forEach((s) => {
            preloaded[s.id] = s.proficiencyLevel || 'INTERMEDIATE';
          });
          setSelectedSkills(preloaded);
        }
      } catch (err) {
        console.error('Failed to load skills data', err);
        setError('Failed to load skills catalog. Please refresh or try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSkillsAndProfile();
  }, []);

  const handleToggleSkill = (skillId) => {
    setSelectedSkills((prev) => {
      const copy = { ...prev };
      if (copy[skillId]) {
        delete copy[skillId];
      } else {
        copy[skillId] = 'INTERMEDIATE';
      }
      return copy;
    });
    if (error) setError('');
  };

  const handleProficiencyChange = (skillId, level) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skillId]: level,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skillKeys = Object.keys(selectedSkills);

    if (skillKeys.length === 0) {
      setError('Please select at least one skill to continue.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        skills: skillKeys.map((id) => ({
          skillId: parseInt(id, 10),
          proficiencyLevel: selectedSkills[id] || 'BEGINNER',
        })),
      };

      await api.post('/onboarding/skills', payload);

      if (isManagingExisting) {
        setSuccessMessage('Skills updated successfully! Returning to profile...');
        setTimeout(() => {
          navigate('/profile');
        }, 800);
      } else {
        navigate('/onboarding/goals');
      }
    } catch (err) {
      console.error('Error saving skills', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save skills. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const getCategoryIcon = (category) => {
    const c = category.toLowerCase();
    if (c.includes('program') || c.includes('code')) return <Code2 size={18} className="text-[#C85232]" />;
    if (c.includes('core') || c.includes('science')) return <Cpu size={18} className="text-[#C85232]" />;
    if (c.includes('backend') || c.includes('cloud')) return <Layers size={18} className="text-[#C85232]" />;
    if (c.includes('frontend') || c.includes('web')) return <BookOpen size={18} className="text-[#C85232]" />;
    return <Sparkles size={18} className="text-[#C85232]" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)]">
        <LoadingState message="Loading technical skill catalog..." />
      </div>
    );
  }

  const selectedCount = Object.keys(selectedSkills).length;

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

        <div className="flex items-center gap-3">
          {isManagingExisting && (
            <Link
              to="/profile"
              className="text-xs font-semibold text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#C85232] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Profile
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-surface text-primary hover:bg-surface-alt transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto my-8">
        {/* Step Indicator */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-2">
            <span className="text-[#C85232]">
              {isManagingExisting ? 'Skill Stack Management' : 'Step 1 of 2: Skill Inventory'}
            </span>
            <span>{isManagingExisting ? 'Profile Sync' : 'Next: Target Goals'}</span>
          </div>
          <div className="w-full bg-[#EAE6DF] dark:bg-[#2A2A2A] h-2 rounded-full overflow-hidden">
            <div
              className={`bg-[#C85232] h-full transition-all duration-300 ${
                isManagingExisting ? 'w-full' : 'w-1/2'
              }`}
            ></div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 font-heading text-[#111111] dark:text-white">
            {isManagingExisting ? 'Manage Your Technical Skills' : 'What are your core technical skills?'}
          </h1>
          <p className="text-base text-[#5E5B56] dark:text-[#A0A0A0] max-w-xl mx-auto">
            Select the languages, frameworks, core subjects, and aptitude areas you know. This builds your diagnostic baseline for AI mock interviews and skill gap roadmaps.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
            <Check size={18} className="shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {Object.entries(groupedSkills).map(([category, catSkills]) => (
            <div key={category} className="card-warm dark:bg-[#1E1E1E] p-6">
              <h2 className="text-lg font-bold font-heading mb-4 text-[#111111] dark:text-white flex items-center gap-2 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                {getCategoryIcon(category)}
                {category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catSkills.map((skill) => {
                  const isSelected = !!selectedSkills[skill.id];
                  const level = selectedSkills[skill.id] || 'BEGINNER';

                  return (
                    <div
                      key={skill.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? 'border-[#C85232] bg-white dark:bg-[#252525] shadow-xs ring-1 ring-[#C85232]'
                          : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-surface hover:border-[rgba(0,0,0,0.25)] dark:hover:border-[rgba(255,255,255,0.25)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div
                          onClick={() => handleToggleSkill(skill.id)}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? 'bg-[#C85232] border-[#C85232] text-white'
                                  : 'border-[rgba(0,0,0,0.25)] dark:border-[rgba(255,255,255,0.3)]'
                              }`}
                            >
                              {isSelected && <Check size={14} />}
                            </div>
                            <span className="font-bold text-sm text-[#111111] dark:text-white">
                              {skill.name}
                            </span>
                          </div>
                          {skill.description && (
                            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-1 pl-7">
                              {skill.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Proficiency Selector if Selected */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] pl-7">
                          <label className="block text-xs font-semibold text-[#5E5B56] dark:text-[#A0A0A0] mb-1.5">
                            Proficiency Level:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleProficiencyChange(skill.id, lvl)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                  level === lvl
                                    ? 'bg-[#C85232] text-white'
                                    : 'bg-[#EAE6DF] dark:bg-[#333333] text-[#5E5B56] dark:text-[#A0A0A0] hover:bg-[#DDD8CF]'
                                }`}
                              >
                                {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sticky Bottom Actions */}
          <div className="sticky bottom-6 card-warm dark:bg-[#1E1E1E] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md rounded-xl">
            <span className="text-sm font-semibold text-[#111111] dark:text-white">
              {selectedCount} {selectedCount === 1 ? 'skill' : 'skills'} selected
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isManagingExisting && (
                <Link
                  to="/profile"
                  className="btn-outline px-5 py-2.5 text-xs text-center flex-1 sm:flex-initial"
                >
                  Cancel
                </Link>
              )}

              <button
                type="submit"
                disabled={submitting || selectedCount === 0}
                className="btn-terracotta px-8 py-3 w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Saving...
                  </>
                ) : isManagingExisting ? (
                  <>
                    <Check size={18} /> Save & Update Profile
                  </>
                ) : (
                  <>
                    Next: Career Goals <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] text-center text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
        PrepWise Placement Intelligence Platform © 2026
      </footer>
    </div>
  );
};

export default Skills;
