import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  getCategories,
  getQuestions,
  submitAttempt,
} from '../../services/placementService';
import {
  Code,
  Terminal,
  Cpu,
  Database,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Sparkles,
  BarChart3,
  ChevronRight,
  Server,
  Layers,
} from 'lucide-react';

const FALLBACK_TECHNICAL_QUESTIONS = [
  {
    id: 201,
    title: 'Data Structures - Binary Tree Traversal',
    questionText:
      'Which traversal technique of a Binary Search Tree (BST) visits nodes in ascending sorted numerical order?',
    difficulty: 'EASY',
    questionType: 'MCQ',
    topic: 'Data Structures',
    options: [
      { id: 1, optionText: 'Pre-order Traversal (Root, Left, Right)' },
      { id: 2, optionText: 'In-order Traversal (Left, Root, Right)' },
      { id: 3, optionText: 'Post-order Traversal (Left, Right, Root)' },
      { id: 4, optionText: 'Level-order Traversal (BFS)' },
    ],
    expectedAnswer: 'In-order Traversal (Left, Root, Right)',
    explanation:
      'By definition of a Binary Search Tree, all left subtree keys are smaller than the root, and all right subtree keys are greater. Traversing Left -> Root -> Right (In-order) visits nodes in monotonically increasing sorted order.',
  },
  {
    id: 202,
    title: 'Operating Systems - Deadlock Conditions',
    questionText:
      'Which of the following is NOT one of Coffman\'s four necessary conditions for a deadlock to occur in an operating system?',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    topic: 'Operating Systems',
    options: [
      { id: 5, optionText: 'Mutual Exclusion' },
      { id: 6, optionText: 'Hold and Wait' },
      { id: 7, optionText: 'Preemption Allowed' },
      { id: 8, optionText: 'Circular Wait' },
    ],
    expectedAnswer: 'Preemption Allowed',
    explanation:
      'The four necessary Coffman conditions for deadlock are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption (resources cannot be forcibly taken away), and 4. Circular Wait. "Preemption Allowed" actually prevents deadlocks.',
  },
  {
    id: 203,
    title: 'Database Management Systems - ACID Properties',
    questionText:
      'In a database system, which ACID property ensures that once a transaction is committed, its changes survive system crashes and power failures?',
    difficulty: 'EASY',
    questionType: 'MCQ',
    topic: 'DBMS',
    options: [
      { id: 9, optionText: 'Atomicity' },
      { id: 10, optionText: 'Consistency' },
      { id: 11, optionText: 'Isolation' },
      { id: 12, optionText: 'Durability' },
    ],
    expectedAnswer: 'Durability',
    explanation:
      'Durability guarantees that committed transactions are permanently recorded in non-volatile storage (WAL/transaction logs) and will persist even during power outages or system failure.',
  },
  {
    id: 204,
    title: 'Computer Networks - OSI Model Layers',
    questionText:
      'At which layer of the OSI model do routers operate to inspect IP headers and perform packet routing across subnets?',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    topic: 'Computer Networks',
    options: [
      { id: 13, optionText: 'Data Link Layer (Layer 2)' },
      { id: 14, optionText: 'Network Layer (Layer 3)' },
      { id: 15, optionText: 'Transport Layer (Layer 4)' },
      { id: 16, optionText: 'Application Layer (Layer 7)' },
    ],
    expectedAnswer: 'Network Layer (Layer 3)',
    explanation:
      'Routers operate at Layer 3 (Network Layer) of the OSI reference model using IP addresses to route packets across disparate networks. Switches operate primarily at Layer 2 (Data Link Layer).',
  },
  {
    id: 205,
    title: 'Algorithm Analysis - Time Complexity',
    questionText:
      'What is the worst-case time complexity of standard QuickSort algorithm when the pivot chosen is consistently the smallest or largest element?',
    difficulty: 'HARD',
    questionType: 'MCQ',
    topic: 'Algorithms',
    options: [
      { id: 17, optionText: 'O(N log N)' },
      { id: 18, optionText: 'O(N^2)' },
      { id: 19, optionText: 'O(N)' },
      { id: 20, optionText: 'O(2^N)' },
    ],
    expectedAnswer: 'O(N^2)',
    explanation:
      'If the pivot is always the extreme element (e.g. sorted input with first element as pivot), partition splits array into N-1 and 0 elements. The recurrence relation T(N) = T(N-1) + O(N) yields worst-case time complexity O(N^2). Randomized pivoting avoids this.',
  },
];

