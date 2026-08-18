import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getCompanies } from '../../services/placementService';
import {
  Building2,
  Search,
  Filter,
  Briefcase,
  Layers,
  Code,
  Calculator,
  Terminal,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const FALLBACK_COMPANIES = [
  {
    id: 'google',
    name: 'Google',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=120&auto=format&fit=crop&q=80',
    category: 'Product / Tier-1',
    tier: 'Tier 1 Product',
    difficulty: 'HARD',
    description: 'Focuses heavily on core Data Structures, Dynamic Programming, Graphs, System Design, and Googlyness leadership principles.',
    stats: {
      aptitudeCount: 45,
      technicalCount: 80,
      codingCount: 120,
      interviewCount: 35,
    },
    avgSalary: '₹22 - ₹45 LPA',
    rounds: ['Online Assessment (Coding)', 'Technical Phone Screen', '3x Onsite Coding/DSA', 'Googlyness & Leadership'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=120&auto=format&fit=crop&q=80',
    category: 'Product / Tier-1',
    tier: 'Tier 1 Product',
    difficulty: 'HARD',
    description: 'Evaluates candidates on 16 Leadership Principles alongside algorithmic problem-solving (Trees, Heaps, Sliding Window).',
    stats: {
      aptitudeCount: 50,
      technicalCount: 75,
      codingCount: 110,
      interviewCount: 40,
    },
    avgSalary: '₹18 - ₹32 LPA',
    rounds: ['Online Assessment (Debugging & Coding)', 'Work Simulation', '2x Technical Interviews', 'Bar Raiser Round'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?w=120&auto=format&fit=crop&q=80',
    category: 'Product / Tier-1',
    tier: 'Tier 1 Product',
    difficulty: 'MEDIUM',
    description: 'Emphasis on Strings, Arrays, Linked Lists, System Architecture, OOPs concepts, and collaborative technical problem solving.',
    stats: {
      aptitudeCount: 40,
      technicalCount: 65,
      codingCount: 95,
      interviewCount: 30,
    },
    avgSalary: '₹16 - ₹28 LPA',
    rounds: ['Online Coding Challenge', 'Technical Screening', '3x Technical & Design Rounds', 'AA (As Appropriate) Interview'],
  },
  {
    id: 'tcs',
    name: 'Tata Consultancy Services (TCS)',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
    category: 'Service / IT',
    tier: 'Mass Recruiter / IT',
    difficulty: 'EASY',
    description: 'Includes TCS NQT featuring quantitative aptitude, verbal ability, reasoning, foundation coding, and technical CS fundamentals.',
    stats: {
      aptitudeCount: 150,
      technicalCount: 120,
      codingCount: 40,
      interviewCount: 25,
    },
    avgSalary: '₹3.6 - ₹7.0 LPA',
    rounds: ['TCS NQT (Aptitude & Coding)', 'Technical Interview', 'HR & Managerial Round'],
  },
  {
    id: 'infosys',
    name: 'Infosys',
    logo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=120&auto=format&fit=crop&q=80',
    category: 'Service / IT',
    tier: 'Mass Recruiter / IT',
    difficulty: 'MEDIUM',
    description: 'Covers InfyTQ and Specialist Programmer tracks. High focus on pseudo-code, mathematical logic, DBMS, Python/Java.',
    stats: {
      aptitudeCount: 130,
      technicalCount: 100,
      codingCount: 55,
      interviewCount: 20,
    },
    avgSalary: '₹3.6 - ₹9.5 LPA',
    rounds: ['Online Qualifier (Aptitude & Logical)', 'Technical Coding Assessment', 'Technical + HR Interview'],
  },
  {
    id: 'accenture',
    name: 'Accenture',
    logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80',
    category: 'Service / IT',
    tier: 'Mass Recruiter / IT',
    difficulty: 'EASY',
    description: 'Cognitive assessment, technical MCQs (Pseudo code, Networking, Cloud), communication assessment, and structured HR round.',
    stats: {
      aptitudeCount: 140,
      technicalCount: 110,
      codingCount: 35,
      interviewCount: 22,
    },
    avgSalary: '₹4.5 - ₹8.5 LPA',
    rounds: ['Cognitive & Technical Assessment', 'Coding Test (2 Questions)', 'Communication Test', 'One-on-One Interview'],
  },
  {
    id: 'goldman-sachs',
    name: 'Goldman Sachs',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
    category: 'FinTech / Banking',
    tier: 'Tier 1 FinTech',
    difficulty: 'HARD',
    description: 'Rigorous quantitative math, advanced probability, algorithmic puzzles, C++/Java low-level programming, and finance domain logic.',
    stats: {
      aptitudeCount: 90,
      technicalCount: 85,
      codingCount: 80,
      interviewCount: 30,
    },
    avgSalary: '₹20 - ₹35 LPA',
    rounds: ['Aptitude & Math Assessment', 'Advanced Coding Test', '3-4 Technical Rounds', 'HR / Culture Fit'],
  },
  {
    id: 'wipro',
    name: 'Wipro',
    logo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=120&auto=format&fit=crop&q=80',
    category: 'Service / IT',
    tier: 'Mass Recruiter / IT',
    difficulty: 'EASY',
    description: 'NLTH (National Level Talent Hunt) focusing on Numerical Ability, Logical Ability, Written Communication, and fundamental coding.',
    stats: {
      aptitudeCount: 120,
      technicalCount: 90,
      codingCount: 30,
      interviewCount: 18,
    },
    avgSalary: '₹3.5 - ₹6.5 LPA',
    rounds: ['Aptitude & Written English Test', 'Online Coding Test', 'Technical & HR Combined Round'],
  },
];

export default function Companies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  useEffect(() => {
    fetchCompaniesList();
  }, []);

  const fetchCompaniesList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompanies();
      if (data && data.length > 0) {
        setCompanies(data);
      } else {
        setCompanies(FALLBACK_COMPANIES);
      }
    } catch (err) {
      console.warn('Using fallback companies list:', err);
      setCompanies(FALLBACK_COMPANIES);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (c.category && c.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesDifficulty =
      selectedDifficulty === 'ALL' || c.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary" icon={Building2}>
              COMPANY-SPECIFIC PREP
            </Badge>
            <Badge variant="default" icon={Trophy}>
              Placement Target Tracks
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] dark:text-white">
            Target Company Preparation Modules
          </h1>
          <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mt-1 max-w-2xl">
            Prepare with customized, company-curated practice sets for Aptitude, Technical MCQs, Coding Challenges, and HR Interview experiences.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#EAE6DF]/60 dark:bg-[#242424]/60 p-4 rounded-2xl border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5B56] dark:text-[#A0A0A0]" />
          <input
            type="text"
            placeholder="Search company or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-surface text-[#111111] dark:text-white border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#C85232]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface text-[#111111] dark:text-white text-xs rounded-xl px-3 py-2 border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#C85232]"
          >
            <option value="ALL">All Categories</option>
            <option value="Product">Product / Tier-1</option>
            <option value="Service">Service / IT Mass Recruiter</option>
            <option value="FinTech">FinTech / Banking</option>
          </select>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-[#C85232] text-white shadow-xs'
                    : 'bg-surface text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]'
                }`}
              >
                {diff === 'ALL' ? 'All Level' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <LoadingState message="Fetching company preparation tracks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCompaniesList} />
      ) : filteredCompanies.length === 0 ? (
        <Card className="text-center py-12">
          <HelpCircle size={40} className="mx-auto text-[#C85232] mb-3" />
          <h3 className="text-lg font-bold font-heading mb-1">No Companies Found</h3>
          <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mb-4">
            Try adjusting your search query or company type filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedDifficulty('ALL');
            }}
            className="btn-terracotta inline-flex items-center gap-2 text-sm px-4 py-2"
          >
            Reset Filters
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompanies.map((comp) => (
            <Card
              key={comp.id}
              hoverable
              className="p-6 space-y-5 flex flex-col justify-between border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)]"
            >
              <div className="space-y-4">
                {/* Header Row: Logo & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#EAE6DF] dark:bg-[#242424] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)] overflow-hidden flex items-center justify-center shrink-0">
                      {comp.logo ? (
                        <img
                          src={comp.logo}
                          alt={comp.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 size={24} className="text-[#C85232]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white">
                        {comp.name}
                      </h3>
                      <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] font-medium">
                        {comp.category || 'Technology Leader'}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      comp.difficulty === 'EASY'
                        ? 'easy'
                        : comp.difficulty === 'HARD'
                        ? 'hard'
                        : 'medium'
                    }
                  >
                    {comp.difficulty || 'MEDIUM'}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] leading-relaxed line-clamp-2">
                  {comp.description}
                </p>

                {/* Package / Salary Tag if available */}
                {comp.avgSalary && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-[#C85232]/10 text-[#C85232]">
                    <span>Avg Package:</span>
                    <span>{comp.avgSalary}</span>
                  </div>
                )}

                {/* Question Counts Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)] text-center">
                  <div className="bg-[#EAE6DF]/50 dark:bg-[#242424]/50 p-2 rounded-lg">
                    <p className="text-[10px] text-[#5E5B56] dark:text-[#A0A0A0] font-semibold">Aptitude</p>
                    <p className="text-sm font-extrabold text-[#111111] dark:text-white">
                      {comp.stats?.aptitudeCount || comp.aptitudeCount || 30}+
                    </p>
                  </div>
                  <div className="bg-[#EAE6DF]/50 dark:bg-[#242424]/50 p-2 rounded-lg">
                    <p className="text-[10px] text-[#5E5B56] dark:text-[#A0A0A0] font-semibold">Technical</p>
                    <p className="text-sm font-extrabold text-[#111111] dark:text-white">
                      {comp.stats?.technicalCount || comp.technicalCount || 45}+
                    </p>
                  </div>
                  <div className="bg-[#EAE6DF]/50 dark:bg-[#242424]/50 p-2 rounded-lg">
                    <p className="text-[10px] text-[#5E5B56] dark:text-[#A0A0A0] font-semibold">Coding</p>
                    <p className="text-sm font-extrabold text-[#111111] dark:text-white">
                      {comp.stats?.codingCount || comp.codingCount || 50}+
                    </p>
                  </div>
                  <div className="bg-[#EAE6DF]/50 dark:bg-[#242424]/50 p-2 rounded-lg">
                    <p className="text-[10px] text-[#5E5B56] dark:text-[#A0A0A0] font-semibold">Interview</p>
                    <p className="text-sm font-extrabold text-[#111111] dark:text-white">
                      {comp.stats?.interviewCount || comp.interviewCount || 20}+
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-3 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                <span className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                  Full Placement Suite
                </span>
                <Link
                  to={`/placement/companies/${comp.id}`}
                  className="btn-terracotta inline-flex items-center gap-1.5 text-xs px-4 py-2"
                >
                  Start Prep Track <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
