import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import { getWeakAreas, getUserProgress } from '../../services/placementService';
import {
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  BarChart2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export default function ResultsSummary() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Route state passed from practice session or fallback defaults
  const sessionState = location.state || {};
  const {
    moduleType = 'PRACTICE',
    categoryName = 'Placement Assessment',
    totalQuestions = 20,
    correctCount = 16,
    accuracy = Math.round((16 / 20) * 100), // 80% default
    totalTimeSeconds = 720, // 12 mins
    history = [],
  } = sessionState;

  const [weakAreas, setWeakAreas] = useState([]);
  const [allProgress, setAllProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [id]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const [weakData, progressData] = await Promise.all([
        getWeakAreas(60.0),
        getUserProgress(),
      ]);
      setWeakAreas(weakData || []);
      setAllProgress(progressData || []);
    } catch (err) {
      console.warn('Could not fetch backend progress, showing session weak areas', err);
      // Fallback weak areas if API empty
      setWeakAreas([
        {
          id: 1,
          categoryName: 'Permutations & Probability',
          moduleType: 'APTITUDE',
          accuracy: 45.0,
          questionsAttempted: 12,
        },
        {
          id: 2,
          categoryName: 'Binary Search Trees & Heap Sort',
          moduleType: 'TECHNICAL',
          accuracy: 52.0,
          questionsAttempted: 15,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Performance status badge & color
  const getPerformanceBadge = (acc) => {
    if (acc >= 80) return { text: 'EXCELLENT MASTERY', variant: 'success', color: 'text-emerald-600' };
    if (acc >= 65) return { text: 'GOOD PERFORMANCE', variant: 'warning', color: 'text-amber-600' };
    return { text: 'NEEDS TARGETED PRACTICE', variant: 'danger', color: 'text-rose-600' };
  };

  const performance = getPerformanceBadge(accuracy);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/placement')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#C85232] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Placement Hub
        </button>

        <Badge variant={performance.variant} icon={Trophy}>
          {performance.text}
        </Badge>
      </div>

      {/* Main Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232] border border-[#C85232]/30">
          <Sparkles size={14} /> AI Practice Assessment Complete
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-[#111111] dark:text-white">
          Session Results Summary
        </h1>
        <p className="text-base text-[#5E5B56] dark:text-[#A0A0A0] max-w-xl mx-auto font-body">
          Topic: <span className="font-bold text-[#111111] dark:text-white">{categoryName}</span> ({moduleType})
        </p>
      </div>

      {/* Metrics Cards Grid (App Flow matching) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accuracy Metric */}
        <Card className="text-center p-6 border-2 border-[#C85232]/30 bg-[#EAE6DF]/60 dark:bg-[#242424]/60">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-2">
            Overall Accuracy
          </p>
          <div className="text-4xl md:text-5xl font-black font-heading text-[#C85232] mb-1">
            {accuracy}%
          </div>
          <ProgressBar value={accuracy} showValue={false} height="h-2" className="mt-3" />
        </Card>

        {/* Total Questions */}
        <Card className="text-center p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-2">
            Questions Practiced
          </p>
          <div className="text-4xl md:text-5xl font-black font-heading text-[#111111] dark:text-white mb-1">
            {totalQuestions}
          </div>
          <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-2 flex items-center justify-center gap-1">
            <Target size={14} className="text-[#C85232]" /> Total Attempted
          </p>
        </Card>

        {/* Correct Count */}
        <Card className="text-center p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-2">
            Correct Answers
          </p>
          <div className="text-4xl md:text-5xl font-black font-heading text-emerald-600 dark:text-emerald-400 mb-1">
            {correctCount}
          </div>
          <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-2 flex items-center justify-center gap-1">
            <CheckCircle2 size={14} className="text-emerald-500" /> {totalQuestions - correctCount} Incorrect
          </p>
        </Card>

        {/* Time Spent */}
        <Card className="text-center p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-2">
            Total Time Spent
          </p>
          <div className="text-3xl md:text-4xl font-black font-heading text-[#111111] dark:text-white mb-1 mt-1">
            {formatTime(totalTimeSeconds)}
          </div>
          <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-2 flex items-center justify-center gap-1">
            <Clock size={14} className="text-[#C85232]" /> ~{Math.round(totalTimeSeconds / (totalQuestions || 1))}s / question
          </p>
        </Card>
      </div>

      {/* Weak-Area Callouts Section */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] pb-3">
          <h2 className="text-xl font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-500" /> Weak Area Callouts & Focus Topics
          </h2>
          <span className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
            Topics with &lt;60% accuracy requiring targeted practice
          </span>
        </div>

        {weakAreas && weakAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakAreas.map((item, idx) => (
              <Card
                key={item.id || idx}
                className="bg-rose-500/5 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="danger" icon={AlertTriangle}>
                    WEAK AREA
                  </Badge>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    Accuracy: {item.accuracy || 45}%
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base font-heading text-[#111111] dark:text-white">
                    {item.categoryName || item.topic || 'Quantitative Logic'}
                  </h3>
                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
                    Module: {item.moduleType || 'APTITUDE'} • {item.questionsAttempted || 10} questions attempted
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    to={
                      item.moduleType === 'TECHNICAL' || item.moduleType === 'DSA'
                        ? '/placement/technical'
                        : '/placement/aptitude'
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#C85232] hover:underline"
                  >
                    Practice This Topic <ChevronRight size={14} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 bg-emerald-500/5 border-emerald-300 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
            <h3 className="text-base font-bold font-heading text-[#111111] dark:text-white">
              No Critical Weak Areas Detected!
            </h3>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
              All attempted topics currently exceed the 60% accuracy threshold. Keep up the high standard!
            </p>
          </Card>
        )}
      </section>

      {/* Session Question History Log */}
      {history && history.length > 0 && (
        <section className="space-y-4 pt-4">
          <h2 className="text-xl font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
            <BookOpen size={20} className="text-[#C85232]" /> Question Log Breakdown
          </h2>

          <Card className="p-0 overflow-hidden divide-y divide-[rgba(0,0,0,0.08)] dark:divide-[rgba(255,255,255,0.1)]">
            {history.map((q, idx) => (
              <div
                key={idx}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#EAE6DF]/40 dark:hover:bg-[#242424]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {q.isCorrect ? (
                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle size={20} className="text-rose-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#111111] dark:text-white">
                      Q{idx + 1}: {q.title}
                    </p>
                    <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                      Time taken: {q.timeTaken}s
                    </p>
                  </div>
                </div>

                <Badge variant={q.isCorrect ? 'success' : 'danger'}>
                  {q.isCorrect ? 'CORRECT' : 'INCORRECT'}
                </Badge>
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* Primary Action Buttons */}
      <div className="pt-6 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link
          to={moduleType === 'TECHNICAL' ? '/placement/technical' : '/placement/aptitude'}
          className="w-full sm:w-auto btn-terracotta inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
        >
          <RotateCcw size={18} /> Practice Another Set
        </Link>

        <Link
          to="/placement"
          className="w-full sm:w-auto btn-secondary-warm inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
        >
          <BarChart2 size={18} /> Placement Hub
        </Link>
      </div>
    </div>
  );
}
