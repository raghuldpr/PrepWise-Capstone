import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Target,
  Brain,
  Rocket,
  Sun,
  Moon,
} from 'lucide-react';

export const Complete = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 bg-[var(--bg-canvas)] text-[var(--text-primary)] font-body">
      {/* Header */}
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C85232] flex items-center justify-center text-white font-bold text-xl shadow-xs">
            P
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#111111] dark:text-white font-heading">
            PrepWise
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-surface text-primary hover:bg-surface-alt transition-colors"
          title="Toggle theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-xl w-full mx-auto my-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm animate-bounce">
          <CheckCircle2 size={44} />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 font-heading text-[#111111] dark:text-white">
          Profile Setup Complete!
        </h1>

        <p className="text-base text-[#5E5B56] dark:text-[#A0A0A0] max-w-md mx-auto mb-8">
          Welcome aboard, <span className="font-bold text-[#111111] dark:text-white">{user?.name}</span>! Your customized placement preparation workspace has been configured and is ready for action.
        </p>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
          <div className="card-warm dark:bg-[#1E1E1E] p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-[#C85232]/10 text-[#C85232] flex items-center justify-center mx-auto mb-2">
              <Brain size={18} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111] dark:text-white mb-1">
              AI Mock Practice
            </h3>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
              Personalized technical questions tailored to your skills.
            </p>
          </div>

          <div className="card-warm dark:bg-[#1E1E1E] p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-[#C85232]/10 text-[#C85232] flex items-center justify-center mx-auto mb-2">
              <Target size={18} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111] dark:text-white mb-1">
              Target Track
            </h3>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
              Curated roadmap for your target job role.
            </p>
          </div>

          <div className="card-warm dark:bg-[#1E1E1E] p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-[#C85232]/10 text-[#C85232] flex items-center justify-center mx-auto mb-2">
              <Rocket size={18} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111] dark:text-white mb-1">
              Live Readiness
            </h3>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
              Track placement eligibility scores in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-terracotta text-lg px-10 py-4 w-full shadow-md"
        >
          Go to Dashboard <ArrowRight size={20} />
        </button>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] text-center text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
        PrepWise Placement Intelligence Platform © 2026
      </footer>
    </div>
  );
};

export default Complete;
