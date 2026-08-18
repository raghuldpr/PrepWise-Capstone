import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  BarChart2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Search,
  Filter,
  CheckCircle2,
  Play,
  RotateCcw,
  FileCode,
  ShieldAlert,
  RefreshCw,
  Plus
} from 'lucide-react';
import { getUserInterviewHistory } from '../../services/interviewService';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const fetchHistory = async () => {
      try {
        const data = await getUserInterviewHistory();
        if (!isMounted) return;

        if (Array.isArray(data)) {
          setHistory(data);
        } else if (data && Array.isArray(data.content)) {
          setHistory(data.content);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Failed to load interview history:', err);
        if (isMounted) {
          setError('Failed to retrieve past interview sessions. Please check your connection.');
          setHistory([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter history based on search & filter type
  const filteredHistory = history.filter((session) => {
    const matchesSearch =
      (session.targetRole || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === 'ALL' ||
      (session.interviewType || session.type || '').toUpperCase() === filterType;

    return matchesSearch && matchesType;
  });

  // Calculate high-level stats
  const completedSessions = history.filter((s) => s.status === 'COMPLETED');
  const averageScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
            completedSessions.length
        )
      : 0;

  if (loading) {
    return <LoadingState message="Loading interview history & performance trend..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchHistory} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 px-2 sm:px-4 font-body text-[#E4E4E7]">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1 font-mono">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <span>/</span>
            <span className="text-[#C85232]">Interview History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white flex items-center gap-3">
            <BarChart2 size={28} className="text-[#C85232]" /> Past Interview Sessions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track your AI mock interview performance scores, view detailed reports, and evaluate career readiness over time.
          </p>
        </div>

        <button
          onClick={() => navigate('/interview/setup/role')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C85232] hover:bg-[#b04328] text-white shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus size={16} />
          <span>New Practice Session</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#161619] border border-neutral-800 rounded-2xl p-5 space-y-2 shadow-lg">
            <div className="text-xs text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-between">
              <span>Total Sessions</span>
              <BarChart2 size={16} className="text-neutral-500" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-white font-mono">
              {history.length}
            </div>
            <p className="text-[11px] text-neutral-400">
              {completedSessions.length} completed, {history.length - completedSessions.length} in progress
            </p>
          </div>

          <div className="bg-[#161619] border border-neutral-800 rounded-2xl p-5 space-y-2 shadow-lg">
            <div className="text-xs text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-between">
              <span>Average Score</span>
              <Award size={16} className="text-[#C85232]" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-white font-mono flex items-center gap-2">
              <span className="text-[#C85232]">{averageScore > 0 ? averageScore : 'N/A'}</span>
              {averageScore > 0 && <span className="text-xs text-neutral-400 font-sans font-normal">/ 100</span>}
            </div>
            <p className="text-[11px] text-neutral-400">Across completed technical sessions</p>
          </div>

          <div className="bg-[#161619] border border-neutral-800 rounded-2xl p-5 space-y-2 shadow-lg">
            <div className="text-xs text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-between">
              <span>Score Trend</span>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-heading text-emerald-400 font-mono">
              +12%
            </div>
            <p className="text-[11px] text-neutral-400">Improvement over last 5 sessions</p>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-[#161619] border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E0E10] text-xs text-white pl-10 pr-4 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-[#C85232] transition-all"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#0E0E10] p-1 rounded-xl border border-neutral-800 w-full sm:w-auto">
          {['ALL', 'TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'CODING'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                filterType === type
                  ? 'bg-[#C85232] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {type === 'ALL'
                ? 'All Types'
                : type === 'SYSTEM_DESIGN'
                ? 'System Design'
                : type}
            </button>
          ))}
        </div>
      </div>

      {/* EMPTY STATE: NO INTERVIEW HISTORY */}
      {filteredHistory.length === 0 && (
        <EmptyState
          title="No Interview History Found"
          description={
            searchQuery || filterType !== 'ALL'
              ? 'No past interviews match your selected search filters.'
              : 'You have not completed any mock interview sessions yet. Launch your first practice interview now to receive detailed AI feedback.'
          }
          actionLabel={searchQuery || filterType !== 'ALL' ? "Clear Filters" : "Start Practice Session"}
          onAction={() => {
            if (searchQuery || filterType !== 'ALL') {
              setSearchQuery('');
              setFilterType('ALL');
            } else {
              navigate('/interview/setup/role');
            }
          }}
        />
      )}

      {/* SESSIONS LIST */}
      {filteredHistory.length > 0 && (
        <div className="space-y-4">
          {filteredHistory.map((session) => {
            const isCompleted = session.status === 'COMPLETED';
            const score = session.overallScore || session.score;

            return (
              <div
                key={session.id}
                className="bg-[#161619] border border-neutral-800/90 hover:border-neutral-700 rounded-2xl p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Role Info & Badge */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C85232]/15 border border-[#C85232]/30 flex items-center justify-center text-[#C85232] shrink-0 font-bold">
                    <Sparkles size={22} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold font-heading text-white">
                        {session.targetRole || 'Software Engineering Role'}
                      </h3>
                      {session.companyName && (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 font-semibold border border-neutral-700">
                          {session.companyName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar size={12} className="text-neutral-500" />
                        {session.createdAt
                          ? new Date(session.createdAt).toLocaleDateString()
                          : 'Recent Session'}
                      </span>
                      <span>•</span>
                      <span className="text-[#C85232] font-semibold uppercase text-[10px]">
                        {session.interviewType || 'TECHNICAL'}
                      </span>
                      <span>•</span>
                      <span>{session.questionCount || 5} Questions</span>
                    </div>
                  </div>
                </div>

                {/* Score & Action Button */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
                  {/* Score Tag */}
                  {isCompleted ? (
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Score
                      </div>
                      <div className="text-xl font-extrabold font-mono text-[#C85232]">
                        {score !== undefined ? `${score}/100` : 'Evaluated'}
                      </div>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                      In Progress
                    </span>
                  )}

                  {/* CTA Action */}
                  {isCompleted ? (
                    <button
                      onClick={() => navigate(`/interview/report/${session.id}`)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-[#C85232] transition-all flex items-center gap-1.5"
                    >
                      <span>View Report</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        navigate(
                          session.interviewType === 'CODING'
                            ? `/interview/session/${session.id}/coding`
                            : `/interview/session/${session.id}`
                        )
                      }
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#C85232] hover:bg-[#b04328] transition-all flex items-center gap-1.5"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Resume Session</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
