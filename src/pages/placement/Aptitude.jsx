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
  Calculator,
  Brain,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Sparkles,
  RotateCcw,
  BarChart3,
  ChevronRight,
  Target,
} from 'lucide-react';

// Fallback practice questions if API returns empty set
const FALLBACK_APTITUDE_QUESTIONS = [
  {
    id: 101,
    title: 'Time & Work - Efficiency Ratio',
    questionText:
      'A is twice as efficient as B and together they can finish a piece of work in 14 days. In how many days can A alone complete the work?',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    topic: 'Time and Work',
    options: [
      { id: 1, optionText: '21 days' },
      { id: 2, optionText: '28 days' },
      { id: 3, optionText: '18 days' },
      { id: 4, optionText: '35 days' },
    ],
    expectedAnswer: '21 days',
    explanation:
      'Efficiency ratio A : B = 2 : 1. Combined efficiency = 3 units/day. Total work = 3 × 14 = 42 units. Time taken by A alone = Total work / A\'s efficiency = 42 / 2 = 21 days.',
  },
  {
    id: 102,
    title: 'Percentages & Profit Loss',
    questionText:
      'A trader marks his goods at 25% above cost price and allows a discount of 10% for cash payment. What is his profit percentage?',
    difficulty: 'EASY',
    questionType: 'MCQ',
    topic: 'Profit and Loss',
    options: [
      { id: 5, optionText: '12.5%' },
      { id: 6, optionText: '15%' },
      { id: 7, optionText: '17.5%' },
      { id: 8, optionText: '20%' },
    ],
    expectedAnswer: '12.5%',
    explanation:
      'Let Cost Price (CP) = 100. Marked Price (MP) = 125. Selling Price (SP) after 10% discount = 125 - 12.5 = 112.5. Profit = SP - CP = 112.5 - 100 = 12.5%. Profit percentage = 12.5%.',
  },
  {
    id: 103,
    title: 'Logical Deduction & Syllogisms',
    questionText:
      'Statements: All engineers are logical. Some logical people are creative. Conclusions: I. Some engineers are creative. II. All logical people are engineers.',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    topic: 'Logical Reasoning',
    options: [
      { id: 9, optionText: 'Only Conclusion I follows' },
      { id: 10, optionText: 'Only Conclusion II follows' },
      { id: 11, optionText: 'Neither I nor II follows' },
      { id: 12, optionText: 'Both I and II follow' },
    ],
    expectedAnswer: 'Neither I nor II follows',
    explanation:
      'From "All A are B" and "Some B are C", no definite connection between A and C can be concluded. Thus, Conclusion I does not follow. Similarly, "All A are B" does not imply "All B are A", so Conclusion II does not follow.',
  },
  {
    id: 104,
    title: 'Speed, Distance & Trains',
    questionText:
      'A train 150 meters long passes a telegraph post in 12 seconds. Find the speed of the train in km/h.',
    difficulty: 'EASY',
    questionType: 'MCQ',
    topic: 'Speed & Distance',
    options: [
      { id: 13, optionText: '45 km/h' },
      { id: 14, optionText: '50 km/h' },
      { id: 15, optionText: '36 km/h' },
      { id: 16, optionText: '60 km/h' },
    ],
    expectedAnswer: '45 km/h',
    explanation:
      'Speed in m/s = Distance / Time = 150 / 12 = 12.5 m/s. Converting to km/h = 12.5 × (18 / 5) = 45 km/h.',
  },
  {
    id: 105,
    title: 'Probability & Combinations',
    questionText:
      'Two dice are thrown simultaneously. What is the probability of getting a sum equal to 8?',
    difficulty: 'HARD',
    questionType: 'MCQ',
    topic: 'Probability',
    options: [
      { id: 17, optionText: '5/36' },
      { id: 18, optionText: '1/6' },
      { id: 19, optionText: '7/36' },
      { id: 20, optionText: '1/9' },
    ],
    expectedAnswer: '5/36',
    explanation:
      'Total outcomes = 6 × 6 = 36. Outcomes with sum = 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> Total 5 favorable outcomes. Probability = 5/36.',
  },
];

