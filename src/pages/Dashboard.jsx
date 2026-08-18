import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import {
  Sparkles,
  Code2,
  FileText,
  Video,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Target,
  Briefcase,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [interviewsData, setInterviewsData] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [progressRes, interviewsRes, attemptsRes] = await Promise.allSettled([
        api.get('/progress'),
        api.get('/interviews/history'),
        api.get('/attempts/recent'),
      ]);

      let progList = [];
      if (progressRes.status === 'fulfilled' && Array.isArray(progressRes.value.data)) {
        progList = progressRes.value.data;
      }

      let intList = [];
      if (interviewsRes.status === 'fulfilled' && Array.isArray(interviewsRes.value.data)) {
        intList = interviewsRes.value.data;
      } else if (interviewsRes.status === 'fulfilled' && interviewsRes.value.data?.content) {
        intList = interviewsRes.value.data.content;
      }

      let attList = [];
      if (attemptsRes.status === 'fulfilled' && Array.isArray(attemptsRes.value.data)) {
        attList = attemptsRes.value.data;
      } else if (attemptsRes.status === 'fulfilled' && attemptsRes.value.data?.content) {
        attList = attemptsRes.value.data.content;
      }

      setProgressData(progList);
      setInterviewsData(intList);
      setRecentAttempts(attList);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to fetch your latest placement progress. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate scores
  const calculatePrepScore = () => {
    if (!progressData || progressData.length === 0) return 0;
    const totalAccuracy = progressData.reduce(
      (acc, curr) => acc + (Number(curr.accuracy) || Number(curr.averageScore) || 0),
      0
    );
    return Math.round(totalAccuracy / progressData.length);
  };

  const calculateInterviewScore = () => {
    if (!interviewsData || interviewsData.length === 0) return 0;
    const completed = interviewsData.filter(
      (i) => i.status === 'COMPLETED' && (i.overallScore !== undefined || i.score !== undefined)
    );
    if (completed.length === 0) return 0;
    const sum = completed.reduce((acc, curr) => acc + (Number(curr.overallScore || curr.score) || 0), 0);
    return Math.round(sum / completed.length);
  };

  const prepScore = calculatePrepScore();
  const interviewScore = calculateInterviewScore();

  const hasActivity =
    recentAttempts.length > 0 || interviewsData.length > 0 || progressData.length > 0;

  if (loading) {
    return <LoadingState message="Loading your placement dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232] border border-[rgba(200,82,50,0.2)] mb-2">
            <Sparkles size={13} /> Campus Placement Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-[#111111] dark:text-white tracking-tight">
            {getTimeGreeting()}, {user?.name || 'Student'}
          </h1>
          <p className="text-base text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
            Continue your placement preparation and track your readiness.
          </p>
        </div>

        <button
          onClick={() => navigate('/placement')}
          className="btn-terracotta self-start md:self-auto"
        >
          <BookOpen size={18} /> Explore Practice Modules
        </button>
      </div>

      {/* Two Score Cards & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Preparation Score Card */}
        <div className="card-warm dark:bg-[#1E1E1E] relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
                Preparation Readiness
              </span>
              <h3 className="text-2xl font-bold font-heading text-[#111111] dark:text-white mt-1">
                {prepScore}%
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232]">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="w-full bg-[#EAE6DF] dark:bg-[#242424] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#C85232] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, prepScore))}%` }}
            />
          </div>
          <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-3">
            Based on completed practice attempts and accuracy across modules.
          </p>
        </div>

        {/* Interview Score Card */}
        <div className="card-warm dark:bg-[#1E1E1E] relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
                Mock Interview Performance
              </span>
              <h3 className="text-2xl font-bold font-heading text-[#111111] dark:text-white mt-1">
                {interviewScore}%
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232]">
              <Award size={22} />
            </div>
          </div>
          <div className="w-full bg-[#EAE6DF] dark:bg-[#242424] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#C85232] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, interviewScore))}%` }}
            />
          </div>
          <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-3">
            Average evaluation score from completed AI mock interviews.
          </p>
        </div>

        {/* Completed Practice Sessions */}
        <div className="card-warm dark:bg-[#1E1E1E] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
              Total Practice Sessions
            </span>
            <div className="p-3 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232]">
              <Target size={22} />
            </div>
          </div>
          <h3 className="text-3xl font-bold font-heading text-[#111111] dark:text-white my-1">
            {recentAttempts.length}
          </h3>
          <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
            Questions attempted across Aptitude, Coding, and Technical sets.
          </p>
        </div>

        {/* Target Role & Profile Quick Info */}
        <div className="card-warm dark:bg-[#1E1E1E] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
              Target Role
            </span>
            <div className="p-3 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232]">
              <Briefcase size={22} />
            </div>
          </div>
          <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white my-1 truncate">
            {user?.targetRole || 'Software Engineer'}
          </h3>
          <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
            {user?.targetCompany ? `Goal: ${user.targetCompany}` : 'Target company configured in profile.'}
          </p>
        </div>
      </div>

      {/* Recommended Next Steps Row */}
      <div>
        <h2 className="text-xl font-bold font-heading text-[#111111] dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-[#C85232]" size={20} /> Recommended Next Steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Practice DSA */}
          <div className="card-warm dark:bg-[#1E1E1E] border-l-4 border-l-[#C85232] flex flex-col justify-between p-6 group hover:border-r hover:border-b transition-all">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232] flex items-center justify-center mb-4">
                <Code2 size={24} />
              </div>
              <h3 className="text-lg font-bold font-heading text-[#111111] dark:text-white mb-2">
                Practice DSA & Coding
              </h3>
              <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed mb-6">
                Solve company-tagged data structures and algorithm problems with instant test case execution.
              </p>
            </div>
            <Link
              to="/placement?module=CODING"
              className="btn-terracotta w-full justify-center group-hover:bg-[#A43A1E]"
            >
              Solve DSA Problems <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2: Analyze Resume */}
          <div className="card-warm dark:bg-[#1E1E1E] border-l-4 border-l-[#C85232] flex flex-col justify-between p-6 group hover:border-r hover:border-b transition-all">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232] flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold font-heading text-[#111111] dark:text-white mb-2">
                Analyze Resume
              </h3>
              <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed mb-6">
                Upload your resume for an instant AI audit, keyword optimization, and targeted placement feedback.
              </p>
            </div>
            <Link
              to="/career-hub?tab=resume"
              className="btn-terracotta w-full justify-center group-hover:bg-[#A43A1E]"
            >
              Upload & Analyze <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 3: Mock Interview */}
          <div className="card-warm dark:bg-[#1E1E1E] border-l-4 border-l-[#C85232] flex flex-col justify-between p-6 group hover:border-r hover:border-b transition-all">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232] flex items-center justify-center mb-4">
                <Video size={24} />
              </div>
              <h3 className="text-lg font-bold font-heading text-[#111111] dark:text-white mb-2">
                Start Mock Interview
              </h3>
              <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed mb-6">
                Simulate a live AI technical or HR interview session tailored to your target software engineer role.
              </p>
            </div>
            <Link
              to="/mock-interview"
              className="btn-terracotta w-full justify-center group-hover:bg-[#A43A1E]"
            >
              Begin Interview <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-xl font-bold font-heading text-[#111111] dark:text-white mb-4">
          Recent Activity
        </h2>

        {!hasActivity ? (
          <EmptyState
            title="Welcome to PrepWise!"
            description="Start your preparation by completing your profile or attempting your first practice session."
            actionLabel="Start Preparation"
            onAction={() => navigate('/placement')}
            icon={BookOpen}
          />
        ) : (
          <div className="space-y-4">
            {recentAttempts.map((item, idx) => (
              <div
                key={item.id || `att-${idx}`}
                className="card-warm dark:bg-[#1E1E1E] p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      item.isCorrect
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {item.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold font-heading text-[#111111] dark:text-white">
                      {item.questionTitle || item.question?.title || `Question #${item.questionId || idx + 1}`}
                    </h4>
                    <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                      Score: {item.score ? `${item.score}%` : item.isCorrect ? 'Correct' : 'Incorrect'} • Time taken: {item.timeTakenSeconds || 45}s
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-[#5E5B56] dark:text-[#A0A0A0] flex items-center gap-1">
                  <Clock size={13} />
                  {item.attemptedAt ? new Date(item.attemptedAt).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            ))}

            {interviewsData.map((item, idx) => (
              <div
                key={item.id || `int-${idx}`}
                className="card-warm dark:bg-[#1E1E1E] p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232] flex items-center justify-center">
                    <Video size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold font-heading text-[#111111] dark:text-white">
                      Mock Interview: {item.targetRole || 'Software Engineering Role'}
                    </h4>
                    <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                      Status: <span className="font-semibold text-[#111111] dark:text-white">{item.status}</span>
                      {item.overallScore ? ` • Score: ${item.overallScore}%` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-[#5E5B56] dark:text-[#A0A0A0] flex items-center gap-1">
                  <Clock size={13} />
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
