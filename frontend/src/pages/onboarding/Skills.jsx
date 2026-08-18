import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState';
import {
  Check,
  ArrowRight,
  Code2,
  BookOpen,
  Cpu,
  Award,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const Skills = () => {
  const { updateUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState({}); // { skillId: proficiencyLevel }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await api.get('/skills');
        setSkills(response.data || []);
      } catch (err) {
        console.error('Failed to load skills', err);
        setError('Failed to load skills list. Please refresh or try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const handleToggleSkill = (skillId) => {
    setSelectedSkills((prev) => {
      const copy = { ...prev };
      if (copy[skillId]) {
        delete copy[skillId];
      } else {
        copy[skillId] = 'BEGINNER';
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
          proficiencyLevel: selectedSkills[id],
        })),
      };

      await api.post('/onboarding/skills', payload);
      navigate('/onboarding/goals');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)]">
        <LoadingState message="Loading skill catalog..." />
      </div>
    );
  }

  const selectedCount = Object.keys(selectedSkills).length;

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 bg-[var(--bg-canvas)] text-[var(--text-primary)] font-body">
      {/* Header */}
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C85232] flex items-center justify-center text-white font-bold text-xl shadow-xs">
            P
          </div>
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
      <main className="max-w-4xl w-full mx-auto my-8">
        {/* Step Indicator */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-2">
            <span className="text-[#C85232]">Step 1 of 2: Skill Inventory</span>
            <span>Next: Target Goals</span>
          </div>
          <div className="w-full bg-[#EAE6DF] dark:bg-[#2A2A2A] h-2 rounded-full overflow-hidden">
            <div className="bg-[#C85232] h-full w-1/2 transition-all duration-300"></div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 font-heading text-[#111111] dark:text-white">
            What are your core technical skills?
          </h1>
          <p className="text-base text-[#5E5B56] dark:text-[#A0A0A0] max-w-xl mx-auto">
            Select the languages, frameworks, and subjects you know. This builds your diagnostic baseline for AI mock interviews.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {Object.entries(groupedSkills).map(([category, catSkills]) => (
            <div key={category} className="card-warm dark:bg-[#1E1E1E] p-6">
              <h2 className="text-lg font-bold font-heading mb-4 text-[#111111] dark:text-white flex items-center gap-2 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                <Code2 size={18} className="text-[#C85232]" />
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
                          <div className="flex gap-1.5">
                            {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
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
          <div className="sticky bottom-6 card-warm dark:bg-[#1E1E1E] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <span className="text-sm font-semibold text-[#111111] dark:text-white">
              {selectedCount} {selectedCount === 1 ? 'skill' : 'skills'} selected
            </span>

            <button
              type="submit"
              disabled={submitting || selectedCount === 0}
              className="btn-terracotta px-8 py-3 w-full sm:w-auto disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Saving...
                </>
              ) : (
                <>
                  Next: Career Goals <ArrowRight size={18} />
                </>
              )}
            </button>
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
