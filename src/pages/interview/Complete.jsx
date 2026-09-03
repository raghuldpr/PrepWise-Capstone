import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BarChart2,
  RotateCcw,
  Home,
  Clock,
  Award,
  Cpu,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { getInterview } from '../../services/interviewService';

export default function Complete() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadInterviewData = async () => {
      try {
        const data = await getInterview(id);
        if (isMounted) setInterview(data);
      } catch (e) {
        console.error('Error fetching interview summary:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadInterviewData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E4E4E7] flex flex-col items-center justify-center p-4 sm:p-6 font-body selection:bg-[#C85232]/30 selection:text-white">
      <div className="max-w-md w-full bg-[#161619] border border-neutral-800 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top Terracotta Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C85232] to-transparent" />

        {/* Hero Celebration Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-2xl bg-[#C85232]/15 border-2 border-[#C85232]/40 flex items-center justify-center text-[#C85232] mx-auto animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs ring-4 ring-[#161619]">
            ✓
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading text-white">
            Interview Completed!
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
            Great job finishing your practice session. AI engine has processed your responses and computed your candidate score.
          </p>
        </div>

        {/* Session Stats Badge */}
        <div className="p-4 rounded-xl bg-[#0E0E10] border border-neutral-800/90 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
            <span className="text-neutral-400">Target Role:</span>
            <span className="font-bold text-white font-heading">
              {interview?.targetRole || 'Software Engineer'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
            <span className="text-neutral-400">Interview Type:</span>
            <span className="font-semibold text-[#C85232]">
              {interview?.interviewType || 'TECHNICAL'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Questions Completed:</span>
            <span className="font-mono text-emerald-400 font-bold">
              {interview?.questionCount || 5} / {interview?.questionCount || 5}
            </span>
          </div>
        </div>

        {/* Actions CTA */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate(`/interview/report/${id}`)}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#C85232] hover:bg-[#b04328] shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles size={16} />
            <span>View Full AI Performance Report</span>
            <ArrowRight size={16} />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/interview/setup/role')}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw size={14} /> Practice Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <Home size={14} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
