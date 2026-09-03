import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Code2,
  UserCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Terminal,
  Zap,
  HelpCircle,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { getCompanies } from '../../services/placementService';
import { createInterview, startInterview } from '../../services/interviewService';

const PRESET_ROLES = [
  'Software Development Engineer (SDE)',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Developer',
  'Data Scientist / AI Engineer',
  'DevOps & Cloud Engineer'
];

const INTERVIEW_TYPES = [
  {
    id: 'TECHNICAL',
    title: 'Technical Interview',
    icon: Code2,
    badge: 'Popular',
    description: 'Deep dive into core algorithms, system architecture, database concepts, and domain knowledge.'
  },
  {
    id: 'HR',
    title: 'HR & Behavioral',
    icon: UserCheck,
    badge: 'Essential',
    description: 'Evaluate soft skills, communication, leadership scenarios, STAR framework responses, and cultural fit.'
  },
  {
    id: 'CODING',
    title: 'Coding Assessment',
    icon: Terminal,
    badge: 'Practical',
    description: 'Hands-on live problem solving with code editor, starter code, and test case execution analysis.'
  },
  {
    id: 'MIXED',
    title: 'Mixed Round',
    icon: Zap,
    badge: 'Comprehensive',
    description: 'A dynamic combination of technical conceptual questions and interactive coding challenges.'
  }
];

