import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  BookmarkCheck,
  Bookmark,
  ArrowLeft,
  Layers,
  CheckCircle2,
  Compass,
  Lightbulb,
  Rocket,
  Check,
  Loader2,
  BarChart2,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { getProjectById, saveProject, getSavedProjects } from '../../services/projectService';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchProjectData();
    checkIfSaved();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectById(id);
      setProject(data);
    } catch (err) {
      console.error("Failed to load project details:", err);
      setError("Unable to load project recommendation details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const savedList = await getSavedProjects();
      const match = savedList.some(sp => String(sp.project?.id || sp.projectId) === String(id));
      setIsSaved(match);
    } catch (err) {
      console.error("Failed to check saved projects:", err);
    }
  };

  const handleAddToLearningPlan = async () => {
    if (isSaved || saving) return;

    try {
      setSaving(true);
      await saveProject(id);
      setIsSaved(true);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save project:", err);
      alert("Could not add project to your learning plan.");
    } finally {
      setSaving(false);
    }
  };

  // Helper to parse comma-separated or list-based text into arrays
  const parseList = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    return String(str)
      .split(/,|\n|;/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  if (loading) {
    return <LoadingState message="Loading project specification..." />;
  }

  if (error || !project) {
    return <ErrorState message={error || "The requested project specification could not be located."} onRetry={fetchProjectData} />;
  }

  const techStackList = parseList(project.techStack || project.technologyStack);
  const skillsList = parseList(project.skillsCovered);
  const roadmapSteps = parseList(project.roadmap || project.developmentRoadmap);

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-body pb-12">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/hub/projects')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Project Recommendations
        </button>

        {/* CTA Button */}
        <button
          onClick={handleAddToLearningPlan}
          disabled={isSaved || saving}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
            isSaved
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-[#C85232] hover:bg-[#B34528] text-white active:scale-98'
          }`}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isSaved ? (
            <>
              <CheckCircle2 size={16} />
              <span>Saved in Learning Plan</span>
            </>
          ) : (
            <>
              <Bookmark size={16} />
              <span>Add to Learning Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Save Toast Notification */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>Project successfully added to your personalized learning plan!</span>
        </div>
      )}

      {/* Hero Banner Card */}
      <div className="bg-surface border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#C85232]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                project.difficulty === 'EASY'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : project.difficulty === 'HARD'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              }`}>
                {project.difficulty || 'MEDIUM'} DIFFICULTY
              </span>
              <span className="text-xs text-[#5E5B56] dark:text-neutral-400">• Portfolio Ready</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] dark:text-white">
              {project.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#5E5B56] dark:text-neutral-300 leading-relaxed max-w-3xl">
              {project.problemStatement || project.description}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Tech Stack & Skills Covered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technology Stack Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-lg bg-[#C85232]/10 text-[#C85232] flex items-center justify-center font-bold">
              <Code2 size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm font-heading text-[#111111] dark:text-white">Recommended Technology Stack</h2>
              <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">Frameworks, tools, and databases</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {techStackList.map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#222222] border border-[rgba(0,0,0,0.08)] dark:border-[#333333] text-xs font-semibold text-[#111111] dark:text-white"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Skills Covered Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm font-heading text-[#111111] dark:text-white">Skills You Will Master</h2>
              <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">Key concepts evaluated in interviews</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {skillsList.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Why This Project & Placement Relevance Card */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Lightbulb size={18} />
          </div>
          <div>
            <h2 className="font-bold text-base font-heading text-[#111111] dark:text-white">Why This Project?</h2>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">Recruiter value and interview discussion leverage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <h3 className="text-xs font-bold text-[#C85232] mb-1.5 uppercase tracking-wider">Placement Relevance</h3>
            <p className="text-xs text-[#2A2A2A] dark:text-neutral-300 leading-relaxed">
              {project.placementRelevance || "High relevance for Software Development Engineer (SDE) and Full Stack roles."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <h3 className="text-xs font-bold text-[#C85232] mb-1.5 uppercase tracking-wider">Technical Depth & Impact</h3>
            <p className="text-xs text-[#2A2A2A] dark:text-neutral-300 leading-relaxed">
              {project.whyItsUseful || "Demonstrates production-level architecture design, RESTful API practices, clean state management, and reliable database indexing."}
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Development Roadmap Card */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A] mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#C85232]/10 text-[#C85232] flex items-center justify-center font-bold">
            <Compass size={18} />
          </div>
          <div>
            <h2 className="font-bold text-base font-heading text-[#111111] dark:text-white">Development Roadmap</h2>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">Step-by-step execution path for completion</p>
          </div>
        </div>

        <div className="space-y-4">
          {roadmapSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
              <div className="w-7 h-7 rounded-lg bg-[#C85232] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {idx + 1}
              </div>
              <div>
                <p className="text-xs text-[#111111] dark:text-neutral-200 font-medium leading-relaxed">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Enhancements Card */}
      {project.futureEnhancements && (
        <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A] mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Rocket size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base font-heading text-[#111111] dark:text-white">Future Enhancements & Stretch Goals</h2>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">Ideas to make your project stand out during interviews</p>
            </div>
          </div>

          <p className="text-xs text-[#2A2A2A] dark:text-neutral-300 leading-relaxed whitespace-pre-line">
            {project.futureEnhancements}
          </p>
        </div>
      )}

      {/* Bottom Floating Action Bar */}
      <div className="pt-4 flex items-center justify-between border-t border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A]">
        <button
          onClick={() => navigate('/hub/projects')}
          className="text-xs font-bold text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          ← Back to All Projects
        </button>

        <button
          onClick={handleAddToLearningPlan}
          disabled={isSaved || saving}
          className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
            isSaved
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-[#C85232] hover:bg-[#B34528] text-white active:scale-98'
          }`}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isSaved ? (
            <>
              <CheckCircle2 size={16} />
              <span>Saved in Learning Plan</span>
            </>
          ) : (
            <>
              <Bookmark size={16} />
              <span>Add to Learning Plan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