export default function Technical() {
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All technical topics
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Question Interaction State
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    correct: 0,
    totalTime: 0,
    history: [],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuestionsList();
  }, [selectedCategory, selectedDifficulty]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const techCategories = data.filter(
        (c) => c.moduleType === 'TECHNICAL' || c.moduleType === 'DSA' || c.moduleType === 'CODING'
      );
      setCategories(techCategories);
    } catch (err) {
      console.warn('Could not fetch categories, using defaults', err);
      setCategories([
        { id: 10, name: 'Data Structures & Algorithms', description: 'Trees, Graphs, DP, Sorting, Searching' },
        { id: 11, name: 'Operating Systems', description: 'Processes, Threads, Memory, Deadlocks, Paging' },
        { id: 12, name: 'Database Systems (DBMS)', description: 'SQL, Normalization, Transactions, Indexing' },
        { id: 13, name: 'Computer Networks', description: 'TCP/IP, OSI Layers, DNS, HTTP, Subnetting' },
      ]);
    }
  };

  const fetchQuestionsList = async () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setSelectedOption('');
    setAttemptResult(null);
    setStartTime(Date.now());

    try {
      const params = {
        page: 0,
        size: 20,
      };
      if (selectedCategory) {
        params.categoryId = selectedCategory.id;
      } else {
        params.moduleType = 'TECHNICAL';
      }
      if (selectedDifficulty !== 'ALL') {
        params.difficulty = selectedDifficulty;
      }

      const res = await getQuestions(params);
      if (res && res.content && res.content.length > 0) {
        setQuestions(res.content);
      } else {
        let filtered = FALLBACK_TECHNICAL_QUESTIONS;
        if (selectedDifficulty !== 'ALL') {
          filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
        }
        setQuestions(filtered.length > 0 ? filtered : FALLBACK_TECHNICAL_QUESTIONS);
      }
    } catch (err) {
      console.warn('Using fallback technical questions:', err);
      setQuestions(FALLBACK_TECHNICAL_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (optValue) => {
    if (attemptResult) return;
    setSelectedOption(optValue);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentQuestion) return;

    setSubmitting(true);
    const timeTaken = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      const payload = {
        questionId: currentQuestion.id,
        selectedAnswer: selectedOption,
        timeTakenSeconds: timeTaken,
      };

      const result = await submitAttempt(payload);
      setAttemptResult(result);

      setSessionStats((prev) => ({
        attempted: prev.attempted + 1,
        correct: result.isCorrect ? prev.correct + 1 : prev.correct,
        totalTime: prev.totalTime + timeTaken,
        history: [
          ...prev.history,
          {
            questionId: currentQuestion.id,
            title: currentQuestion.title || currentQuestion.topic,
            isCorrect: result.isCorrect,
            timeTaken,
          },
        ],
      }));
    } catch (err) {
      console.warn('API submission failed, computing local feedback:', err);
      const isCorrect =
        selectedOption.trim().toLowerCase() ===
        (currentQuestion.expectedAnswer || '').trim().toLowerCase();

      const result = {
        attemptId: Date.now(),
        questionId: currentQuestion.id,
        isCorrect,
        score: isCorrect ? 100 : 0,
        selectedAnswer: selectedOption,
        correctAnswer: currentQuestion.expectedAnswer || 'Option 1',
        explanation:
          currentQuestion.explanation ||
          'In-depth technical analysis explaining core CS concepts.',
        currentAccuracy: Math.round(
          ((sessionStats.correct + (isCorrect ? 1 : 0)) / (sessionStats.attempted + 1)) * 100
        ),
      };

      setAttemptResult(result);
      setSessionStats((prev) => ({
        attempted: prev.attempted + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        totalTime: prev.totalTime + timeTaken,
        history: [
          ...prev.history,
          {
            questionId: currentQuestion.id,
            title: currentQuestion.title || currentQuestion.topic,
            isCorrect,
            timeTaken,
          },
        ],
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption('');
      setAttemptResult(null);
      setStartTime(Date.now());
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    const categoryId = selectedCategory ? selectedCategory.id : 'all-technical';
    navigate(`/placement/results/${categoryId}`, {
      state: {
        moduleType: 'TECHNICAL',
        categoryName: selectedCategory ? selectedCategory.name : 'Core Computer Science & Technical',
        totalQuestions: sessionStats.attempted,
        correctCount: sessionStats.correct,
        accuracy:
          sessionStats.attempted > 0
            ? Math.round((sessionStats.correct / sessionStats.attempted) * 100)
            : 0,
        totalTimeSeconds: sessionStats.totalTime,
        history: sessionStats.history,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary" icon={Code}>
              TECHNICAL & CS CORE
            </Badge>
            <Badge variant="default" icon={Cpu}>
              Placement Engineering
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] dark:text-white">
            Technical & Core CS Assessment Practice
          </h1>
          <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
            Deep dive into Data Structures, Algorithms, OS, DBMS, Networks, and System Design.
          </p>
        </div>

        {sessionStats.attempted > 0 && (
          <div className="flex items-center gap-3 bg-[#EAE6DF] dark:bg-[#242424] px-4 py-2.5 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
            <BarChart3 size={18} className="text-[#C85232]" />
            <div className="text-xs">
              <span className="font-bold text-[#111111] dark:text-white">
                Technical Score:{' '}
                {Math.round((sessionStats.correct / sessionStats.attempted) * 100)}%
              </span>
              <p className="text-[#5E5B56] dark:text-[#A0A0A0]">
                {sessionStats.correct} of {sessionStats.attempted} Correct
              </p>
            </div>
            <button
              onClick={finishSession}
              className="ml-2 text-xs font-semibold text-[#C85232] hover:underline flex items-center gap-1"
            >
              View Summary <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Topic / Category Selector Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold font-heading text-[#111111] dark:text-white flex items-center gap-2">
            <Terminal size={18} className="text-[#C85232]" /> Select Technical Subject
          </h2>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-[#C85232] text-white shadow-xs'
                    : 'bg-[#EAE6DF] dark:bg-[#242424] text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                {diff === 'ALL' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            hoverable
            onClick={() => setSelectedCategory(null)}
            className={`${
              selectedCategory === null
                ? 'ring-2 ring-[#C85232] bg-[#EAE6DF] dark:bg-[#242424]'
                : ''
            }`}
            padding="compact"
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="primary" icon={Layers}>
                ALL TECHNICAL
              </Badge>
              <Sparkles size={16} className="text-[#C85232]" />
            </div>
            <h3 className="font-bold text-base text-[#111111] dark:text-white font-heading">
              Comprehensive Technical
            </h3>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-1 line-clamp-2">
              Mixed questions from DSA, OS, DBMS, Computer Networks & Architecture.
            </p>
          </Card>

          {categories.map((cat) => {
            const isSelected = selectedCategory && selectedCategory.id === cat.id;
            return (
              <Card
                key={cat.id}
                hoverable
                onClick={() => setSelectedCategory(cat)}
                className={`${
                  isSelected
                    ? 'ring-2 ring-[#C85232] bg-[#EAE6DF] dark:bg-[#242424]'
                    : ''
                }`}
                padding="compact"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={isSelected ? 'terracotta' : 'default'}>
                    {cat.moduleType || 'TECHNICAL'}
                  </Badge>
                  <Cpu size={16} className="text-[#C85232]" />
                </div>
                <h3 className="font-bold text-base text-[#111111] dark:text-white font-heading truncate">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-1 line-clamp-2">
                  {cat.description || 'Core technical interview preparation topic.'}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Question Interface */}
      <section className="mt-8">
        {loading ? (
          <LoadingState message="Loading technical assessment questions..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchQuestionsList} />
        ) : !currentQuestion ? (
          <Card className="text-center py-12">
            <HelpCircle size={40} className="mx-auto text-[#C85232] mb-3" />
            <h3 className="text-lg font-bold font-heading mb-1">No Questions Available</h3>
            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mb-4">
              Try adjusting your category or difficulty filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedDifficulty('ALL');
              }}
              className="btn-terracotta inline-flex items-center gap-2 text-sm px-4 py-2"
            >
              Reset Filters
            </button>
          </Card>
        ) : (
          <Card className="space-y-6 shadow-xs border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)]">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    currentQuestion.difficulty === 'EASY'
                      ? 'easy'
                      : currentQuestion.difficulty === 'HARD'
                      ? 'hard'
                      : 'medium'
                  }
                >
                  {currentQuestion.difficulty || 'MEDIUM'}
                </Badge>
                {currentQuestion.topic && (
                  <span className="text-xs font-semibold text-[#5E5B56] dark:text-[#A0A0A0]">
                    Domain: {currentQuestion.topic}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-[#5E5B56] dark:text-[#A0A0A0]">
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-[#C85232]" /> Active Question
                </span>
                <span className="font-bold text-[#111111] dark:text-white">
                  {currentIndex + 1} of {questions.length}
                </span>
              </div>
            </div>

            <ProgressBar
              value={currentIndex + 1}
              max={questions.length}
              showValue={false}
              height="h-1.5"
            />

            {/* Title & Question text */}
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-[#111111] dark:text-white leading-snug">
                {currentQuestion.title || `Technical Question ${currentIndex + 1}`}
              </h2>
              <div className="p-4 rounded-xl bg-[#EAE6DF]/60 dark:bg-[#242424]/60 border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)] text-base md:text-lg leading-relaxed text-[#111111] dark:text-[#E2E2E2] font-sans">
                {currentQuestion.questionText}
              </div>
            </div>

            {/* MCQ Options */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
                Select the Correct Technical Answer:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  currentQuestion.options.map((option, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx);
                    const text = option.optionText || option;
                    const isSelected = selectedOption === text;

                    let optionStyle =
                      'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-surface hover:border-[#C85232] text-[#111111] dark:text-white';
                    if (isSelected) {
                      optionStyle =
                        'border-2 border-[#C85232] bg-[#C85232]/10 text-[#111111] dark:text-white font-semibold';
                    }

                    if (attemptResult) {
                      const isCorrectAnswer =
                        text.trim().toLowerCase() ===
                        (attemptResult.correctAnswer || '').trim().toLowerCase();
                      if (isCorrectAnswer) {
                        optionStyle =
                          'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !attemptResult.isCorrect) {
                        optionStyle =
                          'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold';
                      } else {
                        optionStyle =
                          'opacity-50 border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#111111] dark:text-white';
                      }
                    }

                    return (
                      <div
                        key={option.id || idx}
                        onClick={() => handleOptionSelect(text)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${optionStyle}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-[#C85232] text-white'
                              : 'bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white'
                          }`}
                        >
                          {optionLetter}
                        </div>
                        <span className="text-sm md:text-base flex-1 text-inherit">{text}</span>
                        {attemptResult &&
                          text.trim().toLowerCase() ===
                            (attemptResult.correctAnswer || '').trim().toLowerCase() && (
                            <CheckCircle2
                              size={18}
                              className="text-emerald-600 dark:text-emerald-400 shrink-0"
                            />
                          )}
                        {attemptResult && isSelected && !attemptResult.isCorrect && (
                          <XCircle
                            size={18}
                            className="text-rose-600 dark:text-rose-400 shrink-0"
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-rose-500">No options defined for this question.</p>
                )}
              </div>
            </div>

            {/* Submit / Next Action */}
            <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                {attemptResult
                  ? 'Technical answer verified by AI Engine.'
                  : 'Select option and click submit for instant evaluation.'}
              </div>

              {!attemptResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || submitting}
                  className="w-full sm:w-auto btn-terracotta inline-flex items-center justify-center gap-2 px-8 py-3 text-base"
                >
                  {submitting ? 'Evaluating...' : 'Submit Answer'}
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto btn-terracotta inline-flex items-center justify-center gap-2 px-8 py-3 text-base"
                >
                  {currentIndex + 1 < questions.length ? (
                    <>
                      Next Question <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      Complete & View Results <Sparkles size={18} />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* AI Answer Evaluation Feedback */}
            {attemptResult && (
              <div className="mt-6 space-y-4 animate-fadeIn">
                <div
                  className={`p-5 rounded-xl border flex items-start gap-4 ${
                    attemptResult.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  {attemptResult.isCorrect ? (
                    <CheckCircle2
                      size={28}
                      className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                    />
                  ) : (
                    <XCircle
                      size={28}
                      className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
                    />
                  )}

                  <div className="space-y-1">
                    <h4 className="text-lg font-bold font-heading">
                      {attemptResult.isCorrect
                        ? 'Correct Technical Logic!'
                        : 'Incorrect Selection'}
                    </h4>
                    <p className="text-sm opacity-90">
                      {attemptResult.isCorrect
                        ? 'Solid execution! Your core CS concept understanding is verified.'
                        : `Correct answer is "${attemptResult.correctAnswer}". Review the breakdown below.`}
                    </p>
                  </div>
                </div>

                {attemptResult.explanation && (
                  <Card className="bg-[#EAE6DF]/80 dark:bg-[#242424]/80 border-amber-500/30 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm font-heading">
                      <Lightbulb size={18} /> AI Technical Explanation:
                    </div>
                    <p className="text-sm md:text-base leading-relaxed text-[#111111] dark:text-[#E2E2E2] whitespace-pre-line font-mono text-xs md:text-sm">
                      {attemptResult.explanation}
                    </p>
                  </Card>
                )}
              </div>
            )}
          </Card>
        )}
      </section>
    </div>
  );
}
