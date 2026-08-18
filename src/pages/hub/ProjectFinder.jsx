import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  Layers,
  ArrowRight,
  BookmarkCheck,
  Check,
  Loader2,
  Filter,
  Compass,
  Cpu,
  Bookmark,
  ChevronRight,
  Zap,
  Globe,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { recommendProjects, getSavedProjects, saveProject } from '../../services/projectService';
import { getAiErrorMessage } from '../../utils/aiErrorUtils';
import CareerHubHeader from '../../components/hub/CareerHubHeader';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function ProjectFinder() {
  const navigate = useNavigate();

  // Form preferences state
  const [language, setLanguage] = useState('Java');
  const [domain, setDomain] = useState('Web Development');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [fullStackRequired, setFullStackRequired] = useState(true);
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const [savedProjects, setSavedProjects] = useState([]);
  const [savingMap, setSavingMap] = useState({});

  useEffect(() => {
    fetchSavedProjects();
  }, []);

  const fetchSavedProjects = async () => {
    try {
      const data = await getSavedProjects();
      setSavedProjects(data || []);
    } catch (err) {
      console.error("Failed to load saved projects:", err);
    }
  };

  const isProjectSaved = (projId) => {
    return savedProjects.some(sp => sp.project?.id === projId || sp.projectId === projId);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const reqPayload = {
        language,
        domain,
        difficulty,
        fullStackRequired,
        careerGoal
      };

      const res = await recommendProjects(reqPayload);
      setRecommendations(res || []);
    } catch (err) {
      console.error("Failed to generate project recommendations:", err);
      setError(getAiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (projectId) => {
    try {
      setSavingMap(prev => ({ ...prev, [projectId]: true }));
      await saveProject(projectId);
      await fetchSavedProjects();
    } catch (err) {
      console.error("Failed to save project:", err);
      alert("Could not save project to learning plan.");
    } finally {
      setSavingMap(prev => ({ ...prev, [projectId]: false }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-body pb-12">
      <CareerHubHeader />

      {/* Header Banner */}
      <div className="bg-[#EFECE6] dark:bg-[#1E1E1E] border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#C85232]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85232]/10 border border-[#C85232]/25 text-[#C85232] font-semibold text-xs mb-3">
              <Sparkles size={14} />
              <span>Tailored Portfolio Builder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] dark:text-white">
              AI Industry Project Finder
            </h1>
            <p className="text-xs sm:text-sm text-[#5E5B56] dark:text-neutral-400 mt-1 max-w-xl">
              Generate real-world, recruiters-approved project architectures tailored to your tech stack, domain, and career goals.
            </p>
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold font-heading text-[#111111] dark:text-white mb-6 flex items-center gap-2">
          <Filter size={18} className="text-[#C85232]" />
          Project Preferences & Career Scope
        </h2>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-[#111111] dark:text-neutral-300 mb-2">
                Primary Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232]"
              >
                <option value="Java">Java (Spring Boot)</option>
                <option value="Python">Python (Django / FastAPI / AI)</option>
                <option value="JavaScript / TypeScript">JavaScript / TypeScript (Node.js / React)</option>
                <option value="C++">C++ (Systems / Performance)</option>
                <option value="Go">Golang (Microservices / Cloud)</option>
              </select>
            </div>

            {/* Target Domain */}
            <div>
              <label className="block text-xs font-bold text-[#111111] dark:text-neutral-300 mb-2">
                Target Technology Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232]"
              >
                <option value="Web Development">Web Development & Cloud Portals</option>
                <option value="AI / Machine Learning">AI & Generative Language Apps</option>
                <option value="Cloud & DevOps">DevOps & Distributed Systems</option>
                <option value="Mobile Development">Mobile Applications (iOS / Android)</option>
                <option value="Cybersecurity">Cybersecurity & SecOps</option>
              </select>
            </div>

            {/* Target Difficulty */}
            <div>
              <label className="block text-xs font-bold text-[#111111] dark:text-neutral-300 mb-2">
                Project Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      difficulty === level
                        ? 'bg-[#C85232] text-white border-[#C85232] shadow-xs'
                        : 'bg-[#FAF8F5] dark:bg-[#121212] border-[rgba(0,0,0,0.12)] dark:border-[#333333] text-[#5E5B56] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    {level === 'EASY' ? 'Beginner' : level === 'MEDIUM' ? 'Intermediate' : 'Advanced'}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Career Goal */}
            <div>
              <label className="block text-xs font-bold text-[#111111] dark:text-neutral-300 mb-2">
                Target Role / Career Goal
              </label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. SDE-1, Full Stack Developer, AI Engineer"
                className="w-full bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232]"
              />
            </div>
          </div>

          {/* Full-Stack Toggle */}
          <div className="pt-2 flex items-center justify-between bg-[#FAF8F5] dark:bg-[#121212] p-4 rounded-xl border border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-[#111111] dark:text-white">Full-Stack Architecture Scope</span>
              <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">
                Include both frontend UI, backend APIs, and database models in recommendations
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={fullStackRequired}
                onChange={(e) => setFullStackRequired(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85232]"></div>
            </label>
          </div>

          {/* Submit CTA */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-[#C85232] hover:bg-[#B34528] disabled:bg-neutral-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Curating Projects with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Recommended Projects</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <LoadingState message="Finding recommended portfolio projects..." />
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={handleGenerate} />
      )}

      {!loading && !error && recommendations.length === 0 && (
        <EmptyState
          title="No Project Recommendations"
          description="Select your target language, domain, and difficulty preferences to generate tailored portfolio projects."
          actionLabel="Generate Projects"
          onAction={handleGenerate}
        />
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-[#C85232]" />
              Recommended Projects for You
            </h2>
            <span className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
              {recommendations.length} Industry Projects Generated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((proj) => {
              const isSaved = isProjectSaved(proj.id);
              const isSaving = savingMap[proj.id];

              return (
                <div
                  key={proj.id}
                  className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] hover:border-[#C85232] rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                        proj.difficulty === 'EASY'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : proj.difficulty === 'HARD'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      }`}>
                        {proj.difficulty || 'MEDIUM'}
                      </span>

                      <button
                        onClick={() => handleSaveProject(proj.id)}
                        disabled={isSaved || isSaving}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isSaved
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 cursor-default'
                            : 'bg-[#FAF8F5] dark:bg-[#252525] text-neutral-500 hover:text-[#C85232]'
                        }`}
                        title={isSaved ? "Saved to Learning Plan" : "Add to Learning Plan"}
                      >
                        {isSaving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : isSaved ? (
                          <BookmarkCheck size={16} />
                        ) : (
                          <Bookmark size={16} />
                        )}
                      </button>
                    </div>

                    <h3 className="font-bold text-sm font-heading text-[#111111] dark:text-white group-hover:text-[#C85232] transition-colors line-clamp-2">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] line-clamp-3 leading-relaxed">
                      {proj.problemStatement || proj.description}
                    </p>

                    <div className="pt-2 border-t border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A] space-y-1.5 text-[11px]">
                      <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                        <strong className="text-[#111111] dark:text-neutral-200">Tech Stack:</strong> {proj.techStack || proj.technologyStack}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A] flex items-center justify-between">
                    <Link
                      to={`/hub/projects/${proj.id}`}
                      className="w-full py-2 px-3 bg-[#FAF8F5] dark:bg-[#222222] hover:bg-[#C85232] hover:text-white text-[#111111] dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>View Roadmap & Architecture</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved Projects Section */}
      {savedProjects.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold font-heading text-[#111111] dark:text-white mb-4 flex items-center gap-2">
            <BookmarkCheck size={18} className="text-emerald-500" />
            Saved Projects in Your Learning Plan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedProjects.map((sp) => {
              const projectObj = sp.project || {};
              return (
                <div
                  key={sp.id}
                  onClick={() => navigate(`/hub/projects/${projectObj.id || sp.projectId}`)}
                  className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] bg-[#FAF8F5] dark:bg-[#121212] hover:border-[#C85232] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                      <Code2 size={20} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#111111] dark:text-white truncate">
                        {projectObj.title || "Saved Project"}
                      </p>
                      <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5 truncate">
                        {projectObj.technologyStack || projectObj.domain || "Software Architecture"}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-neutral-400 group-hover:text-[#C85232] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