export default function Aptitude() {
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All topics
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Question Interaction State
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null); // Feedback result object
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    correct: 0,
    totalTime: 0,
    history: [],
  });

  // Load Categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Questions when category or difficulty changes
  useEffect(() => {
    fetchQuestionsList();
  }, [selectedCategory, selectedDifficulty]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const aptitudeCategories = data.filter((c) => c.moduleType === 'APTITUDE');
      setCategories(aptitudeCategories);
    } catch (err) {
      console.warn('Could not fetch categories, using defaults', err);
      setCategories([
        { id: 1, name: 'Quantitative Aptitude', description: 'Numbers, algebra, time & work, probability' },
        { id: 2, name: 'Logical Reasoning', description: 'Syllogisms, blood relations, series, deduction' },
        { id: 3, name: 'Verbal Ability', description: 'Reading comprehension, grammar, vocabulary' },
        { id: 4, name: 'Data Interpretation', description: 'Charts, tables, graphs, analytical reasoning' },
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
        moduleType: 'APTITUDE',
        page: 0,
        size: 20,
      };
      if (selectedCategory) {
        params.categoryId = selectedCategory.id;
      }
      if (selectedDifficulty !== 'ALL') {
        params.difficulty = selectedDifficulty;
      }

      const res = await getQuestions(params);
      if (res && res.content && res.content.length > 0) {
        setQuestions(res.content);
      } else {
        // Filter fallbacks if needed
        let filtered = FALLBACK_APTITUDE_QUESTIONS;
        if (selectedDifficulty !== 'ALL') {
          filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
        }
        setQuestions(filtered.length > 0 ? filtered : FALLBACK_APTITUDE_QUESTIONS);
      }
    } catch (err) {
      console.warn('Using fallback questions due to API response:', err);
      setQuestions(FALLBACK_APTITUDE_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (optValue) => {
    if (attemptResult) return; // Prevent selection changes after submission
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

      // Update session statistics
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
      // Fallback local evaluation if backend offline or testing fallback questions
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
        explanation: currentQuestion.explanation || 'Detailed mathematical breakdown of the problem.',
        currentAccuracy: Math.round(((sessionStats.correct + (isCorrect ? 1 : 0)) / (sessionStats.attempted + 1)) * 100),
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
      // Session finished -> Navigate to Results Summary
      finishSession();
    }
  };

  const finishSession = () => {
    const categoryId = selectedCategory ? selectedCategory.id : 'all-aptitude';
    navigate(`/placement/results/${categoryId}`, {
      state: {
        moduleType: 'APTITUDE',
        categoryName: selectedCategory ? selectedCategory.name : 'Quantitative & Logical Aptitude',
        totalQuestions: sessionStats.attempted,
        correctCount: sessionStats.correct,
        accuracy: sessionStats.attempted > 0 ? Math.round((sessionStats.correct / sessionStats.attempted) * 100) : 0,
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
            <Badge variant="primary" icon={Calculator}>
              APTITUDE MODULE
            </Badge>
            <Badge variant="default" icon={Target}>
              Campus Placements
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] dark:text-white">
            Quantitative & Logical Aptitude Practice
          </h1>
          <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
            Master speed, accuracy, and problem-solving patterns tested by top tech recruiters.
          </p>
        </div>

        {sessionStats.attempted > 0 && (
          <div className="flex items-center gap-3 bg-[#EAE6DF] dark:bg-[#242424] px-4 py-2.5 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
            <BarChart3 size={18} className="text-[#C85232]" />
            <div className="text-xs">
              <span className="font-bold text-[#111111] dark:text-white">
                Session Accuracy:{' '}
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
            <BookOpen size={18} className="text-[#C85232]" /> Select Aptitude Topic
          </h2>

          {/* Difficulty Filter Badges */}
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

        {/* Category Cards */}
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
              <Badge variant="primary" icon={Brain}>
                ALL TOPICS
              </Badge>
              <Sparkles size={16} className="text-[#C85232]" />
            </div>
            <h3 className="font-bold text-base text-[#111111] dark:text-white font-heading">
              Comprehensive Mixed
            </h3>
            <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-1 line-clamp-2">
              Adaptive mix of Quant, Reasoning, and Verbal questions.
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
                    {cat.moduleType || 'APTITUDE'}
                  </Badge>
                  <Calculator size={16} className="text-[#C85232]" />
                </div>
                <h3 className="font-bold text-base text-[#111111] dark:text-white font-heading truncate">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-1 line-clamp-2">
                  {cat.description || 'Master key placement aptitude concepts.'}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Main Question Practice Interface */}
      <section className="mt-8">
        {loading ? (
          <LoadingState message="Loading questions for selected topic..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchQuestionsList} />
        ) : !currentQuestion ? (
          <Card className="text-center py-12">
            <HelpCircle size={40} className="mx-auto text-[#C85232] mb-3" />
            <h3 className="text-lg font-bold font-heading mb-1">No Questions Available</h3>
            <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mb-4">
              Try selecting a different topic or difficulty filter.
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
            {/* Top Progress Bar & Counter */}
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
                    Topic: {currentQuestion.topic}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-[#5E5B56] dark:text-[#A0A0A0]">
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-[#C85232]" /> Practice Session
                </span>
                <span className="font-bold text-[#111111] dark:text-white">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>
            </div>

            <ProgressBar
              value={currentIndex + 1}
              max={questions.length}
              showValue={false}
              height="h-1.5"
            />

            {/* Question Heading & Problem Text */}
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-[#111111] dark:text-white leading-snug">
                {currentQuestion.title || `Question ${currentIndex + 1}`}
              </h2>
              <div className="p-4 rounded-xl bg-[#EAE6DF]/60 dark:bg-[#242424]/60 border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)] text-base md:text-lg leading-relaxed text-[#111111] dark:text-[#E2E2E2]">
                {currentQuestion.questionText}
              </div>
            </div>

            {/* MCQ Options Cards Grid */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
                Select the Correct Option:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  currentQuestion.options.map((option, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                    const text = option.optionText || option;
                    const isSelected = selectedOption === text;

                    // Styling for options during feedback
                    let optionStyle = 'border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] bg-surface hover:border-[#C85232] text-[#111111] dark:text-white';
                    if (isSelected) {
                      optionStyle = 'border-2 border-[#C85232] bg-[#C85232]/10 text-[#111111] dark:text-white font-semibold';
                    }

                    if (attemptResult) {
                      const isCorrectAnswer =
                        text.trim().toLowerCase() === (attemptResult.correctAnswer || '').trim().toLowerCase();
                      if (isCorrectAnswer) {
                        optionStyle = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !attemptResult.isCorrect) {
                        optionStyle = 'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold';
                      } else {
                        optionStyle = 'opacity-50 border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#111111] dark:text-white';
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
                        {attemptResult && text.trim().toLowerCase() === (attemptResult.correctAnswer || '').trim().toLowerCase() && (
                          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                        {attemptResult && isSelected && !attemptResult.isCorrect && (
                          <XCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-rose-500">No options defined for this question.</p>
                )}
              </div>
            </div>

            {/* Action Bar: Submit or Next */}
            <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">
                {attemptResult
                  ? 'Answer submitted and evaluated by AI Engine.'
                  : 'Select your answer and submit for immediate AI feedback.'}
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

            {/* AI Answer Evaluation UX: Immediate Inline Feedback & Step-by-Step Explanation */}
            {attemptResult && (
              <div className="mt-6 space-y-4 animate-fadeIn">
                {/* Result Feedback Banner */}
                <div
                  className={`p-5 rounded-xl border flex items-start gap-4 ${
                    attemptResult.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  {attemptResult.isCorrect ? (
                    <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={28} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <h4 className="text-lg font-bold font-heading">
                      {attemptResult.isCorrect ? 'Correct Answer! (+100 Points)' : 'Incorrect Answer'}
                    </h4>
                    <p className="text-sm opacity-90">
                      {attemptResult.isCorrect
                        ? 'Great job! Your mathematical logic and speed are spot on.'
                        : `Correct answer is "${attemptResult.correctAnswer}". Review the AI breakdown below.`}
                    </p>
                  </div>
                </div>

                {/* Explanation Breakdown Card */}
                {attemptResult.explanation && (
                  <Card className="bg-[#EAE6DF]/80 dark:bg-[#242424]/80 border-amber-500/30 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm font-heading">
                      <Lightbulb size={18} /> AI Step-by-Step Explanation:
                    </div>
                    <p className="text-sm md:text-base leading-relaxed text-[#111111] dark:text-[#E2E2E2] whitespace-pre-line">
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
