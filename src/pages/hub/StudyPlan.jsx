import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  BookOpen,
  Target,
  Loader2,
  Check,
  ChevronRight,
  Flame,
  Zap,
  BarChart2,
  Filter,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import { generateStudyPlan, getUserStudyPlans } from '../../services/studyPlanService';
import { getAiErrorMessage } from '../../utils/aiErrorUtils';
import CareerHubHeader from '../../components/hub/CareerHubHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function StudyPlan() {
  const navigate = useNavigate();

  // Inputs state
  const [availableStudyTime, setAvailableStudyTime] = useState('2 hours / day');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [currentSkillLevel, setCurrentSkillLevel] = useState('Intermediate');
  const [targetDeadline, setTargetDeadline] = useState('6 Weeks');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    loadUserStudyPlans();
  }, []);

  const loadUserStudyPlans = async () => {
    try {
      const plans = await getUserStudyPlans();
      if (plans && plans.length > 0) {
        setCurrentPlan(plans[0]);
      } else {
        await handleGenerate();
      }
    } catch (err) {
      console.log("No existing study plan, generating default...");
      await handleGenerate();
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        availableStudyTime,
        targetRole,
        currentSkillLevel,
        targetDeadline
      };
      const data = await generateStudyPlan(payload);
      setCurrentPlan(data);
      setCompletedTasks({});
    } catch (err) {
      console.error("Failed to generate study plan:", err);
      setError(getAiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Structured default weekly breakdown
  const weeklySchedule = [
    {
      weekNumber: 1,
      title: 'Week 1: Data Structures & Core Java Fundamentals',
      focus: 'Arrays, HashMaps, Two Pointers & Big-O Notation',
      days: [
        { id: 'w1d1', day: 'Mon', task: 'Solve 2 LeetCode Medium Array problems (Two Pointers)', time: '45m' },
        { id: 'w1d2', day: 'Tue', task: 'Study Java Collections Framework & HashMap internal working', time: '45m' },
        { id: 'w1d3', day: 'Wed', task: 'Practice String manipulation & Slidng Window pattern', time: '45m' },
        { id: 'w1d4', day: 'Thu', task: 'Review OOP principles: Inheritance, Interfaces & Polymorphism', time: '45m' },
        { id: 'w1d5', day: 'Fri', task: 'Implement custom LinkedList & Binary Search Tree in Java', time: '60m' },
        { id: 'w1d6', day: 'Sat', task: 'Mock Technical Interview Drill: 3 timed DSA questions', time: '90m' },
        { id: 'w1d7', day: 'Sun', task: 'Weekly review & rest / backlog catchup', time: '30m' },
      ]
    },
    {
      weekNumber: 2,
      title: 'Week 2: Spring Boot Architecture & RESTful API Design',
      focus: 'Controllers, Services, Repositories & Spring Security',
      days: [
        { id: 'w2d1', day: 'Mon', task: 'Build Spring Boot REST API with DTO pattern and validation', time: '60m' },
        { id: 'w2d2', day: 'Tue', task: 'Configure Spring Data JPA & Hibernate entity mappings', time: '60m' },
        { id: 'w2d3', day: 'Wed', task: 'Implement JWT authentication & custom security filter chain', time: '75m' },
        { id: 'w2d4', day: 'Thu', task: 'Write unit tests using JUnit 5 & Mockito for Service layer', time: '45m' },
        { id: 'w2d5', day: 'Fri', task: 'Connect PostgreSQL database with Liquibase / Flyway migrations', time: '60m' },
        { id: 'w2d6', day: 'Sat', task: 'Mini-Project: Deploy REST backend to Cloud Container', time: '90m' },
        { id: 'w2d7', day: 'Sun', task: 'Weekly architectural retrospective & code cleanup', time: '30m' },
      ]
    },
    {
      weekNumber: 3,
      title: 'Week 3: System Design & Database Performance',
      focus: 'Database Indexing, Caching (Redis) & Microservices',
      days: [
        { id: 'w3d1', day: 'Mon', task: 'Study PostgreSQL B-Tree indexing, execution plans & EXPLAIN ANALYZE', time: '60m' },
        { id: 'w3d2', day: 'Tue', task: 'Integrate Redis caching layer for frequent database queries', time: '60m' },
        { id: 'w3d3', day: 'Wed', task: 'Learn System Design: Load Balancing, CDN & Database Sharding', time: '60m' },
        { id: 'w3d4', day: 'Thu', task: 'Design URL Shortener / Rate Limiter architecture on whiteboard', time: '60m' },
        { id: 'w3d5', day: 'Fri', task: 'Implement asynchronous messaging using RabbitMQ / Kafka', time: '75m' },
        { id: 'w3d6', day: 'Sat', task: 'System Design Mock Interview: Design E-Commerce Checkout', time: '90m' },
        { id: 'w3d7', day: 'Sun', task: 'Weekly assessment & progress synchronization', time: '30m' },
      ]
    }
  ];

  const totalTasksCount = weeklySchedule.reduce((acc, week) => acc + week.days.length, 0);
  const completedTasksCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedTasksCount / totalTasksCount) * 100) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-body pb-12">
      <CareerHubHeader />

      {/* Hero Banner */}
      <div className="bg-[#EFECE6] dark:bg-[#1E1E1E] border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#C85232]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85232]/10 border border-[#C85232]/25 text-[#C85232] font-semibold text-xs">
              <Calendar size={14} />
              <span>Time & Goal-Based Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] dark:text-white">
              Personalized Study Plan
            </h1>
            <p className="text-xs sm:text-sm text-[#5E5B56] dark:text-neutral-300 leading-relaxed">
              Daily time allocations, practice questions, and weekly milestone checklists engineered around your specific availability and target placement deadline.
            </p>
          </div>

          <div className="bg-[#EAE6DF] dark:bg-[#121212] p-4 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] shrink-0 w-full sm:w-auto text-center sm:text-right">
            <div className="text-[11px] text-[#5E5B56] dark:text-neutral-400 font-semibold mb-1">Study Streak & Progress</div>
            <div className="text-2xl font-black font-heading text-[#C85232] flex items-center justify-center sm:justify-end gap-1">
              <Flame size={20} className="text-amber-500 fill-amber-500" />
              <span>{completedTasksCount} / {totalTasksCount}</span>
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
              {progressPercent}% Tasks Completed
            </p>
          </div>
        </div>
      </div>

      {/* Time & Deadline Input Form */}
      <Card padding="normal" className="space-y-4">
        <h2 className="text-sm font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
          <Filter size={16} className="text-[#C85232]" />
          Configure Availability & Deadline Inputs
        </h2>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#111111] dark:text-neutral-300 mb-1.5">
              Available Daily Time
            </label>
            <select
              value={availableStudyTime}
              onChange={(e) => setAvailableStudyTime(e.target.value)}
              className="w-full bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232]"
            >
              <option value="1 hour / day">1 hour / day (Light)</option>
              <option value="2 hours / day">2 hours / day (Recommended)</option>
              <option value="3-4 hours / day">3-4 hours / day (Intensive)</option>
              <option value="Full-time Bootcamp">Full-time (6+ hours / day)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#111111] dark:text-neutral-300 mb-1.5">
              Target Career Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. SDE-1"
              className="w-full bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#111111] dark:text-neutral-300 mb-1.5">
              Current Proficiency
            </label>
            <select
              value={currentSkillLevel}
              onChange={(e) => setCurrentSkillLevel(e.target.value)}
              className="w-full bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232]"
            >
              <option value="Beginner">Beginner (Building Foundations)</option>
              <option value="Intermediate">Intermediate (Familiar with Core)</option>
              <option value="Advanced">Advanced (Interview Drill)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#111111] dark:text-neutral-300 mb-1.5">
              Placement Target Deadline
            </label>
            <select
              value={targetDeadline}
              onChange={(e) => setTargetDeadline(e.target.value)}
              className="w-full bg-[#FAF8F5] dark:bg-[#121212] border border-[rgba(0,0,0,0.12)] dark:border-[#333333] rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#C85232]"
            >
              <option value="2 Weeks">2 Weeks (Sprint)</option>
              <option value="4 Weeks">4 Weeks (Standard)</option>
              <option value="6 Weeks">6 Weeks (Balanced)</option>
              <option value="12 Weeks">12 Weeks (Comprehensive)</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#C85232] hover:bg-[#B34528] disabled:bg-neutral-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Curating Custom Schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Custom Study Plan</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-2">
          <ProgressBar
            value={progressPercent}
            label={`Overall Goal Progress (${targetDeadline} Deadline)`}
            showValue={true}
            colorClass="bg-[#C85232]"
          />
        </div>
      </Card>

      {loading && (
        <LoadingState message="Generating custom study schedule..." />
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={handleGenerate} />
      )}

      {!loading && !error && !currentPlan && (
        <EmptyState
          title="No Study Plan Found"
          description="Create a personalized weekly study schedule aligned with your interview deadline and available hours."
          actionLabel="Create Study Plan"
          onAction={handleGenerate}
        />
      )}

      {!loading && !error && currentPlan && (
        <>
          {/* Weekly Task Breakdown */}

      {/* Generated Plan Display Cards */}
      <div className="space-y-6">
        {weeklySchedule.map((week) => (
          <Card key={week.weekNumber} padding="normal" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A]">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#C85232]/10 text-[#C85232] font-extrabold text-[10px] uppercase tracking-wider border border-[#C85232]/20">
                  MILESTONE BLOCK
                </span>
                <h3 className="text-base font-bold font-heading text-[#111111] dark:text-white mt-1">
                  {week.title}
                </h3>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                  Core Focus: {week.focus}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Clock size={14} className="text-[#C85232]" />
                <span>{availableStudyTime} Allocation</span>
              </div>
            </div>

            {/* Daily Tasks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {week.days.map((dayItem) => {
                const isChecked = !!completedTasks[dayItem.id];

                return (
                  <div
                    key={dayItem.id}
                    onClick={() => toggleTask(dayItem.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                        : 'bg-[#FAF8F5] dark:bg-[#121212] border-[rgba(0,0,0,0.06)] dark:border-[#2A2A2A] hover:border-[#C85232]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-neutral-400 dark:border-neutral-600 bg-white dark:bg-[#1A1A1A]'
                      }`}
                    >
                      {isChecked && <Check size={14} strokeWidth={3} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1E1E1E] text-[10px] font-extrabold text-[#111111] dark:text-neutral-300 border border-[rgba(0,0,0,0.08)] dark:border-[#333333]">
                          {dayItem.day}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-500 flex items-center gap-1">
                          <Clock size={11} />
                          {dayItem.time}
                        </span>
                      </div>

                      <p className={`text-xs font-medium leading-relaxed ${
                        isChecked ? 'line-through text-neutral-500 dark:text-neutral-400' : 'text-[#111111] dark:text-white'
                      }`}>
                        {dayItem.task}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
        </>
      )}
    </div>
  );
}