export default function Setup() {
  const navigate = useNavigate();
  const location = useLocation();

  // Wizard state persisted in localStorage for seamless refreshes
  const [targetRole, setTargetRole] = useState(() => localStorage.getItem('setup_role') || 'Software Development Engineer (SDE)');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('setup_difficulty') || 'MEDIUM');
  const [numberOfQuestions, setNumberOfQuestions] = useState(() => parseInt(localStorage.getItem('setup_qcount') || '5', 10));
  const [companyId, setCompanyId] = useState(() => {
    const saved = localStorage.getItem('setup_company_id');
    return saved ? parseInt(saved, 10) : null;
  });
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('setup_company_name') || 'General Practice');
  const [interviewType, setInterviewType] = useState(() => localStorage.getItem('setup_type') || 'TECHNICAL');

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('setup_role', targetRole);
    localStorage.setItem('setup_difficulty', difficulty);
    localStorage.setItem('setup_qcount', numberOfQuestions.toString());
    if (companyId) localStorage.setItem('setup_company_id', companyId.toString());
    else localStorage.removeItem('setup_company_id');
    localStorage.setItem('setup_company_name', companyName);
    localStorage.setItem('setup_type', interviewType);
  }, [targetRole, difficulty, numberOfQuestions, companyId, companyName, interviewType]);

  // Load companies
  useEffect(() => {
    let isMounted = true;
    setLoadingCompanies(true);
    getCompanies()
      .then((data) => {
        if (isMounted) {
          setCompanies(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error('Failed to load companies:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCompanies(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Determine current step from route path
  const currentPath = location.pathname;
  let activeStep = 0;
  if (currentPath.includes('/company')) activeStep = 1;
  else if (currentPath.includes('/type')) activeStep = 2;
  else if (currentPath.includes('/confirm')) activeStep = 3;

  const steps = [
    { label: 'Role & Level', path: '/interview/setup/role' },
    { label: 'Company Target', path: '/interview/setup/company' },
    { label: 'Interview Type', path: '/interview/setup/type' },
    { label: 'Confirm & Start', path: '/interview/setup/confirm' }
  ];

  const handleStartInterview = async () => {
    setSubmitting(true);
    setErrorMessage('');

    const finalRole = customRole.trim() ? customRole.trim() : targetRole;

    try {
      const interview = await createInterview({
        targetRole: finalRole,
        companyId: companyId,
        companyName: companyName,
        interviewType: interviewType,
        difficulty: difficulty,
        numberOfQuestions: numberOfQuestions
      });

      // Initialize/Start the interview session
      await startInterview(interview.id);

      // Navigate to the interview session
      navigate(`/interview/session/${interview.id}`);
    } catch (err) {
      console.error('Failed to start interview:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to initialize AI interview. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-body">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232] border border-[rgba(200,82,50,0.25)] mb-3">
          <Sparkles size={14} /> AI Mock Interview Setup
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-[#111111] dark:text-white">
          Configure Your Practice Session
        </h1>
        <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mt-1 max-w-lg mx-auto">
          Customize your role, target company, difficulty level, and interview format for realistic AI evaluation.
        </p>
      </div>

      {/* Progress Wizard Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          {/* Progress Bar Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-[#C85232] -translate-y-1/2 transition-all duration-300 z-0"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;

            return (
              <button
                key={step.path}
                onClick={() => navigate(step.path)}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isCompleted
                      ? 'bg-[#C85232] text-white'
                      : isCurrent
                      ? 'bg-[#C85232] text-white ring-4 ring-[#C85232]/20'
                      : 'bg-[#EAE6DF] dark:bg-[#2A2A2A] text-[#5E5B56] dark:text-[#A0A0A0]'
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : idx + 1}
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden sm:block ${
                    isCurrent ? 'text-[#C85232] font-bold' : 'text-[#5E5B56] dark:text-[#A0A0A0]'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: ROLE & LEVEL */}
      {activeStep === 0 && (
        <div className="card-warm dark:bg-[#1E1E1E] p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
            <div className="w-10 h-10 rounded-xl bg-[#C85232]/10 text-[#C85232] flex items-center justify-center font-bold">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                Select Target Role & Experience Level
              </h2>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                Choose from standard job roles or define your custom position.
              </p>
            </div>
          </div>

          {/* Preset Roles Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-3">
              Target Job Title
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {PRESET_ROLES.map((role) => {
                const isSelected = targetRole === role && !customRole.trim();
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => {
                      setTargetRole(role);
                      setCustomRole('');
                    }}
                    className={`p-3.5 rounded-xl text-left border text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#C85232] bg-[#C85232]/5 text-[#C85232] font-semibold'
                        : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-surface text-primary hover:border-[#C85232]/50'
                    }`}
                  >
                    <span>{role}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-[#C85232]" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <div className="pt-2">
              <input
                type="text"
                placeholder="Or type custom target role (e.g., iOS Mobile Engineer)"
                value={customRole}
                onChange={(e) => {
                  setCustomRole(e.target.value);
                  if (e.target.value.trim()) {
                    setTargetRole(e.target.value.trim());
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] bg-surface text-primary text-sm focus:outline-none focus:border-[#C85232]"
              />
            </div>
          </div>

          {/* Difficulty and Question Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-2">
                Interview Difficulty
              </label>
              <div className="flex gap-2">
                {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      difficulty === level
                        ? 'border-[#C85232] bg-[#C85232] text-white'
                        : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-surface text-primary hover:bg-surface-alt'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-2">
                Number of Questions
              </label>
              <div className="flex gap-2">
                {[3, 5, 8, 10].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setNumberOfQuestions(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      numberOfQuestions === num
                        ? 'border-[#C85232] bg-[#C85232] text-white'
                        : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-surface text-primary hover:bg-surface-alt'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation CTA */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate('/interview/setup/company')}
              className="btn-terracotta text-sm px-6 py-3"
            >
              Next: Select Company <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: COMPANY TARGET */}
      {activeStep === 1 && (
        <div className="card-warm dark:bg-[#1E1E1E] p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
            <div className="w-10 h-10 rounded-xl bg-[#C85232]/10 text-[#C85232] flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                Target Company (Optional)
              </h2>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                Tailor questions to specific hiring standards, interview patterns, and corporate cultures.
              </p>
            </div>
          </div>

          {/* General Practice Option */}
          <button
            type="button"
            onClick={() => {
              setCompanyId(null);
              setCompanyName('General Practice');
            }}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              companyName === 'General Practice' && !companyId
                ? 'border-[#C85232] bg-[#C85232]/5 text-[#C85232] font-semibold'
                : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-surface text-primary hover:border-[#C85232]/50'
            }`}
          >
            <div>
              <div className="font-bold text-sm">General Practice / Any Company</div>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                Standard industry technical questions suitable for all tech companies.
              </p>
            </div>
            {companyName === 'General Practice' && !companyId && (
              <CheckCircle2 size={18} className="text-[#C85232] shrink-0" />
            )}
          </button>

          {/* Top Companies List */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0] mb-3">
              Popular Recruiting Companies
            </label>

            {loadingCompanies ? (
              <div className="py-8 text-center text-sm text-[#5E5B56] dark:text-[#A0A0A0]">
                Loading company profiles...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {companies.map((comp) => {
                  const isSelected = companyId === comp.id || companyName === comp.name;
                  return (
                    <button
                      type="button"
                      key={comp.id || comp.name}
                      onClick={() => {
                        setCompanyId(comp.id || null);
                        setCompanyName(comp.name);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#C85232] bg-[#C85232]/5 text-[#C85232] font-semibold'
                          : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-surface text-primary hover:border-[#C85232]/50'
                      }`}
                    >
                      <span className="text-sm truncate">{comp.name}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-[#C85232] shrink-0" />}
                    </button>
                  );
                })}

                {/* Preset defaults if companies list is empty */}
                {companies.length === 0 &&
                  ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Accenture'].map((cName) => {
                    const isSelected = companyName === cName;
                    return (
                      <button
                        type="button"
                        key={cName}
                        onClick={() => {
                          setCompanyId(null);
                          setCompanyName(cName);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#C85232] bg-[#C85232]/5 text-[#C85232] font-semibold'
                            : 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-surface text-primary hover:border-[#C85232]/50'
                        }`}
                      >
                        <span className="text-sm truncate">{cName}</span>
                        {isSelected && <CheckCircle2 size={16} className="text-[#C85232] shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Navigation CTA */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => navigate('/interview/setup/role')}
              className="btn-secondary-warm text-sm px-5 py-2.5"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={() => navigate('/interview/setup/type')}
              className="btn-terracotta text-sm px-6 py-3"
            >
              Next: Interview Type <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INTERVIEW TYPE */}
      {activeStep === 2 && (
        <div className="card-warm dark:bg-[#1E1E1E] p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
            <div className="w-10 h-10 rounded-xl bg-[#C85232]/10 text-[#C85232] flex items-center justify-center font-bold">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                Choose Interview Format
              </h2>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                Select the type of interview round you want to simulate.
              </p>
            </div>
          </div>

          {/* Selectable Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTERVIEW_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = interviewType === type.id;

              return (
                <div
                  key={type.id}
                  onClick={() => setInterviewType(type.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#C85232] bg-[#C85232]/5 ring-2 ring-[#C85232]/20 shadow-sm'
                      : 'border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)] bg-surface hover:border-[#C85232]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#C85232] text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-[#5E5B56] dark:text-[#A0A0A0]'
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAE6DF] dark:bg-[#2A2A2A] text-[#C85232]">
                        {type.badge}
                      </span>
                    </div>

                    <h3 className="font-bold font-heading text-base text-[#111111] dark:text-white mb-1">
                      {type.title}
                    </h3>
                    <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed">
                      {type.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)] flex justify-end">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C85232]">
                        <CheckCircle2 size={16} /> Selected
                      </span>
                    ) : (
                      <span className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                        Click to select
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation CTA */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => navigate('/interview/setup/company')}
              className="btn-secondary-warm text-sm px-5 py-2.5"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={() => navigate('/interview/setup/confirm')}
              className="btn-terracotta text-sm px-6 py-3"
            >
              Next: Review & Confirm <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRMATION SUMMARY & START */}
      {activeStep === 3 && (
        <div className="card-warm dark:bg-[#1E1E1E] p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
            <div className="w-10 h-10 rounded-xl bg-[#C85232]/10 text-[#C85232] flex items-center justify-center font-bold">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                Review Interview Session Configuration
              </h2>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                Verify your choices before initializing the AI interviewer.
              </p>
            </div>
          </div>

          {/* Summary Breakdown Grid */}
          <div className="bg-surface p-5 rounded-2xl border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
              <span className="text-xs uppercase font-bold text-[#5E5B56] dark:text-[#A0A0A0]">
                Target Role
              </span>
              <span className="text-sm font-bold text-[#111111] dark:text-white mt-1 sm:mt-0">
                {customRole.trim() || targetRole}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
              <span className="text-xs uppercase font-bold text-[#5E5B56] dark:text-[#A0A0A0]">
                Target Company
              </span>
              <span className="text-sm font-bold text-[#111111] dark:text-white mt-1 sm:mt-0">
                {companyName}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
              <span className="text-xs uppercase font-bold text-[#5E5B56] dark:text-[#A0A0A0]">
                Format & Type
              </span>
              <span className="text-sm font-bold text-[#111111] dark:text-white mt-1 sm:mt-0">
                {INTERVIEW_TYPES.find((t) => t.id === interviewType)?.title || interviewType}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
              <span className="text-xs uppercase font-bold text-[#5E5B56] dark:text-[#A0A0A0]">
                Difficulty Level
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C85232]/10 text-[#C85232]">
                {difficulty}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2">
              <span className="text-xs uppercase font-bold text-[#5E5B56] dark:text-[#A0A0A0]">
                Total Questions
              </span>
              <span className="text-sm font-bold text-[#111111] dark:text-white mt-1 sm:mt-0">
                {numberOfQuestions} Questions
              </span>
            </div>
          </div>

          {/* Prompt info banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-3 leading-relaxed">
            <Sparkles size={16} className="shrink-0 mt-0.5" />
            <div>
              Our AI engine will dynamically adapt questions based on your performance in real time. Make sure your microphone or editor is ready!
            </div>
          </div>

          {/* Final Action CTA */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() => navigate('/interview/setup/type')}
              className="btn-secondary-warm text-sm px-5 py-2.5"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleStartInterview}
              className="btn-terracotta text-base px-8 py-3.5 shadow-md flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Initializing AI Session...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Start Interview</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
