import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import {
  Calculator,
  Code,
  Building2,
  Terminal,
  ArrowRight,
  Sparkles,
  Trophy,
  Target,
  BarChart3,
  Brain,
  CheckCircle2,
} from 'lucide-react';

export default function PlacementHub() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] pb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EAE6DF] dark:bg-[#242424] text-[#C85232] border border-[#C85232]/25 mb-3">
          <Sparkles size={14} /> Placement Practice Engine
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-[#111111] dark:text-white">
          Campus Placement Preparation
        </h1>
        <p className="text-base text-[#5E5B56] dark:text-[#A0A0A0] mt-2 max-w-2xl leading-relaxed">
          Master quantitative aptitude, logical reasoning, core technical domains, and company-specific interview patterns with AI evaluation.
        </p>
      </div>

      {/* Main Placement Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quantitative & Logical Aptitude */}
        <Card hoverable className="space-y-4 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C85232]/10 text-[#C85232] flex items-center justify-center">
                <Calculator size={24} />
              </div>
              <Badge variant="primary" icon={Brain}>
                HIGH WEIGHTAGE
              </Badge>
            </div>

            <h2 className="text-2xl font-bold font-heading text-[#111111] dark:text-white">
              Aptitude & Logical Reasoning
            </h2>

            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed">
              Master speed-math, time & work, probability, syllogisms, and data interpretation for tier-1 placement rounds.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="default">Quantitative Math</Badge>
              <Badge variant="default">Logical Deduction</Badge>
              <Badge variant="default">Data Interpretation</Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]">
            <Link
              to="/placement/aptitude"
              className="btn-terracotta w-full inline-flex items-center justify-center gap-2"
            >
              Start Aptitude Practice <ArrowRight size={18} />
            </Link>
          </div>
        </Card>

        {/* Technical & CS Core */}
        <Card hoverable className="space-y-4 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C85232]/10 text-[#C85232] flex items-center justify-center">
                <Code size={24} />
              </div>
              <Badge variant="primary" icon={Terminal}>
                CORE CS
              </Badge>
            </div>

            <h2 className="text-2xl font-bold font-heading text-[#111111] dark:text-white">
              Technical & Core CS Subjects
            </h2>

            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed">
              Practice Data Structures, Algorithms, Operating Systems, DBMS, Computer Networks, and System Design.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="default">DSA</Badge>
              <Badge variant="default">Operating Systems</Badge>
              <Badge variant="default">DBMS & SQL</Badge>
              <Badge variant="default">Networks</Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]">
            <Link
              to="/placement/technical"
              className="btn-terracotta w-full inline-flex items-center justify-center gap-2"
            >
              Start Technical Practice <ArrowRight size={18} />
            </Link>
          </div>
        </Card>

        {/* Interactive Coding IDE */}
        <Card hoverable className="space-y-4 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C85232]/10 text-[#C85232] flex items-center justify-center">
                <Terminal size={24} />
              </div>
              <Badge variant="primary" icon={Code}>
                DARK MODE IDE
              </Badge>
            </div>

            <h2 className="text-2xl font-bold font-heading text-[#111111] dark:text-white">
              Coding Assessment Engine
            </h2>

            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed">
              Solve coding challenges in a dedicated dark-mode IDE with test cases and evaluation metrics.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="default">JavaScript</Badge>
              <Badge variant="default">Python</Badge>
              <Badge variant="default">C++</Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]">
            <Link
              to="/placement/coding"
              className="btn-terracotta w-full inline-flex items-center justify-center gap-2"
            >
              Open Coding IDE <ArrowRight size={18} />
            </Link>
          </div>
        </Card>

        {/* DSA Curriculum */}
        <Card hoverable className="space-y-4 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C85232]/10 text-[#C85232] flex items-center justify-center">
                <Brain size={24} />
              </div>
              <Badge variant="primary">
                DSA PATTERNS
              </Badge>
            </div>

            <h2 className="text-2xl font-bold font-heading text-[#111111] dark:text-white">
              DSA Curriculum & Topics
            </h2>

            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed">
              Curated problem sets covering Trees, Graphs, Dynamic Programming, Two Pointers, and Sliding Window.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="default">Trees & Graphs</Badge>
              <Badge variant="default">DP</Badge>
              <Badge variant="default">Sliding Window</Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]">
            <Link
              to="/placement/dsa"
              className="btn-terracotta w-full inline-flex items-center justify-center gap-2"
            >
              Explore DSA Problems <ArrowRight size={18} />
            </Link>
          </div>
        </Card>

        {/* Company-Specific Preparation Tracks */}
        <Card hoverable className="space-y-4 p-6 md:p-8 flex flex-col justify-between md:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C85232]/10 text-[#C85232] flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <Badge variant="primary" icon={Sparkles}>
                COMPANY SPECIFIC
              </Badge>
            </div>

            <h2 className="text-2xl font-bold font-heading text-[#111111] dark:text-white">
              Target Company Tracks (Google, Amazon, TCS, Infosys & More)
            </h2>

            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed">
              Tailored preparation suites combining company-specific Aptitude tests, Coding challenges, Technical MCQs, and HR interview experiences.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="default">Tier-1 Product</Badge>
              <Badge variant="default">Mass Recruiters</Badge>
              <Badge variant="default">FinTech</Badge>
              <Badge variant="default">HR Interview Prep</Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] flex justify-end">
            <Link
              to="/placement/companies"
              className="btn-terracotta inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold"
            >
              Explore Target Companies <ArrowRight size={18} />
            </Link>
          </div>
        </Card>
      </div>

      {/* Stats Summary Banner */}
      <Card className="p-6 md:p-8 bg-[#EAE6DF]/60 dark:bg-[#242424]/60 border-[#C85232]/25">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#C85232] font-bold text-sm">
              <Trophy size={18} /> AI Adaptive Question Bank
            </div>
            <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
              Track Skill Gaps & Weak Area Callouts
            </h3>
            <p className="text-xs md:text-sm text-[#5E5B56] dark:text-[#A0A0A0]">
              Every practice session records your accuracy and automatically flags weak topics below 60%.
            </p>
          </div>

          <Link
            to="/progress"
            className="btn-secondary-warm whitespace-nowrap inline-flex items-center gap-2 px-6 py-3"
          >
            <BarChart3 size={18} /> View Detailed Analytics
          </Link>
        </div>
      </Card>
    </div>
  );
}
