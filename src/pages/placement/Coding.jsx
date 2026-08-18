import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getQuestions } from '../../services/placementService';
import {
  Code,
  Terminal,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Layers,
  HelpCircle,
  Cpu,
} from 'lucide-react';

const FALLBACK_CODING_LIST = [
  {
    id: '301',
    title: 'Two Sum',
    difficulty: 'EASY',
    topic: 'Arrays & Hashing',
    moduleType: 'CODING',
    description: 'Find two indices in an array that sum to a given target number.',
    acceptanceRate: '88%',
  },
  {
    id: '302',
    title: 'Valid Anagram',
    difficulty: 'EASY',
    topic: 'Strings & Hash Table',
    moduleType: 'CODING',
    description: 'Determine if string t is a valid anagram of string s.',
    acceptanceRate: '92%',
  },
  {
    id: '303',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM',
    topic: 'Sliding Window & Strings',
    moduleType: 'CODING',
    description: 'Find the length of the longest substring without repeating characters.',
    acceptanceRate: '76%',
  },
  {
    id: '304',
    title: 'Reverse a Linked List',
    difficulty: 'EASY',
    topic: 'Linked Lists',
    moduleType: 'CODING',
    description: 'Given the head of a singly linked list, reverse the list and return its head.',
    acceptanceRate: '85%',
  },
  {
    id: '305',
    title: 'Container With Most Water',
    difficulty: 'MEDIUM',
    topic: 'Two Pointers',
    moduleType: 'CODING',
    description: 'Find two lines that together with x-axis form a container holding maximum water.',
    acceptanceRate: '68%',
  },
  {
    id: '306',
    title: 'LRU Cache Design',
    difficulty: 'HARD',
    topic: 'System Design & Hash Map',
    moduleType: 'CODING',
    description: 'Design and implement a Least Recently Used (LRU) cache data structure.',
    acceptanceRate: '54%',
  },
];

export default function Coding() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProblems();
  }, [selectedDifficulty]);

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        moduleType: 'CODING',
        page: 0,
        size: 30,
      };
      if (selectedDifficulty !== 'ALL') {
        params.difficulty = selectedDifficulty;
      }

      const res = await getQuestions(params);
      if (res && res.content && res.content.length > 0) {
        setProblems(res.content);
      } else {
        let filtered = FALLBACK_CODING_LIST;
        if (selectedDifficulty !== 'ALL') {
          filtered = filtered.filter((p) => p.difficulty === selectedDifficulty);
        }
        setProblems(filtered);
      }
    } catch (err) {
      console.warn('Using fallback coding problems list:', err);
      let filtered = FALLBACK_CODING_LIST;
      if (selectedDifficulty !== 'ALL') {
        filtered = filtered.filter((p) => p.difficulty === selectedDifficulty);
      }
      setProblems(filtered);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((prob) => {
    const matchesSearch =
      prob.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prob.topic && prob.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopic === 'ALL' || prob.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const topicsList = ['ALL', ...new Set(problems.map((p) => p.topic).filter(Boolean))];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary" icon={Code}>
              CODING PRACTICE
            </Badge>
            <Badge variant="default" icon={Terminal}>
              Hands-on Assessment
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] dark:text-white">
            Coding Assessment & Problem Solving
          </h1>
          <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
            Solve algorithmic coding challenges with real-time test case evaluation in an interactive IDE.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#EAE6DF]/60 dark:bg-[#242424]/60 p-4 rounded-2xl border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5B56] dark:text-[#A0A0A0]" />
          <input
            type="text"
            placeholder="Search problems or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-surface text-[#111111] dark:text-white border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#C85232]"
          />
        </div>

        {/* Difficulty Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedDifficulty === diff
                  ? 'bg-[#C85232] text-white shadow-xs'
                  : 'bg-surface text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]'
              }`}
            >
              {diff === 'ALL' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List Cards Grid */}
      {loading ? (
        <LoadingState message="Loading coding problems..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProblems} />
      ) : filteredProblems.length === 0 ? (
        <Card className="text-center py-12">
          <HelpCircle size={40} className="mx-auto text-[#C85232] mb-3" />
          <h3 className="text-lg font-bold font-heading mb-1">No Problems Found</h3>
          <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mb-4">
            Try adjusting your search query or difficulty filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('ALL');
            }}
            className="btn-terracotta inline-flex items-center gap-2 text-sm px-4 py-2"
          >
            Reset Filters
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProblems.map((problem) => (
            <Card
              key={problem.id}
              hoverable
              className="p-6 space-y-4 flex flex-col justify-between border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      problem.difficulty === 'EASY'
                        ? 'easy'
                        : problem.difficulty === 'HARD'
                        ? 'hard'
                        : 'medium'
                    }
                  >
                    {problem.difficulty || 'EASY'}
                  </Badge>

                  {problem.topic && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EAE6DF] dark:bg-[#242424] text-[#5E5B56] dark:text-[#A0A0A0]">
                      {problem.topic}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white line-clamp-1">
                  {problem.title}
                </h3>

                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed line-clamp-3">
                  {problem.description || problem.questionText}
                </p>
              </div>

              <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                <span className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                  Pass Rate: {problem.acceptanceRate || '82%'}
                </span>

                <Link
                  to={`/placement/coding/${problem.id}`}
                  className="btn-terracotta inline-flex items-center gap-1.5 text-xs px-3.5 py-2"
                >
                  Solve Problem <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
