import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ArrowLeft,
  Sparkles,
  Download,
  Upload,
  BarChart3,
  Loader2,
  Check,
  RefreshCw
} from 'lucide-react';
import { getResumeAnalysis, getResumeById } from '../../services/resumeService';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export default function ResumeResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResumeAndAnalysis();
  }, [id]);

  const fetchResumeAndAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch resume metadata
      const resumeData = await getResumeById(id);
      setResume(resumeData);

      // Fetch or extract analysis
      if (resumeData && resumeData.analysis) {
        setAnalysis(resumeData.analysis);
      } else {
        const analysisData = await getResumeAnalysis(id);
        setAnalysis(analysisData);
      }
    } catch (err) {
      console.error("Failed to load resume analysis result:", err);
      setError("Unable to load resume evaluation result. Please ensure the analysis has completed.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse strings/JSON arrays into structured string lists
  const parseItems = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;

    let str = String(input).trim();
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Fallback to text parsing
      }
    }

    // Split by newlines, bullets, or semicolons
    const lines = str
      .split(/\n|•|\*|;/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && !item.startsWith('Why It'));

    return lines.length > 0 ? lines : [str];
  };

  if (loading) {
    return <LoadingState message="Retrieving AI Resume Report..." />;
  }

  if (error || !analysis) {
    return <ErrorState message={error || "Could not find evaluation details for this resume."} onRetry={fetchResumeAndAnalysis} />;
  }

  const overallScore = analysis.overallScore || 0;
  const strengthsList = parseItems(analysis.strengths);
  const weaknessesList = parseItems(analysis.weaknesses);
  const missingSkillsList = parseItems(analysis.missingSkills);
  const suggestionsList = parseItems(analysis.suggestions);

  // Score Status Badge & Message
  let scoreColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  let scoreBadgeText = 'Strong Match';
  let scoreDescription = 'Your resume aligns well with software industry standard expectations!';

  if (overallScore < 60) {
    scoreColor = 'text-rose-500 border-rose-500/30 bg-rose-500/10';
    scoreBadgeText = 'Needs Improvement';
    scoreDescription = 'Your resume has critical skill gaps or formatting issues that may reduce ATS visibility.';
  } else if (overallScore < 80) {
    scoreColor = 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    scoreBadgeText = 'Moderate Match';
    scoreDescription = 'Good foundation, but adding missing key tech stack skills will boost callback rates.';
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-body pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/hub/resume')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Resume Hub
        </button>

        <div className="flex items-center gap-3">
          <Link
            to="/hub/resume"
            className="px-4 py-2 bg-white dark:bg-[#222222] border border-[rgba(0,0,0,0.08)] dark:border-[#333333] text-[#111111] dark:text-white rounded-xl text-xs font-bold hover:bg-[#FAF8F5] dark:hover:bg-[#2A2A2A] flex items-center gap-1.5 transition-colors"
          >
            <Upload size={14} /> Upload New Version
          </Link>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#C85232]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* File & Details */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85232]/20 border border-[#C85232]/30 text-[#C85232] font-semibold text-xs">
              <Sparkles size={14} />
              <span>AI Evaluation Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              {resume?.originalFilename || 'Resume Analysis Result'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Evaluated on {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : 'Today'}
            </p>
          </div>

          {/* Radial Score Gauge */}
          <div className="flex flex-col items-center shrink-0 bg-[#121212] border border-[#2E2E2E] p-6 rounded-2xl w-full md:w-56 text-center shadow-inner">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Overall Resume Score
            </div>

            <div className="relative my-2 flex items-center justify-center">
              <span className="text-4xl font-extrabold font-heading text-white">
                {overallScore}
              </span>
              <span className="text-xs text-neutral-500 ml-1 font-bold">/100</span>
            </div>

            <div className={`mt-1 px-3 py-1 rounded-full text-[11px] font-bold border ${scoreColor}`}>
              {scoreBadgeText}
            </div>

            <p className="text-[10px] text-neutral-400 mt-2 leading-tight">
              {scoreDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Structured Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm font-heading text-[#111111] dark:text-white">Key Strengths</h2>
              <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">Elements that positively stood out</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {strengthsList.length === 0 ? (
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">No specific strengths highlighted.</p>
            ) : (
              strengthsList.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2A2A2A] dark:text-neutral-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weaknesses Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 font-bold">
              <XCircle size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm font-heading text-[#111111] dark:text-white">Areas to Fix</h2>
              <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">Weaknesses that reduce ATS ranking</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {weaknessesList.length === 0 ? (
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">No major weaknesses detected!</p>
            ) : (
              weaknessesList.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2A2A2A] dark:text-neutral-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missing Skills Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm font-heading text-[#111111] dark:text-white">Missing Keywords & Skills</h2>
              <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">Crucial terms recruiters look for</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {missingSkillsList.length === 0 ? (
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">No missing skills identified.</p>
            ) : (
              missingSkillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Suggestions Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-lg bg-[#C85232]/10 text-[#C85232] flex items-center justify-center shrink-0 font-bold">
              <Lightbulb size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm font-heading text-[#111111] dark:text-white">Actionable Suggestions</h2>
              <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">Step-by-step impact enhancements</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {suggestionsList.length === 0 ? (
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">Your resume looks great! Keep it updated.</p>
            ) : (
              suggestionsList.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2A2A2A] dark:text-neutral-200">
                  <div className="w-5 h-5 rounded-full bg-[#C85232]/10 text-[#C85232] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
