import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getCompanyPreparation } from '../../services/placementService';
import {
  Building2,
  ArrowLeft,
  Calculator,
  Code,
  Terminal,
  Brain,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
  Target,
  ArrowRight,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const FALLBACK_COMPANY_PREP = {
  id: 'google',
  name: 'Google',
  logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=120&auto=format&fit=crop&q=80',
  category: 'Product / Tier-1',
  difficulty: 'HARD',
  avgSalary: '₹22 - ₹45 LPA',
  overview:
    'Google candidates are evaluated on algorithmic efficiency, clean software design, system architecture, and Googlyness (cultural fit & team collaboration).',
  rounds: [
    { title: 'Online Coding Assessment', duration: '90 Mins', weight: '30%', desc: '2 Complex Algorithmic Challenges (Graphs, DP, Trees)' },
    { title: 'Technical Phone Screen', duration: '45 Mins', weight: '20%', desc: 'Live Coding & Data Structure optimization' },
    { title: '3x Onsite Coding & System Design', duration: '3 x 45 Mins', weight: '35%', desc: 'Deep dive into scalable algorithms and low-level design' },
    { title: 'Googlyness & Leadership Round', duration: '45 Mins', weight: '15%', desc: 'Behavioral scenarios, ethics, leadership, and teamwork' },
  ],
  aptitudePrep: {
    weightage: 'High speed quantitative and analytical logic',
    topics: ['Probability & Permutations', 'Time, Speed & Distance', 'Logical Deductions', 'Data Interpretation'],
    sampleQuestions: [
      {
        question: 'In how many different ways can the letters of the word "GOOGLE" be arranged?',
        options: ['180', '360', '720', '90'],
        correctAnswer: '180',
        explanation: 'Total letters = 6. G repeats twice, O repeats twice. Total = 6! / (2! * 2!) = 720 / 4 = 180.',
      },
      {
        question: 'A bag contains 4 red balls and 6 blue balls. What is the probability of drawing 2 blue balls consecutively without replacement?',
        options: ['1/3', '1/2', '2/5', '1/5'],
        correctAnswer: '1/3',
        explanation: 'P(First Blue) = 6/10 = 3/5. P(Second Blue) = 5/9. Combined = (3/5) * (5/9) = 15/45 = 1/3.',
      },
    ],
  },
  codingPrep: {
    focusAreas: ['Dynamic Programming', 'Graph Algorithms (BFS/DFS)', 'Tries & Hash Maps', 'Sliding Window'],
    recommendedProblems: [
      { id: '301', title: 'Two Sum', difficulty: 'EASY', topic: 'Arrays & Hashing' },
      { id: '303', title: 'Longest Substring Without Repeating Characters', difficulty: 'MEDIUM', topic: 'Sliding Window' },
      { id: '306', title: 'Maximum Subarray (Kadane)', difficulty: 'MEDIUM', topic: 'Dynamic Programming' },
    ],
  },
  technicalPrep: {
    focusSubjects: ['Operating Systems (Threads, Lock-free sync)', 'DBMS (B-Trees, ACID, Sharding)', 'Computer Networks (TCP/UDP, HTTP/3)', 'Object-Oriented Design'],
    sampleMcqs: [
      {
        question: 'Which CPU scheduling algorithm can lead to starvation if short processes arrive continuously?',
        options: ['Round Robin', 'Shortest Job First (SJF)', 'First Come First Served (FCFS)', 'Priority Inversion'],
        correctAnswer: 'Shortest Job First (SJF)',
        explanation: 'SJF prioritizes shorter jobs, so long processes may wait indefinitely if short tasks keep arriving.',
      },
      {
        question: 'What is the primary purpose of an Index in relational databases like PostgreSQL or MySQL?',
        options: ['To ensure foreign key integrity', 'To speed up data retrieval operations', 'To encrypt sensitive column data', 'To compress table storage'],
        correctAnswer: 'To speed up data retrieval operations',
        explanation: 'Database indexes (often B-Trees) allow B-Tree logarithmic search O(log N) instead of sequential full table scans.',
      },
    ],
  },
  interviewPrep: {
    leadershipPrinciples: ['Bias for Action', 'Think Big', 'Ownership', 'Customer Obsession', 'Googlyness'],
    behavioralQuestions: [
      'Tell me about a time you made a technical trade-off under a tight project deadline.',
      'How do you handle disagreement with a senior engineer regarding architectural design?',
      'Describe a situation where a software bug affected production and how you mitigated it.',
    ],
    prepTips: [
      'Speak out loud while coding to demonstrate your problem-solving thought process.',
      'Always analyze Time Complexity (O-notation) and Space Complexity before writing final code.',
      'Use the STAR method (Situation, Task, Action, Result) for behavioral questions.',
    ],
  },
};

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [companyPrep, setCompanyPrep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'aptitude' | 'coding' | 'technical' | 'interview'

  useEffect(() => {
    fetchPrepData();
  }, [id]);

  const fetchPrepData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyPreparation(id);
      if (data) {
        setCompanyPrep(data);
      } else {
        setCompanyPrep({ ...FALLBACK_COMPANY_PREP, id });
      }
    } catch (err) {
      console.warn('Using fallback company prep payload:', err);
      setCompanyPrep({ ...FALLBACK_COMPANY_PREP, id });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <LoadingState message="Loading company preparation module..." />
      </div>
    );
  }

  if (error || !companyPrep) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <ErrorState message="Failed to load company preparation suite." onRetry={fetchPrepData} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] pb-4">
        <button
          onClick={() => navigate('/placement/companies')}
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white hover:bg-[#C85232] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> All Target Companies
        </button>

        <div className="flex items-center gap-2 text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
          <Building2 size={16} className="text-[#C85232]" />
          <span>Company Track #{id}</span>
        </div>
      </div>

      {/* Hero Banner Card */}
      <Card className="p-6 md:p-8 space-y-6 border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EAE6DF] dark:bg-[#242424] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)] overflow-hidden flex items-center justify-center shrink-0">
              {companyPrep.logo ? (
                <img
                  src={companyPrep.logo}
                  alt={companyPrep.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Building2 size={32} className="text-[#C85232]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary">{companyPrep.category || 'Target Track'}</Badge>
                <Badge
                  variant={
                    companyPrep.difficulty === 'EASY'
                      ? 'easy'
                      : companyPrep.difficulty === 'HARD'
                      ? 'hard'
                      : 'medium'
                  }
                >
                  {companyPrep.difficulty || 'MEDIUM'}
                </Badge>
              </div>

              <h1 className="text-3xl font-extrabold font-heading text-[#111111] dark:text-white">
                {companyPrep.name} Placement Preparation
              </h1>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-1 font-semibold">
                Average Package: <span className="text-[#C85232]">{companyPrep.avgSalary || '₹12 - ₹25 LPA'}</span>
              </p>
            </div>
          </div>

          {/* Direct Practice Quick Launch Links */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/placement/aptitude?company=${id}`}
              className="btn-terracotta text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
            >
              <Calculator size={14} /> Aptitude Test
            </Link>
            <Link
              to={`/placement/coding?company=${id}`}
              className="btn-terracotta text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
            >
              <Terminal size={14} /> Coding IDE
            </Link>
            <Link
              to={`/placement/technical?company=${id}`}
              className="btn-terracotta text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
            >
              <Brain size={14} /> Technical Test
            </Link>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pt-4">
          {[
            { key: 'overview', label: 'Selection Overview', icon: Briefcase },
            { key: 'aptitude', label: 'Aptitude & Logic', icon: Calculator },
            { key: 'coding', label: 'Coding & DSA', icon: Terminal },
            { key: 'technical', label: 'Technical MCQs', icon: Brain },
            { key: 'interview', label: 'HR & Interview Prep', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#C85232] text-white shadow-xs'
                    : 'bg-[#EAE6DF]/60 dark:bg-[#242424]/60 text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content Display */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
              <Target size={18} className="text-[#C85232]" /> Pattern & Evaluation Overview
            </h3>
            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed">
              {companyPrep.overview}
            </p>
          </Card>

          {/* Recruitment Rounds Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
              <Layers size={18} className="text-[#C85232]" /> Selection Round Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyPrep.rounds &&
                companyPrep.rounds.map((round, idx) => (
                  <Card key={idx} className="p-5 space-y-2 border-l-4 border-l-[#C85232]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#C85232] uppercase tracking-wider">
                        Round {idx + 1}
                      </span>
                      <Badge variant="default" icon={Clock}>
                        {round.duration}
                      </Badge>
                    </div>
                    <h4 className="text-base font-bold font-heading text-[#111111] dark:text-white">
                      {round.title}
                    </h4>
                    <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed">
                      {round.desc}
                    </p>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APTITUDE PREP */}
      {activeTab === 'aptitude' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                Aptitude & Reasoning Track
              </h3>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                Key numerical and analytical topics tested in initial online screening rounds.
              </p>
            </div>

            <Link
              to={`/placement/aptitude?company=${id}`}
              className="btn-terracotta text-xs px-4 py-2 inline-flex items-center gap-1.5"
            >
              Start Filtered Aptitude Round <ArrowRight size={14} />
            </Link>
          </div>

          {/* Key Topics Badges */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
              High-Frequency Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {companyPrep.aptitudePrep?.topics?.map((top, i) => (
                <Badge key={i} variant="primary" icon={CheckCircle2}>
                  {top}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Sample Questions */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#111111] dark:text-white">
              Company Tagged Sample Aptitude Questions
            </h4>
            {companyPrep.aptitudePrep?.sampleQuestions?.map((q, idx) => (
              <Card key={idx} className="p-5 space-y-3">
                <p className="text-sm font-bold text-[#111111] dark:text-white">
                  Q{idx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-lg text-xs font-semibold border text-center ${
                        opt === q.correctAnswer
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-surface border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)] text-[#5E5B56] dark:text-[#A0A0A0]'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] bg-[#EAE6DF]/50 dark:bg-[#242424]/50 p-3 rounded-lg leading-relaxed">
                  <span className="font-bold text-[#111111] dark:text-white">Explanation: </span>
                  {q.explanation}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CODING & DSA */}
      {activeTab === 'coding' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                Coding & Algorithmic Practice
              </h3>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                Top DSA patterns and problem statements asked in {companyPrep.name} coding assessments.
              </p>
            </div>

            <Link
              to={`/placement/coding?company=${id}`}
              className="btn-terracotta text-xs px-4 py-2 inline-flex items-center gap-1.5"
            >
              Open Interactive IDE <ArrowRight size={14} />
            </Link>
          </div>

          {/* Focus Areas */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
              Must-Master Algorithmic Patterns
            </h4>
            <div className="flex flex-wrap gap-2">
              {companyPrep.codingPrep?.focusAreas?.map((fa, i) => (
                <Badge key={i} variant="default" icon={Code}>
                  {fa}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Recommended Problems List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#111111] dark:text-white">
              Target Problem Set
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {companyPrep.codingPrep?.recommendedProblems?.map((prob) => (
                <Card key={prob.id} hoverable className="p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          prob.difficulty === 'EASY'
                            ? 'easy'
                            : prob.difficulty === 'HARD'
                            ? 'hard'
                            : 'medium'
                        }
                      >
                        {prob.difficulty}
                      </Badge>
                      <span className="text-[10px] font-bold text-[#5E5B56] dark:text-[#A0A0A0]">
                        {prob.topic}
                      </span>
                    </div>
                    <h5 className="text-base font-bold font-heading text-[#111111] dark:text-white">
                      {prob.title}
                    </h5>
                  </div>

                  <Link
                    to={`/placement/coding/${prob.id}`}
                    className="btn-terracotta text-xs w-full py-2 inline-flex items-center justify-center gap-1.5 mt-2"
                  >
                    Solve Code <Terminal size={12} />
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TECHNICAL MCQS */}
      {activeTab === 'technical' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                Technical CS Fundamentals
              </h3>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                Core Computer Science concepts evaluated in technical screenings and written rounds.
              </p>
            </div>

            <Link
              to={`/placement/technical?company=${id}`}
              className="btn-terracotta text-xs px-4 py-2 inline-flex items-center gap-1.5"
            >
              Start Technical MCQs <ArrowRight size={14} />
            </Link>
          </div>

          {/* Core Subjects */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
              Dominant CS Domains
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {companyPrep.technicalPrep?.focusSubjects?.map((sub, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]">
                  <CheckCircle2 size={14} className="text-[#C85232] shrink-0" />
                  <span className="font-semibold text-[#111111] dark:text-white">{sub}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Sample Technical MCQs */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#111111] dark:text-white">
              Sample Technical Screening Questions
            </h4>
            {companyPrep.technicalPrep?.sampleMcqs?.map((mcq, idx) => (
              <Card key={idx} className="p-5 space-y-3">
                <p className="text-sm font-bold text-[#111111] dark:text-white">
                  Q{idx + 1}. {mcq.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mcq.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-lg text-xs font-semibold border ${
                        opt === mcq.correctAnswer
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-surface border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)] text-[#5E5B56] dark:text-[#A0A0A0]'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] bg-[#EAE6DF]/50 dark:bg-[#242424]/50 p-3 rounded-lg leading-relaxed">
                  <span className="font-bold text-[#111111] dark:text-white">Explanation: </span>
                  {mcq.explanation}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HR & INTERVIEW PREP */}
      {activeTab === 'interview' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
              Interview & Culture Fit Prep
            </h3>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
              Behavioral principles, candidate interview experiences, and STAR-method responses.
            </p>
          </div>

          {/* Leadership & Culture Values */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
              Core Cultural Pillars & Values
            </h4>
            <div className="flex flex-wrap gap-2">
              {companyPrep.interviewPrep?.leadershipPrinciples?.map((lp, i) => (
                <Badge key={i} variant="primary" icon={Award}>
                  {lp}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Behavioral Questions */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
              Frequently Asked Behavioral Questions
            </h4>
            <ul className="space-y-2">
              {companyPrep.interviewPrep?.behavioralQuestions?.map((bq, i) => (
                <li key={i} className="text-xs font-semibold text-[#111111] dark:text-white flex items-start gap-2">
                  <span className="text-[#C85232] font-bold">•</span>
                  <span>{bq}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Candidate Experience Tips */}
          <Card className="p-5 space-y-3 bg-[#EAE6DF]/40 dark:bg-[#242424]/40 border-l-4 border-l-[#C85232]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85232] flex items-center gap-1.5">
              <Sparkles size={14} /> Expert Placement Interview Tips
            </h4>
            <ul className="space-y-2 text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
              {companyPrep.interviewPrep?.prepTips?.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
