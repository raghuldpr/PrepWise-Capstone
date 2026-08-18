import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Skills from './pages/onboarding/Skills';
import Goals from './pages/onboarding/Goals';
import Complete from './pages/onboarding/Complete';
import Dashboard from './pages/Dashboard';
import PlacementHub from './pages/placement/PlacementHub';
import Aptitude from './pages/placement/Aptitude';
import Technical from './pages/placement/Technical';
import Coding from './pages/placement/Coding';
import Dsa from './pages/placement/Dsa';
import CodingProblemDetail from './pages/placement/CodingProblemDetail';
import Companies from './pages/placement/Companies';
import CompanyDetail from './pages/placement/CompanyDetail';
import Progress from './pages/placement/Progress';
import ResultsSummary from './pages/placement/ResultsSummary';
import AiAssistant from './pages/hub/AiAssistant';
import ResumeAnalyzer from './pages/hub/ResumeAnalyzer';
import ResumeResult from './pages/hub/ResumeResult';
import ProjectFinder from './pages/hub/ProjectFinder';
import ProjectDetail from './pages/hub/ProjectDetail';
import SkillGap from './pages/hub/SkillGap';
import Roadmap from './pages/hub/Roadmap';
import StudyPlan from './pages/hub/StudyPlan';
import Setup from './pages/interview/Setup';
import Session from './pages/interview/Session';
import CodingSession from './pages/interview/CodingSession';
import Report from './pages/interview/Report';
import InterviewComplete from './pages/interview/Complete';
import History from './pages/interview/History';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicOnlyRoute from './components/routing/PublicOnlyRoute';
import OnboardingGate from './components/routing/OnboardingGate';
import { Sparkles, ArrowRight, Sun, Moon, UserCheck } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 transition-colors duration-200 bg-[var(--bg-canvas)] text-[var(--text-primary)] font-body">
      {/* Top Header */}
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C85232] flex items-center justify-center text-white font-bold text-xl shadow-xs">
            P
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#111111] dark:text-white font-heading">
            PrepWise
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-surface text-primary hover:bg-surface-alt transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" className="btn-terracotta">
            Sign In <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <main className="max-w-4xl mx-auto my-auto text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232] border border-[rgba(200,82,50,0.25)] mb-6">
          <Sparkles size={14} /> AI-Powered Placement Prep
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 font-heading text-[#111111] dark:text-white leading-tight">
          Master Your Campus Placements with Intelligent AI Coaching
        </h1>

        <p className="text-lg md:text-xl text-[#5E5B56] dark:text-[#A0A0A0] max-w-2xl mx-auto mb-10 leading-relaxed font-body">
          Personalized practice interviews, resume analysis, skill-gap roadmaps, and aptitude mastery designed for computer science engineering students.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link to="/register" className="btn-terracotta text-base px-8 py-3.5">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary-warm text-base px-6 py-3.5">
            <UserCheck size={18} /> Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
          <div className="card-warm dark:bg-[#1E1E1E]">
            <h3 className="text-lg font-bold mb-2 font-heading text-[#111111] dark:text-white">
              Mock AI Interviews
            </h3>
            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0]">
              Real-time technical and HR mock interviews tailored to companies like Google, Amazon, and TCS.
            </p>
          </div>

          <div className="card-warm dark:bg-[#1E1E1E]">
            <h3 className="text-lg font-bold mb-2 font-heading text-[#111111] dark:text-white">
              Resume Intelligence
            </h3>
            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0]">
              Instant score breakdown, missing keyword analysis, and actionable suggestions for target job roles.
            </p>
          </div>

          <div className="card-warm dark:bg-[#1E1E1E]">
            <h3 className="text-lg font-bold mb-2 font-heading text-[#111111] dark:text-white">
              Personalized Roadmaps
            </h3>
            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0]">
              AI-generated study plans targeting your specific skill gaps and career goals.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-8 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] text-center text-sm text-[#5E5B56] dark:text-[#A0A0A0]">
        PrepWise © 2026 — Warm Editorial Tech Placement Preparation Framework
      </footer>
    </div>
  );
};

const DashboardPlaceholder = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-extrabold font-heading">Dashboard</h1>
    <p className="text-[#5E5B56] dark:text-[#A0A0A0]">Welcome to your PrepWise Placement Portal.</p>
  </div>
);

const OnboardingPlaceholder = () => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-canvas)] text-[var(--text-primary)]">
    <div className="card-warm dark:bg-[#1E1E1E] max-w-lg w-full text-center p-8">
      <h2 className="text-2xl font-bold font-heading mb-3">Student Onboarding</h2>
      <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mb-6">
        Set up your target role, college, and career preferences.
      </p>
      <Link to="/dashboard" className="btn-terracotta">
        Go to Dashboard <ArrowRight size={16} />
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Only Routes (Guests only) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes (Authenticated users) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<OnboardingGate />}>
                <Route path="/onboarding" element={<Navigate to="/onboarding/skills" replace />} />
                <Route path="/onboarding/skills" element={<Skills />} />
                <Route path="/onboarding/goals" element={<Goals />} />
                <Route path="/onboarding/complete" element={<Complete />} />

                {/* Standalone Immersive Session Routes (No Main Sidebar) */}
                <Route path="/interview/session/:id" element={<Session />} />
                <Route path="/interview/session/:id/coding" element={<CodingSession />} />
                <Route path="/interview/session/:id/complete" element={<InterviewComplete />} />
                <Route path="/interview/report/:id" element={<Report />} />

                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/interview/history" element={<History />} />
                  <Route path="/placement" element={<PlacementHub />} />
                  <Route path="/placement/aptitude" element={<Aptitude />} />
                  <Route path="/placement/technical" element={<Technical />} />
                  <Route path="/placement/coding" element={<Coding />} />
                  <Route path="/placement/dsa" element={<Dsa />} />
                  <Route path="/placement/coding/:id" element={<CodingProblemDetail />} />
                  <Route path="/placement/companies" element={<Companies />} />
                  <Route path="/placement/companies/:id" element={<CompanyDetail />} />
                  <Route path="/placement/results/:id" element={<ResultsSummary />} />
                  <Route path="/career-hub" element={<AiAssistant />} />
                  <Route path="/hub/ai-assistant" element={<AiAssistant />} />
                  <Route path="/hub/resume" element={<ResumeAnalyzer />} />
                  <Route path="/hub/resume/result/:id" element={<ResumeResult />} />
                  <Route path="/hub/projects" element={<ProjectFinder />} />
                  <Route path="/hub/projects/:id" element={<ProjectDetail />} />
                  <Route path="/hub/skill-gap" element={<SkillGap />} />
                  <Route path="/hub/roadmap" element={<Roadmap />} />
                  <Route path="/hub/study-plan" element={<StudyPlan />} />
                  <Route path="/mock-interview" element={<Navigate to="/interview/setup/role" replace />} />
                  <Route path="/interview/setup" element={<Navigate to="/interview/setup/role" replace />} />
                  <Route path="/interview/setup/role" element={<Setup />} />
                  <Route path="/interview/setup/company" element={<Setup />} />
                  <Route path="/interview/setup/type" element={<Setup />} />
                  <Route path="/interview/setup/confirm" element={<Setup />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/profile" element={<div className="p-4 font-heading text-2xl font-bold">User Profile</div>} />
                  <Route path="/settings" element={<div className="p-4 font-heading text-2xl font-bold">Settings</div>} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
