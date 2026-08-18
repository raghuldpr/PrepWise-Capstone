import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Loader2,
  Code2,
  BookOpen,
  ArrowRight,
  Play,
  Check,
  Zap,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { generateRoadmap, getUserRoadmaps } from '../../services/roadmapService';
import { getAiErrorMessage } from '../../utils/aiErrorUtils';
import CareerHubHeader from '../../components/hub/CareerHubHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function Roadmap() {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [targetTechnology, setTargetTechnology] = useState('Java Spring Boot + React');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    loadUserRoadmaps();
  }, []);

  const loadUserRoadmaps = async () => {
    try {
      const roadmaps = await getUserRoadmaps();
      if (roadmaps && roadmaps.length > 0) {
        setCurrentRoadmap(roadmaps[0]);
      } else {
        await handleGenerate();
      }
    } catch (err) {
      console.log("No existing roadmap, auto-generating...");
      await handleGenerate();
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await generateRoadmap(targetRole, targetTechnology);
      setCurrentRoadmap(data);
      setCompletedSteps({});
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
      setError(getAiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepIdx) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepIdx]: !prev[stepIdx]
    }));
  };

  // Helper to parse roadmap data string into steps
  const getParsedSteps = () => {
    if (!currentRoadmap || !currentRoadmap.roadmapData) {
      return defaultSteps;
    }

    try {
      if (currentRoadmap.roadmapData.startsWith('[')) {
        return JSON.parse(currentRoadmap.roadmapData);
      }
    } catch (e) {
      // Fallback text parsing
    }

    // Default fallback steps matching real interview syllabus
    return defaultSteps;
  };

  const defaultSteps = [
    {
      title: 'Phase 1: Core Fundamentals & Data Structures',
      duration: 'Weeks 1 - 2',
      status: 'FOUNDATION',
      topics: ['Arrays, HashMaps, Two Pointers', 'Binary Search & Trees', 'Time & Space Complexity Analysis'],
      description: 'Master core algorithmic thinking and data structure optimization required for technical screening rounds.'
    },
    {
      title: 'Phase 2: Backend Architecture & REST APIs',
      duration: 'Weeks 3 - 4',
      status: 'BACKEND',
      topics: ['Spring Boot / Express REST Controllers', 'Dependency Injection & Middleware', 'Database ORM (JPA / Hibernate / Drizzle)'],
      description: 'Build production-ready RESTful APIs with clean layered architecture, validation, and exception handling.'
    },
    {
      title: 'Phase 3: Relational Databases & System Design',
      duration: 'Weeks 5 - 6',
      status: 'SYSTEM DESIGN',
      topics: ['PostgreSQL Schema Design & Indexing', 'ACID Transactions & Joins', 'Caching with Redis & Message Queues'],
      description: 'Design scalable database schemas, optimize slow queries, and understand distributed system caching strategies.'
    },
    {
      title: 'Phase 4: Full Stack Integration & Portfolio Project',
      duration: 'Weeks 7 - 8',
      status: 'CAPSTONE',
      topics: ['React / Next.js State & Auth Integration', 'Docker Containerization', 'CI/CD Pipeline & Cloud Deployment'],
      description: 'Combine frontend and backend into an industry-grade portfolio app deployed on cloud infrastructure.'
    }
  ];

  const parsedSteps = getParsedSteps();
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = parsedSteps.length > 0 ? Math.round((completedCount / parsedSteps.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-body pb-12">
      <CareerHubHeader />

      {/* Hero Banner */}
      <div className="bg-[#EFECE6] dark:bg-[#1E1E1E] border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#C85232]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85232]/10 border border-[#C85232]/25 text-[#C85232] font-semibold text-xs">
              <Compass size={14} />
              <span>Step-by-Step Milestones</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] dark:text-white">
              AI Industry Learning Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-[#5E5B56] dark:text-neutral-300 leading-relaxed">
              Vertical chronological milestone map customized for your target technology stack and placement deadline.
            </p>
          </div>

          <div className="bg-[#EAE6DF] dark:bg-[#121212] p-4 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] shrink-0 w-full sm:w-auto text-center sm:text-right">
            <div className="text-[11px] text-[#5E5B56] dark:text-neutral-400 font-semibold mb-1">Roadmap Completion</div>
            <div className="text-2xl font-black font-heading text-[#C85232]">{progressPercent}%</div>
            <p className="text-[10px] text-[#5E5B56] dark:text-neutral-400 mt-0.5">
              {completedCount} of {parsedSteps.length} Steps Finished
            </p>
          </div>
        </div>
      </div>

      {/* Generator Form Card */}
      <Card padding="normal" className="space-y-4">
        <h2 className="text-sm font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
          <Sparkles size={16} className="text-[#C85232]" />
          Configure Target Scope & Technology Stack
        </h2>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#111111] dark:text-neutral-300 mb-1.5">
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. SDE-1, Full Stack Developer"
              className="w-full bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3.5 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#111111] dark:text-neutral-300 mb-1.5">
              Technology Stack
            </label>
            <input
              type="text"
              value={targetTechnology}
              onChange={(e) => setTargetTechnology(e.target.value)}
              placeholder="e.g. Java Spring Boot + React"
              className="w-full bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3.5 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#C85232] hover:bg-[#B34528] disabled:bg-neutral-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generating Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Generate Roadmap</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-2">
          <ProgressBar
            value={progressPercent}
            label={`Roadmap Progress (${currentRoadmap?.targetRole || targetRole})`}
            showValue={true}
            colorClass="bg-[#C85232]"
          />
        </div>
      </Card>

      {loading && (
        <LoadingState message="Generating personalized learning roadmap..." />
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={handleGenerate} />
      )}

      {!loading && !error && !currentRoadmap && (
        <EmptyState
          title="No Learning Roadmap Found"
          description="Generate a step-by-step career roadmap tailored to your target role and technology stack."
          actionLabel="Generate Roadmap"
          onAction={handleGenerate}
        />
      )}

      {!loading && !error && currentRoadmap && (
        <>
          {/* Vertical Step Timeline Component */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
          <div>
            <h2 className="text-base font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
              <Compass size={18} className="text-[#C85232]" />
              Roadmap Timeline Sequence
            </h2>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
              Click on any step card to mark it as completed as you progress
            </p>
          </div>
          <Badge variant="primary">
            {parsedSteps.length} Milestones
          </Badge>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l-2 border-[#C85232]/30 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
          {parsedSteps.map((step, idx) => {
            const isDone = !!completedSteps[idx];

            return (
              <div key={idx} className="relative group">
                {/* Timeline Step Dot */}
                <button
                  onClick={() => toggleStep(idx)}
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all shadow-md cursor-pointer ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-400 text-white scale-110'
                      : 'bg-[#1E1E1E] border-[#C85232] text-[#C85232] hover:bg-[#C85232] hover:text-white'
                  }`}
                  title={isDone ? "Mark as Incomplete" : "Mark as Completed"}
                >
                  {isDone ? <Check size={16} strokeWidth={3} /> : idx + 1}
                </button>

                {/* Timeline Card */}
                <div
                  onClick={() => toggleStep(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 opacity-90'
                      : 'bg-[#FAF8F5] dark:bg-[#121212] border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] hover:border-[#C85232]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-[#C85232]/10 text-[#C85232] border border-[#C85232]/20'
                      }`}>
                        {step.status || `PHASE ${idx + 1}`}
                      </span>

                      <span className="text-xs font-semibold text-[#5E5B56] dark:text-neutral-400 flex items-center gap-1">
                        <Clock size={13} />
                        {step.duration || `Week ${idx * 2 + 1} - ${idx * 2 + 2}`}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#C85232]">
                      {isDone ? '✓ Completed' : 'Click to toggle status'}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold font-heading mb-2 ${
                    isDone ? 'line-through text-neutral-500 dark:text-neutral-400' : 'text-[#111111] dark:text-white'
                  }`}>
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed mb-4">
                    {step.description || 'Focus on fundamental patterns and practical application.'}
                  </p>

                  {/* Topics covered */}
                  {step.topics && step.topics.length > 0 && (
                    <div className="pt-3 border-t border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
                      <span className="text-[11px] font-bold text-[#111111] dark:text-neutral-300 block mb-2">
                        Key Deliverables & Action Items:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {step.topics.map((topic, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E1E1E] border border-[rgba(0,0,0,0.08)] dark:border-[#333333] text-[11px] font-medium text-[#222222] dark:text-neutral-200"
                          >
                            • {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation CTA */}
        <div className="pt-6 border-t border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A] flex items-center justify-between">
          <button
            onClick={() => navigate('/hub/skill-gap')}
            className="text-xs font-bold text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            ← Back to Skill Gap Analysis
          </button>

          <button
            onClick={() => navigate('/hub/study-plan')}
            className="px-5 py-2.5 bg-[#C85232] text-white font-bold text-xs rounded-xl hover:bg-[#B34528] flex items-center gap-1.5 shadow-md transition-all active:scale-98"
          >
            <span>Convert to Daily Study Plan</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
