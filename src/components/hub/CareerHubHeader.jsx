import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, FileText, Code2, Sparkles, Target, Compass, Calendar } from 'lucide-react';

export default function CareerHubHeader() {
  const tabs = [
    { name: 'AI Assistant', path: '/hub/ai-assistant', altPath: '/career-hub', icon: Bot },
    { name: 'Skill Gap', path: '/hub/skill-gap', icon: Target },
    { name: 'Roadmap', path: '/hub/roadmap', icon: Compass },
    { name: 'Study Plan', path: '/hub/study-plan', icon: Calendar },
    { name: 'Resume', path: '/hub/resume', icon: FileText },
    { name: 'Projects', path: '/hub/projects', icon: Code2 },
  ];

  return (
    <div className="bg-[#EFECE6] dark:bg-[#181818] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2.5 px-2">
        <div className="w-8 h-8 rounded-lg bg-[#C85232] flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="font-bold text-sm font-heading text-[#111111] dark:text-white">Career Acceleration Hub</h2>
          <p className="text-[10px] text-[#5E5B56] dark:text-neutral-400">AI tools for skill gap, learning roadmaps, study plans & portfolio</p>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto max-w-full bg-[#EAE6DF] dark:bg-[#121212] p-1.5 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive || (tab.altPath && window.location.pathname === tab.altPath)
                    ? 'bg-[#C85232] text-white shadow-xs'
                    : 'text-[#5E5B56] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white hover:bg-[#E2DDD5] dark:hover:bg-[#222222]'
                }`
              }
            >
              <Icon size={14} />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
