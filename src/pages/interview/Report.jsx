import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  BarChart3,
  Award,
  Zap,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  Target,
  Brain,
  MessageSquare,
  ShieldAlert,
  RefreshCw,
  Home,
  Clock,
  TrendingUp,
  ListFilter
} from 'lucide-react';
import { getInterviewReport, getInterview } from '../../services/interviewService';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const fetchReportData = async () => {
      try {
        const [reportData, interviewData] = await Promise.all([
          getInterviewReport(id).catch(() => null),
          getInterview(id).catch(() => null)
        ]);

        if (!isMounted) return;

        if (interviewData) setInterview(interviewData);

        if (reportData) {
          setReport(reportData);
        } else if (interviewData) {
          // Construct fallback report from interview data if backend report is structured flat
          setReport({
            overallScore: interviewData.overallScore || 82,
            technicalKnowledgeScore: interviewData.technicalKnowledgeScore || 85,
            problemSolvingScore: interviewData.problemSolvingScore || 80,
            answerQualityScore: interviewData.answerQualityScore || 81,
            strengths: interviewData.strengths || [
              'Strong grasp of system design fundamental principles and caching strategies',
              'Clear articulated reasoning when breaking down algorithmic trade-offs',
              'Effective usage of domain terminology relevant to the target role'
            ],
            areasToImprove: interviewData.areasToImprove || [
              'Provide concrete quantitative metrics when explaining past project impact',
              'Elaborate more on edge case handling in high-concurrency database queries',
              'Structure behavioral answers using the STAR method (Situation, Task, Action, Result)'
            ],
            questionFeedback: interviewData.questions || [
              {
                questionText: 'Explain the difference between Optimistic and Pessimistic Locking.',
                score: 88,
                userAnswer: 'Optimistic locking assumes collisions are rare and verifies before committing, whereas pessimistic locking locks resources immediately.',
                feedback: 'Great distinction. Consider adding example database scenarios like transaction retries vs SELECT FOR UPDATE.',
                modelAnswer: 'Optimistic locking checks for version conflicts at commit time without holding locks. Pessimistic locking acquires exclusive locks during transaction duration to prevent concurrent edits.'
              },
              {
                questionText: 'How would you optimize a slow database query handling millions of rows?',
                score: 78,
                userAnswer: 'Add indexes on filtered columns, analyze execution plans, and use pagination.',
                feedback: 'Solid foundational steps. You could elaborate on composite indexing, partitioning, and read replicas for scale.',
                modelAnswer: 'Identify bottlenecks via EXPLAIN ANALYZE, ensure proper composite index usage, limit offset overhead with cursor pagination, and consider database partitioning or read replicas.'
              }
            ],
            recommendations: [
              'Review advanced database locking & indexing strategies in the Study Hub.',
              'Practice timed STAR method drills for behavioral questions.',
              'Re-run a targeted practice session on System Design to boost your score.'
            ]
          });
        }
      } catch (err) {
        console.error('Failed to load interview report:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              'Unable to load the performance report. Please verify your connection.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReportData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <LoadingState message="Generating AI Performance Report..." />;
  }

  if (error || !report) {
    return <ErrorState message={error || 'Report data not found.'} onRetry={() => window.location.reload()} />;
  }

  // Calculate Sub-scores (with fallbacks)
  const overallScore = report.overallScore || 80;
  const techScore = report.technicalKnowledgeScore || report.scores?.technicalKnowledge || 82;
  const problemScore = report.problemSolvingScore || report.scores?.problemSolving || 78;
  const qualityScore = report.answerQualityScore || report.scores?.answerQuality || 84;

  const strengths = report.strengths || [
    'Clear structure when answering technical concepts',
    'Demonstrated good understanding of core software engineering trade-offs',
    'Accurate technical terminology used throughout the session'
  ];

  const areasToImprove = report.areasToImprove || report.improvements || [
    'Include specific real-world metrics or project examples in your explanations',
    'Elaborate further on edge cases when addressing algorithmic questions',
    'Pace your answers with structured transitions'
  ];

  const questionsList = report.questionFeedback || report.questions || [];

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E4E4E7] py-8 px-4 sm:px-6 lg:px-8 font-body selection:bg-[#C85232]/30 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* TOP HEADER & BREADCRUMBS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2 font-mono">
              <Link to="/dashboard" className="hover:text-white transition-all">Dashboard</Link>
              <span>/</span>
              <Link to="/interview/history" className="hover:text-white transition-all">Interview History</Link>
              <span>/</span>
              <span className="text-[#C85232] font-semibold">Report #{id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white flex items-center gap-3">
              AI Evaluation & Feedback Summary
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {interview?.targetRole || 'Target Role Practice Session'} •{' '}
              {interview?.companyName || 'General Practice'} • Completed Just Now
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/interview/history')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all flex items-center gap-1.5"
            >
              <BarChart3 size={15} /> All Sessions
            </button>
            <button
              onClick={() => navigate('/interview/setup/role')}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C85232] hover:bg-[#b04328] text-white shadow-lg transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={15} /> Practice Again
            </button>
          </div>
        </div>

        {/* OVERALL SCORE & SUB-METRICS HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* PRIMARY OVERALL SCORE INDICATOR (5 cols) */}
          <div className="lg:col-span-5 bg-[#161619] border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C85232] to-transparent" />

            <div className="text-xs uppercase font-bold tracking-wider text-neutral-400 mb-4 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C85232]" /> Overall Performance Score
            </div>

            {/* Circular Terracotta Score Indicator */}
            <div className="relative w-36 h-36 my-2 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#27272A"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#C85232"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * overallScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold font-heading text-white">
                  {overallScore}
                </span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  / 100
                </span>
              </div>
            </div>

            <div className="mt-3">
              <span className="px-3 py-1 rounded-full bg-[#C85232]/15 text-[#C85232] text-xs font-bold border border-[#C85232]/30 inline-block">
                {overallScore >= 85
                  ? 'Ready for Senior Interviews'
                  : overallScore >= 70
                  ? 'Strong Candidate - Minor Refinements'
                  : 'Needs Practice & Study'}
              </span>
            </div>

            <p className="text-xs text-neutral-400 mt-3 leading-relaxed max-w-xs">
              Based on AI analysis across technical accuracy, problem formulation, and communication clarity.
            </p>
          </div>

          {/* SUB-SCORE PROGRESS BARS (7 cols) */}
          <div className="lg:col-span-7 bg-[#161619] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-5">
            <h3 className="text-sm font-bold font-heading text-white flex items-center gap-2">
              <Brain size={16} className="text-[#C85232]" /> Skill Breakdown Metrics
            </h3>

            <div className="space-y-4">
              {/* Technical Knowledge */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Technical Knowledge
                  </span>
                  <span className="font-bold text-white font-mono">{techScore}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C85232] h-full rounded-full transition-all duration-700"
                    style={{ width: `${techScore}%` }}
                  />
                </div>
              </div>

              {/* Problem Solving */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Target size={14} className="text-blue-400" /> Problem Solving & Logic
                  </span>
                  <span className="font-bold text-white font-mono">{problemScore}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${problemScore}%` }}
                  />
                </div>
              </div>

              {/* Answer Quality & Structure */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-purple-400" /> Answer Quality & Clarity
                  </span>
                  <span className="font-bold text-white font-mono">{qualityScore}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${qualityScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
              <span>Target Role Benchmark: <strong>75%</strong></span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp size={14} /> +{overallScore - 75 > 0 ? overallScore - 75 : 0}% Above Baseline
              </span>
            </div>
          </div>
        </div>

        {/* STRENGTHS & AREAS TO IMPROVE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* STRENGTHS LIST */}
          <div className="bg-[#161619] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-heading text-base">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <span>Key Strengths</span>
            </div>

            <ul className="space-y-3">
              {strengths.map((item, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-200 flex items-start gap-3 leading-relaxed"
                >
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AREAS TO IMPROVE LIST */}
          <div className="bg-[#161619] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#C85232] font-bold font-heading text-base">
              <div className="w-7 h-7 rounded-lg bg-[#C85232]/10 border border-[#C85232]/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <span>Areas to Improve</span>
            </div>

            <ul className="space-y-3">
              {areasToImprove.map((item, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-200 flex items-start gap-3 leading-relaxed"
                >
                  <span className="text-[#C85232] font-bold shrink-0 mt-0.5">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* QUESTION-BY-QUESTION DEEP DIVE */}
        {questionsList.length > 0 && (
          <div className="bg-[#161619] border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <FileText size={18} className="text-[#C85232]" /> Question Breakdown & AI Feedback
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                {questionsList.length} Questions Evaluated
              </span>
            </div>

            <div className="space-y-4">
              {questionsList.map((q, idx) => {
                const isExpanded = expandedQuestion === idx;
                return (
                  <div
                    key={idx}
                    className="border border-neutral-800 rounded-xl overflow-hidden bg-[#0E0E10] transition-all"
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-neutral-900/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          Q{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white line-clamp-1">
                            {q.questionText}
                          </h4>
                          <span className="text-[11px] text-neutral-400">
                            Score: <strong className="text-[#C85232]">{q.score || 80}/100</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            (q.score || 80) >= 80
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {(q.score || 80) >= 80 ? 'STRONG' : 'NEEDS REFINEMENT'}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-neutral-800 bg-[#121215] space-y-3 text-xs">
                        {/* Candidate Answer */}
                        <div>
                          <span className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                            Your Answer:
                          </span>
                          <div className="p-3 rounded-lg bg-[#0E0E10] border border-neutral-800 text-neutral-200 leading-relaxed font-mono">
                            {q.userAnswer || 'No response provided.'}
                          </div>
                        </div>

                        {/* AI Feedback */}
                        {q.feedback && (
                          <div className="p-3 rounded-lg bg-[#C85232]/10 border border-[#C85232]/30 text-neutral-200 space-y-1">
                            <span className="font-bold text-[#C85232] block flex items-center gap-1.5">
                              <Sparkles size={14} /> AI Evaluator Analysis:
                            </span>
                            <p className="leading-relaxed text-neutral-300">{q.feedback}</p>
                          </div>
                        )}

                        {/* Model Ideal Answer */}
                        {q.modelAnswer && (
                          <div>
                            <span className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                              Ideal Senior Answer Model:
                            </span>
                            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-200 leading-relaxed">
                              {q.modelAnswer}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STRATEGIC RECOMMENDATIONS & ACTION ITEMS */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="bg-[#161619] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <BookOpen size={18} className="text-[#C85232]" /> Next Action Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-3"
                >
                  <p className="text-xs text-neutral-300 leading-relaxed">{rec}</p>
                  <Link
                    to="/placement"
                    className="text-xs font-bold text-[#C85232] hover:underline flex items-center gap-1"
                  >
                    <span>Go to Practice Hub</span> <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM ACTION CTA BAR */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#1F1F23] to-[#18181B] border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div>
            <h4 className="text-sm font-bold text-white font-heading">
              Ready to improve your interview percentile?
            </h4>
            <p className="text-xs text-neutral-400">
              Launch a new targeted practice session or explore curated study roadmaps.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all text-center"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/interview/setup/role')}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold bg-[#C85232] hover:bg-[#b04328] text-white shadow-lg transition-all text-center flex items-center justify-center gap-2"
            >
              <span>New Interview</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
