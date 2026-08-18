import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Loader2,
  Compass,
  Check,
  Zap,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import { analyzeSkillGap, getLatestGapAnalysis } from '../../services/skillService';
import { getAiErrorMessage } from '../../utils/aiErrorUtils';
import CareerHubHeader from '../../components/hub/CareerHubHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function SkillGap() {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [loading, setLoading] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      setFetchingInitial(true);
      const data = await getLatestGapAnalysis();
      if (data) {
        setAnalysis(data);
        if (data.targetRole) setTargetRole(data.targetRole);
      } else {
        // Fallback default trigger
        await handleAnalyze(targetRole);
      }
    } catch (err) {
      console.log("No previous analysis found, running default...");
      await handleAnalyze(targetRole);
    } finally {
      setFetchingInitial(false);
    }
  };

  const handleAnalyze = async (roleToAnalyze) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeSkillGap(roleToAnalyze || targetRole);
      setAnalysis(data);
    } catch (err) {
      console.error("Failed to perform skill gap analysis:", err);
      setError(getAiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const existingStrengths = analysis?.existingStrengths || [
    'Core Java & Object-Oriented Programming',
    'HTML5, CSS3, & Modern JavaScript (ES6+)',
    'Git & GitHub Version Control',
    'Basic RESTful API Design'
  ];

  const missingSkills = analysis?.missingSkills || [
    'System Design & Microservices Architecture',
    'Spring Boot Security & JWT Auth',
    'PostgreSQL & Complex SQL Joins / Indexing',
    'Docker & Container Orchestration'
  ];

  const skillsToImprove = analysis?.skillsToImprove || [
    'Data Structures & Algorithm Optimization',
    'React State Management & Performance',
    'Unit Testing (JUnit 5 & Mockito)'
  ];

  const learningOrder = analysis?.recommendedLearningOrder || [
    'Master Spring Security & Authentication Filters',
    'Practice Database Indexing & Query Tuning in PostgreSQL',
    'Implement Microservices Architecture with Spring Cloud',
    'Study System Design: Caching (Redis) & Load Balancing',
    'Containerize Applications using Docker & Kubernetes'
  ];

  // Calculate readiness score
  const totalSkillsCount = existingStrengths.length + missingSkills.length + skillsToImprove.length;
  const masteredWeight = existingStrengths.length * 1.0;
  const improvingWeight = skillsToImprove.length * 0.5;
  const readinessPercentage = totalSkillsCount > 0 
    ? Math.round(((masteredWeight + improvingWeight) / totalSkillsCount) * 100) 
    : 65;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-body pb-12">
      <CareerHubHeader />

      {/* Hero Banner */}
      <div className="bg-[#EFECE6] dark:bg-[#1E1E1E] border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#C85232]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85232]/10 border border-[#C85232]/25 text-[#C85232] font-semibold text-xs">
              <Target size={14} />
              <span>Competency & Readiness Audit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] dark:text-white">
              AI Skill Gap Analysis
            </h1>
            <p className="text-xs sm:text-sm text-[#5E5B56] dark:text-neutral-300 leading-relaxed">
              Compare your current skill set against company interview requirements to identify critical missing competencies and prioritize your learning sequence.
            </p>
          </div>

          <div className="bg-[#EAE6DF] dark:bg-[#121212] p-4 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] shrink-0 w-full sm:w-auto text-center sm:text-right">
            <div className="text-[11px] text-[#5E5B56] dark:text-neutral-400 font-semibold mb-1">Target Readiness Score</div>
            <div className="text-2xl font-black font-heading text-[#C85232]">{readinessPercentage}%</div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
              {readinessPercentage >= 75 ? '🔥 High Placement Probability' : '📈 Dynamic Improvement Needed'}
            </p>
          </div>
        </div>
      </div>

      {/* Target Role Selector Input */}
      <Card padding="normal" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-[#C85232]" />
              Select Target Career Role
            </h2>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
              Skill gap analysis automatically recalculates based on market expectations for this role.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. SDE-1, Full Stack Developer, Cloud Engineer"
              className="bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3.5 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232] w-full sm:w-64"
            />
            <button
              onClick={() => handleAnalyze(targetRole)}
              disabled={loading}
              className="px-4 py-2 bg-[#C85232] hover:bg-[#B34528] disabled:bg-neutral-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs transition-all active:scale-98"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>Analyze</span>
            </button>
          </div>
        </div>

        {/* Readiness Bar */}
        <div className="pt-2">
          <ProgressBar
            value={readinessPercentage}
            label={`Readiness Match for ${analysis?.targetRole || targetRole}`}
            showValue={true}
            colorClass="bg-[#C85232]"
          />
        </div>
      </Card>

      {(fetchingInitial || loading) && (
        <LoadingState message="Analyzing skill gaps for your target role..." />
      )}

      {!loading && !fetchingInitial && error && (
        <ErrorState message={error} onRetry={() => handleAnalyze(targetRole)} />
      )}

      {!loading && !fetchingInitial && !error && !analysis && (
        <EmptyState
          title="No Skill Gap Analysis Found"
          description="Analyze your target role to discover missing skills and recommended learning path."
          actionLabel="Run Skill Analysis"
          onAction={() => handleAnalyze(targetRole)}
        />
      )}

      {!loading && !fetchingInitial && !error && analysis && (
        <>
          {/* Main Comparison Grid: Current (✓) vs. Missing Skills (❌) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing Strengths (✓ Covered) */}
        <Card padding="normal" className="space-y-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={16} />
              </div>
              <h3 className="font-bold text-sm font-heading text-[#111111] dark:text-white">
                Acquired Strengths (✓)
              </h3>
            </div>
            <Badge variant="success" size="sm">
              {existingStrengths.length} Mastered
            </Badge>
          </div>

          <div className="space-y-2.5">
            {existingStrengths.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    {skill}
                  </p>
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                    Verified in baseline assessment & profile
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Missing Skills (❌ Critical Gap) */}
        <Card padding="normal" className="space-y-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <XCircle size={16} />
              </div>
              <h3 className="font-bold text-sm font-heading text-[#111111] dark:text-white">
                Missing Skills (Missing)
              </h3>
            </div>
            <Badge variant="danger" size="sm">
              {missingSkills.length} Action Needed
            </Badge>
          </div>

          <div className="space-y-2.5">
            {missingSkills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40"
              >
                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  <XCircle size={12} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-rose-950 dark:text-rose-200">
                    {skill}
                  </p>
                  <p className="text-[10px] text-rose-700/80 dark:text-rose-400 mt-0.5">
                    High demand requirement for target role interviews
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Skills to Improve (⚡ Growth Focus) */}
      <Card padding="normal" className="space-y-4 border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Zap size={16} />
            </div>
            <h3 className="font-bold text-sm font-heading text-[#111111] dark:text-white">
              Skills to Refine & Improve
            </h3>
          </div>
          <Badge variant="warning" size="sm">
            {skillsToImprove.length} Moderate Proficiency
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {skillsToImprove.map((skill, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40"
            >
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <TrendingUp size={14} />
                <span className="text-[10px] font-extrabold uppercase">Refinement</span>
              </div>
              <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                {skill}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommended Learning Sequence */}
      <Card padding="normal" className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C85232]/10 text-[#C85232] flex items-center justify-center font-bold">
              <Compass size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm font-heading text-[#111111] dark:text-white">
                Recommended Priority Learning Sequence
              </h3>
              <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">
                Optimized path to eliminate gaps with maximum efficiency
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/hub/roadmap')}
            className="px-3.5 py-1.5 bg-[#C85232] text-white font-bold text-xs rounded-xl hover:bg-[#B34528] flex items-center gap-1.5 shadow-xs transition-all"
          >
            <span>View Full Interactive Roadmap</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {learningOrder.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#C85232] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {idx + 1}
              </div>
              <p className="text-xs font-semibold text-[#111111] dark:text-neutral-200">
                {step}
              </p>
            </div>
          ))}
        </div>
      </Card>
        </>
      )}
    </div>
  );
}
