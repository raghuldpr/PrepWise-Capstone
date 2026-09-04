import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import Modal from '../../components/common/Modal';
import { getUserProfile, updateUserProfile, getUserAnalytics } from '../../services/userService';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Globe,
  Github,
  Linkedin,
  FileText,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Star,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Terminal,
  Layers,
  Cpu,
  Calculator,
  Save,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const DEFAULT_TARGET_COMPANIES = [
  {
    companyName: 'Google',
    role: 'Software Engineer',
    status: 'Practicing',
    progress: 75,
    isPrimary: true,
  },
  {
    companyName: 'Microsoft',
    role: 'Full Stack Engineer',
    status: 'Practicing',
    progress: 60,
    isPrimary: false,
  },
  {
    companyName: 'Amazon',
    role: 'SDE 1',
    status: 'Researching',
    progress: 40,
    isPrimary: false,
  },
];

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, progress, companies, skills

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Target Company Management
  const [targetCompanies, setTargetCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({
    companyName: '',
    role: '',
    status: 'Practicing',
    progress: 50,
  });
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);

  useEffect(() => {
    loadProfileAndAnalytics();
  }, []);

  const loadProfileAndAnalytics = async () => {
    setLoading(true);
    try {
      const [profileRes, analyticsRes] = await Promise.allSettled([
        getUserProfile(),
        getUserAnalytics(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const p = profileRes.value;
        setProfile(p);
        setEditFormData({
          name: p.name || '',
          phone: p.phone || '',
          degree: p.degree || 'B.Tech / B.E.',
          branch: p.branch || 'Computer Science & Engineering',
          college: p.college || 'National Institute of Technology',
          graduationYear: p.graduationYear || 2026,
          currentSemester: p.currentSemester || '6th Semester',
          targetRole: p.targetRole || 'Software Development Engineer',
          targetCompany: p.targetCompany || 'Google',
          preferredIndustry: p.preferredIndustry || 'Information Technology / SaaS',
          placementStatus: p.placementStatus || 'Actively Preparing',
          expectedPackage: p.expectedPackage || '12-18 LPA',
          preferredLocation: p.preferredLocation || 'Bangalore / Hyderabad / Remote',
          jobType: p.jobType || 'Full-Time',
          githubUrl: p.githubUrl || '',
          linkedinUrl: p.linkedinUrl || '',
          portfolioUrl: p.portfolioUrl || '',
          resumeUrl: p.resumeUrl || '',
          careerGoal: p.careerGoal || '',
          bio: p.bio || '',
          certifications: p.certifications || 'AWS Certified Cloud Practitioner, Oracle Java SE 17 Certified',
        });

        // Parse Target Companies
        if (p.targetCompaniesData) {
          try {
            const parsed = JSON.parse(p.targetCompaniesData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTargetCompanies(parsed);
            } else {
              setTargetCompanies(DEFAULT_TARGET_COMPANIES);
            }
          } catch (e) {
            setTargetCompanies(DEFAULT_TARGET_COMPANIES);
          }
        } else {
          setTargetCompanies(DEFAULT_TARGET_COMPANIES);
        }
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setAnalytics(analyticsRes.value);
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const payload = {
        ...editFormData,
        targetCompaniesData: JSON.stringify(targetCompanies),
      };

      const updated = await updateUserProfile(payload);
      setProfile(updated);

      // Update local storage user name if changed
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (updated.name) {
        localUser.name = updated.name;
        localStorage.setItem('user', JSON.stringify(localUser));
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditModalOpen(false);
      }, 800);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.companyName.trim() || !newCompany.role.trim()) {
      return;
    }

    const updatedList = [
      ...targetCompanies,
      {
        companyName: newCompany.companyName.trim(),
        role: newCompany.role.trim(),
        status: newCompany.status || 'Practicing',
        progress: parseInt(newCompany.progress, 10) || 50,
        isPrimary: targetCompanies.length === 0,
      },
    ];

    setTargetCompanies(updatedList);
    setNewCompany({ companyName: '', role: '', status: 'Practicing', progress: 50 });
    setShowAddCompanyForm(false);

    // Persist immediately
    try {
      await updateUserProfile({
        targetCompaniesData: JSON.stringify(updatedList),
      });
    } catch (err) {
      console.error('Failed to persist target company:', err);
    }
  };

  const handleRemoveCompany = async (indexToRemove) => {
    const updatedList = targetCompanies.filter((_, idx) => idx !== indexToRemove);
    setTargetCompanies(updatedList);

    try {
      await updateUserProfile({
        targetCompaniesData: JSON.stringify(updatedList),
      });
    } catch (err) {
      console.error('Failed to remove company:', err);
    }
  };

  const handleSetPrimaryCompany = async (indexToPrimary) => {
    const updatedList = targetCompanies.map((c, idx) => ({
      ...c,
      isPrimary: idx === indexToPrimary,
    }));
    setTargetCompanies(updatedList);

    try {
      await updateUserProfile({
        targetCompany: updatedList[indexToPrimary].companyName,
        targetCompaniesData: JSON.stringify(updatedList),
      });
    } catch (err) {
      console.error('Failed to set primary company:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <LoadingState message="Loading placement candidate profile and progress metrics..." />
      </div>
    );
  }

  const p = profile || {};
  const a = analytics || {
    overallProgressPercent: 68,
    overallAccuracy: 74,
    totalQuestionsAttempted: 120,
    totalQuestionsSolved: 89,
    mockInterviewsCompleted: 4,
    averageMockInterviewScore: 78.5,
    currentStreakDays: 5,
    totalPracticeMinutes: 180,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-body">
      {/* CANDIDATE PROFILE HERO HEADER */}
      <Card className="p-6 md:p-8 relative overflow-hidden bg-surface border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C85232]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Photo / Initials Badge */}
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#C85232] text-white font-heading font-extrabold text-3xl md:text-4xl flex items-center justify-center shadow-md border-2 border-white dark:border-[#242424]">
                {p.name ? p.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white border-2 border-surface" title="Active Candidate">
                <ShieldCheck size={14} />
              </span>
            </div>

            {/* Basic Info & Placement Target */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#111111] dark:text-white">
                  {p.name || 'Placement Candidate'}
                </h1>
                <Badge variant="primary">
                  {p.placementStatus || 'Actively Preparing'}
                </Badge>
              </div>

              <p className="text-sm md:text-base font-semibold text-[#C85232] flex items-center gap-1.5">
                <Briefcase size={16} /> Target Role: {p.targetRole || 'Software Development Engineer'}
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                <span className="flex items-center gap-1">
                  <GraduationCap size={14} /> {p.degree || 'B.Tech'} - {p.branch || 'CSE'} ({p.graduationYear || '2026'})
                </span>
                <span className="flex items-center gap-1">
                  <Building2 size={14} /> {p.college || 'Engineering Institute'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {p.preferredLocation || 'Bangalore / Remote'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile CTA & Quick Social Links */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-terracotta inline-flex items-center gap-2 text-xs md:text-sm px-4 py-2.5 shadow-xs"
            >
              <Edit3 size={15} /> Edit Candidate Profile
            </button>

            {/* Quick Links */}
            <div className="flex items-center gap-2 pt-1">
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white hover:bg-[#C85232] hover:text-white transition-colors"
                  title="GitHub Profile"
                >
                  <Github size={16} />
                </a>
              )}
              {p.linkedinUrl && (
                <a
                  href={p.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white hover:bg-[#C85232] hover:text-white transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin size={16} />
                </a>
              )}
              {p.portfolioUrl && (
                <a
                  href={p.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white hover:bg-[#C85232] hover:text-white transition-colors"
                  title="Portfolio Website"
                >
                  <Globe size={16} />
                </a>
              )}
              <Link
                to="/hub/resume"
                className="p-2 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white hover:bg-[#C85232] hover:text-white transition-colors"
                title="View Resume Intelligence"
              >
                <FileText size={16} />
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Candidate Overview', icon: User },
          { id: 'progress', label: 'Placement Progress & Diagnostics', icon: TrendingUp },
          { id: 'companies', label: 'Target Companies & Roles', icon: Building2 },
          { id: 'skills', label: 'Skills & Certifications', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#C85232] text-[#C85232] bg-[#EAE6DF]/30 dark:bg-[#242424]/30'
                  : 'border-transparent text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1 border-l-4 border-l-[#C85232]">
              <span className="text-[11px] font-bold uppercase text-[#5E5B56] dark:text-[#A0A0A0]">Overall Prep</span>
              <p className="text-2xl font-extrabold font-heading text-[#111111] dark:text-white">
                {a.overallProgressPercent || 68}%
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Ready for Mock Round
              </p>
            </Card>

            <Card className="p-4 space-y-1 border-l-4 border-l-indigo-500">
              <span className="text-[11px] font-bold uppercase text-[#5E5B56] dark:text-[#A0A0A0]">Questions Solved</span>
              <p className="text-2xl font-extrabold font-heading text-[#111111] dark:text-white">
                {a.totalQuestionsSolved || 0} / {a.totalQuestionsAttempted || 0}
              </p>
              <p className="text-[10px] text-[#5E5B56] dark:text-[#A0A0A0]">
                Accuracy: {a.overallAccuracy || 0}%
              </p>
            </Card>

            <Card className="p-4 space-y-1 border-l-4 border-l-amber-500">
              <span className="text-[11px] font-bold uppercase text-[#5E5B56] dark:text-[#A0A0A0]">Mock Interviews</span>
              <p className="text-2xl font-extrabold font-heading text-[#111111] dark:text-white">
                {a.mockInterviewsCompleted || 0}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Avg Score: {a.averageMockInterviewScore || 0}%
              </p>
            </Card>

            <Card className="p-4 space-y-1 border-l-4 border-l-emerald-500">
              <span className="text-[11px] font-bold uppercase text-[#5E5B56] dark:text-[#A0A0A0]">Active Streak</span>
              <p className="text-2xl font-extrabold font-heading text-[#111111] dark:text-white">
                {a.currentStreakDays || 1} Days
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Zap size={12} /> Practice Streak
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic & Academic Information */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                <h3 className="font-heading font-bold text-lg text-[#111111] dark:text-white flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#C85232]" /> Academic & Contact Information
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-[#C85232] hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Email Address</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Phone Number</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.phone || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">College / University</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.college || 'Engineering College'}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Degree & Major</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.degree || 'B.Tech'} - {p.branch || 'CSE'}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Graduation Year</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.graduationYear || 2026}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Current Semester</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.currentSemester || '6th Semester'}</span>
                </div>
              </div>

              {p.bio && (
                <div className="pt-2 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] text-xs block mb-1">Candidate Bio</span>
                  <p className="text-xs text-[#111111] dark:text-white leading-relaxed">{p.bio}</p>
                </div>
              )}
            </Card>

            {/* Placement Preferences */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                <h3 className="font-heading font-bold text-lg text-[#111111] dark:text-white flex items-center gap-2">
                  <Briefcase size={18} className="text-[#C85232]" /> Placement Preferences & Targets
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-[#C85232] hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Target Job Role</span>
                  <span className="font-semibold text-[#C85232]">{p.targetRole || 'Software Engineer'}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Primary Company</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.targetCompany || 'Google'}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Placement Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{p.placementStatus || 'Actively Preparing'}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Expected Package (CTC)</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.expectedPackage || '12-18 LPA'}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Preferred Location</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.preferredLocation || 'Bangalore / Remote'}</span>
                </div>
                <div>
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] block">Job Type</span>
                  <span className="font-semibold text-[#111111] dark:text-white">{p.jobType || 'Full-Time'}</span>
                </div>
              </div>

              {p.careerGoal && (
                <div className="pt-2 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
                  <span className="text-[#5E5B56] dark:text-[#A0A0A0] text-xs block mb-1">Career Goal Statement</span>
                  <p className="text-xs text-[#111111] dark:text-white leading-relaxed">{p.careerGoal}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. PLACEMENT PROGRESS & PERFORMANCE */}
      {activeTab === 'progress' && (
        <div className="space-y-8">
          {/* Module-by-Module Progress Bars */}
          <Card className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-4">
              <div>
                <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                  Placement Subject Readiness
                </h3>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                  Real-time preparation metrics connected to your question attempts and assessments.
                </p>
              </div>
              <Badge variant="primary" icon={Sparkles}>
                Overall: {a.overallProgressPercent || 68}%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aptitude */}
              <div className="p-4 rounded-xl bg-[#EAE6DF]/40 dark:bg-[#242424]/40 border border-[rgba(0,0,0,0.06)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator size={16} className="text-[#C85232]" />
                    <h4 className="text-sm font-bold text-[#111111] dark:text-white">Quantitative & Logical Aptitude</h4>
                  </div>
                  <span className="text-xs font-extrabold text-[#111111] dark:text-white">
                    {a.aptitudeProgress?.accuracy || 75}% Accuracy
                  </span>
                </div>
                <ProgressBar value={a.aptitudeProgress?.progressPercent || 70} max={100} height="h-2.5" colorClass="bg-emerald-500" />
                <div className="flex justify-between text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">
                  <span>Attempted: {a.aptitudeProgress?.attempted || 35}</span>
                  <Link to="/placement/aptitude" className="text-[#C85232] hover:underline font-semibold">Practice Aptitude →</Link>
                </div>
              </div>

              {/* Coding */}
              <div className="p-4 rounded-xl bg-[#EAE6DF]/40 dark:bg-[#242424]/40 border border-[rgba(0,0,0,0.06)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-indigo-500" />
                    <h4 className="text-sm font-bold text-[#111111] dark:text-white">Coding & Problem Solving</h4>
                  </div>
                  <span className="text-xs font-extrabold text-[#111111] dark:text-white">
                    {a.codingProgress?.accuracy || 65}% Accuracy
                  </span>
                </div>
                <ProgressBar value={a.codingProgress?.progressPercent || 60} max={100} height="h-2.5" colorClass="bg-indigo-500" />
                <div className="flex justify-between text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">
                  <span>Attempted: {a.codingProgress?.attempted || 24}</span>
                  <Link to="/placement/coding" className="text-[#C85232] hover:underline font-semibold">Practice Coding →</Link>
                </div>
              </div>

              {/* DSA */}
              <div className="p-4 rounded-xl bg-[#EAE6DF]/40 dark:bg-[#242424]/40 border border-[rgba(0,0,0,0.06)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-amber-500" />
                    <h4 className="text-sm font-bold text-[#111111] dark:text-white">Data Structures & Algorithms</h4>
                  </div>
                  <span className="text-xs font-extrabold text-[#111111] dark:text-white">
                    {a.dsaProgress?.accuracy || 80}% Accuracy
                  </span>
                </div>
                <ProgressBar value={a.dsaProgress?.progressPercent || 80} max={100} height="h-2.5" colorClass="bg-amber-500" />
                <div className="flex justify-between text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">
                  <span>Attempted: {a.dsaProgress?.attempted || 20}</span>
                  <Link to="/placement/dsa" className="text-[#C85232] hover:underline font-semibold">Practice DSA →</Link>
                </div>
              </div>

              {/* Core CS */}
              <div className="p-4 rounded-xl bg-[#EAE6DF]/40 dark:bg-[#242424]/40 border border-[rgba(0,0,0,0.06)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-rose-500" />
                    <h4 className="text-sm font-bold text-[#111111] dark:text-white">Core CS (OS, DBMS, CN)</h4>
                  </div>
                  <span className="text-xs font-extrabold text-[#111111] dark:text-white">
                    {a.technicalProgress?.accuracy || 55}% Accuracy
                  </span>
                </div>
                <ProgressBar value={a.technicalProgress?.progressPercent || 50} max={100} height="h-2.5" colorClass="bg-rose-500" />
                <div className="flex justify-between text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">
                  <span>Attempted: {a.technicalProgress?.attempted || 18}</span>
                  <Link to="/placement/technical" className="text-[#C85232] hover:underline font-semibold">Practice Core CS →</Link>
                </div>
              </div>
            </div>
          </Card>

          {/* STRENGTHS & WEAK AREAS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strong Areas */}
            <Card className="p-6 space-y-4 bg-emerald-500/5 border-emerald-500/20">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <h3 className="font-heading font-bold text-base text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Candidate Strengths (&gt;70% Accuracy)
                </h3>
                <Badge variant="default" className="bg-emerald-500/10 text-emerald-700">
                  {a.strongAreas?.length || 0} Strong Topics
                </Badge>
              </div>

              <div className="space-y-3">
                {a.strongAreas && a.strongAreas.length > 0 ? (
                  a.strongAreas.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface border border-emerald-500/15 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#111111] dark:text-white">{item.topic || item.categoryName}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.accuracy}% Accuracy</span>
                      </div>
                      <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">{item.recommendation}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">Complete practice tests to identify your top performing subjects.</p>
                )}
              </div>
            </Card>

            {/* Weak Areas & Topics Requiring Improvement */}
            <Card className="p-6 space-y-4 bg-rose-500/5 border-rose-500/20">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                <h3 className="font-heading font-bold text-base text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle size={18} /> Focus & Weak Areas (&lt;60% Accuracy)
                </h3>
                <Badge variant="danger">
                  {a.weakAreas?.length || 0} Action Items
                </Badge>
              </div>

              <div className="space-y-3">
                {a.weakAreas && a.weakAreas.length > 0 ? (
                  a.weakAreas.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface border border-rose-500/15 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#111111] dark:text-white">{item.topic || item.categoryName}</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">{item.accuracy}% Accuracy</span>
                      </div>
                      <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">{item.recommendation}</p>
                      <Link
                        to={item.practiceLink || '/placement'}
                        className="btn-terracotta inline-flex items-center gap-1 text-[10px] px-2.5 py-1"
                      >
                        Practice Topic <ArrowRight size={12} />
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">No weak areas detected below the 60% threshold.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. TARGET COMPANIES */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                Target Companies & Preparation Tracker
              </h3>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                Track role targets, customized progress bars, and status across your preferred recruiters.
              </p>
            </div>

            <button
              onClick={() => setShowAddCompanyForm(!showAddCompanyForm)}
              className="btn-terracotta inline-flex items-center gap-1.5 text-xs px-3 py-2 shrink-0 self-start sm:self-auto"
            >
              {showAddCompanyForm ? <X size={14} /> : <Plus size={14} />}
              {showAddCompanyForm ? 'Cancel' : 'Add Target Company'}
            </button>
          </div>

          {/* Add Company Inline Form */}
          {showAddCompanyForm && (
            <Card className="p-5 bg-surface-alt border-[rgba(0,0,0,0.1)] space-y-4">
              <h4 className="text-sm font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
                <Plus size={16} className="text-[#C85232]" /> Add New Target Company
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Company Name</label>
                  <input
                    type="text"
                    value={newCompany.companyName}
                    onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })}
                    placeholder="e.g. Goldman Sachs"
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Target Role</label>
                  <input
                    type="text"
                    value={newCompany.role}
                    onChange={(e) => setNewCompany({ ...newCompany, role: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Status</label>
                  <select
                    value={newCompany.status}
                    onChange={(e) => setNewCompany({ ...newCompany, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                  >
                    <option value="Researching">Researching</option>
                    <option value="Practicing">Practicing</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Offer Received">Offer Received</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Prep Readiness (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCompany.progress}
                    onChange={(e) => setNewCompany({ ...newCompany, progress: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EAE6DF] dark:bg-[#242424] text-[#5E5B56] dark:text-[#A0A0A0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCompany}
                  className="btn-terracotta text-xs px-4 py-1.5"
                >
                  Save Target Company
                </button>
              </div>
            </Card>
          )}

          {/* Company Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targetCompanies.map((c, idx) => (
              <Card key={idx} className={`p-5 space-y-3 relative ${c.isPrimary ? 'border-2 border-[#C85232]' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C85232]/10 text-[#C85232] font-bold text-base flex items-center justify-center font-heading">
                      {c.companyName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-[#111111] dark:text-white">{c.companyName}</h4>
                        {c.isPrimary && (
                          <span className="p-0.5 rounded-full bg-amber-500/10 text-amber-500" title="Primary Target">
                            <Star size={12} className="fill-amber-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">{c.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveCompany(idx)}
                    className="p-1.5 text-[#5E5B56] hover:text-rose-500 transition-colors"
                    title="Remove Company"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#5E5B56] dark:text-[#A0A0A0]">Readiness</span>
                    <span className="font-bold text-[#111111] dark:text-white">{c.progress}%</span>
                  </div>
                  <ProgressBar value={c.progress} max={100} height="h-2" colorClass={c.progress >= 70 ? 'bg-emerald-500' : 'bg-[#C85232]'} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.06)] text-xs">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {c.status}
                  </span>

                  {!c.isPrimary && (
                    <button
                      onClick={() => handleSetPrimaryCompany(idx)}
                      className="text-[11px] text-[#C85232] hover:underline font-semibold"
                    >
                      Make Primary
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. SKILLS & CERTIFICATIONS */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <Card className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-4">
              <div>
                <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                  Technical Skill Stack & Proficiency
                </h3>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                  Assessed skills across languages, algorithms, architectures, and tools.
                </p>
              </div>

              <button
                onClick={() => navigate('/onboarding/skills')}
                className="btn-terracotta text-xs px-3 py-2 inline-flex items-center gap-1.5"
              >
                <Edit3 size={14} /> Manage Skills
              </button>
            </div>

            {/* Categorized Skills */}
            {p.skills && p.skills.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(
                    p.skills.reduce((acc, s) => {
                      const cat = s.category || 'General Technical Skills';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(s);
                      return acc;
                    }, {})
                  ).map(([cat, catSkills]) => (
                    <div key={cat} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
                        {cat}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {catSkills.map((s) => (
                          <span
                            key={s.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white border border-[rgba(0,0,0,0.08)] flex items-center gap-1.5 shadow-xs"
                          >
                            <span>{s.name}</span>
                            <span className="text-[10px] uppercase font-bold text-[#C85232]">
                              • {s.proficiencyLevel ? s.proficiencyLevel.toLowerCase() : 'beginner'}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3 bg-surface-alt/50 rounded-xl border border-dashed border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] p-6">
                <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] max-w-md mx-auto">
                  No technical skills configured yet. Add your core languages, frameworks, and subjects to personalize your AI practice sessions and skill gap analysis.
                </p>
                <button
                  onClick={() => navigate('/onboarding/skills')}
                  className="btn-terracotta text-xs px-4 py-2 inline-flex items-center gap-1.5"
                >
                  <Edit3 size={14} /> Select Your Skills Sheet
                </button>
              </div>
            )}

            {/* Verified Certifications */}
            <div className="pt-6 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
                Verified Certifications
              </h4>
              <div className="space-y-2">
                {(p.certifications ? p.certifications.split(',') : ['AWS Certified Cloud Practitioner', 'Oracle Certified Professional: Java SE 17']).map((cert, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-[#111111] dark:text-white">
                    <Award size={14} className="text-[#C85232] shrink-0" />
                    <span>{cert.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Placement Candidate Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 size={16} /> Profile updated successfully!
            </div>
          )}

          {/* Section: Basic Information */}
          <div className="space-y-2 pt-1">
            <h4 className="font-bold text-xs uppercase text-[#C85232] tracking-wider">Basic & Contact Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Academic Information */}
          <div className="space-y-2 pt-2 border-t border-[rgba(0,0,0,0.06)]">
            <h4 className="font-bold text-xs uppercase text-[#C85232] tracking-wider">Academic Background</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">College / University</label>
                <input
                  type="text"
                  value={editFormData.college}
                  onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Degree</label>
                <input
                  type="text"
                  value={editFormData.degree}
                  onChange={(e) => setEditFormData({ ...editFormData, degree: e.target.value })}
                  placeholder="B.Tech, M.Tech, MCA, B.Sc"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Branch / Department</label>
                <input
                  type="text"
                  value={editFormData.branch}
                  onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                  placeholder="Computer Science & Engineering"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={editFormData.graduationYear}
                  onChange={(e) => setEditFormData({ ...editFormData, graduationYear: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Placement Targets */}
          <div className="space-y-2 pt-2 border-t border-[rgba(0,0,0,0.06)]">
            <h4 className="font-bold text-xs uppercase text-[#C85232] tracking-wider">Placement Goals</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Target Job Role</label>
                <input
                  type="text"
                  value={editFormData.targetRole}
                  onChange={(e) => setEditFormData({ ...editFormData, targetRole: e.target.value })}
                  placeholder="Software Engineer, Data Analyst"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Placement Status</label>
                <select
                  value={editFormData.placementStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, placementStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                >
                  <option value="Actively Preparing">Actively Preparing</option>
                  <option value="Applying">Applying</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Placed">Placed</option>
                </select>
              </div>
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Expected Package (CTC)</label>
                <input
                  type="text"
                  value={editFormData.expectedPackage}
                  onChange={(e) => setEditFormData({ ...editFormData, expectedPackage: e.target.value })}
                  placeholder="12-18 LPA"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Preferred Location</label>
                <input
                  type="text"
                  value={editFormData.preferredLocation}
                  onChange={(e) => setEditFormData({ ...editFormData, preferredLocation: e.target.value })}
                  placeholder="Bangalore, Hyderabad, Remote"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Links & Certifications */}
          <div className="space-y-2 pt-2 border-t border-[rgba(0,0,0,0.06)]">
            <h4 className="font-bold text-xs uppercase text-[#C85232] tracking-wider">Social Links & Certifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">GitHub Profile URL</label>
                <input
                  type="url"
                  value={editFormData.githubUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={editFormData.linkedinUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1">Certifications (comma-separated)</label>
                <input
                  type="text"
                  value={editFormData.certifications}
                  onChange={(e) => setEditFormData({ ...editFormData, certifications: e.target.value })}
                  placeholder="AWS Cloud Practitioner, Java SE 17 Certified, HackerRank Problem Solving"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(0,0,0,0.08)]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg font-semibold bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white hover:bg-[#E2DDD5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-terracotta px-5 py-2 inline-flex items-center gap-2"
            >
              <Save size={15} />
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
