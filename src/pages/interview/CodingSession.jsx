import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Code2,
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
  RotateCcw,
  LogOut,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Cpu,
  FileCode,
  Zap,
  Check,
  AlertTriangle,
  Lightbulb,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  getInterview,
  startInterview,
  submitCodingAnswer,
  completeInterview
} from '../../services/interviewService';
import { getAiErrorMessage } from '../../utils/aiErrorUtils';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export default function CodingSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Editor State
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [activeLeftTab, setActiveLeftTab] = useState('problem'); // 'problem' | 'hints'
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // 'testcases' | 'feedback'

  // Submission / Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [networkError, setNetworkError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Timer & UI modals
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [consoleExpanded, setConsoleExpanded] = useState(true);

  const textareaRef = useRef(null);

  // Timer countdown / elapsed
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch Interview & Question
  useEffect(() => {
    let isMounted = true;
    setLoadingInitial(true);
    setNetworkError('');

    const initCodingSession = async () => {
      try {
        const interviewData = await getInterview(id);
        if (!isMounted) return;

        setInterview(interviewData);
        setTotalQuestions(interviewData.questionCount || 5);

        if (interviewData.status === 'COMPLETED') {
          navigate(`/interview/report/${id}`);
          return;
        }

        const qData = await startInterview(id);
        if (!isMounted) return;

        setCurrentQuestion(qData);
        setQuestionIndex(qData.questionOrder || 1);

        if (qData.starterCode) {
          setCode(qData.starterCode);
        } else {
          setCode(getLanguageTemplate('javascript'));
        }
      } catch (err) {
        console.error('Failed to load coding session:', err);
        if (isMounted) {
          setNetworkError(
            err.response?.data?.message || 'Failed to load coding interview session.'
          );
        }
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    };

    initCodingSession();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // Language templates helper
  const getLanguageTemplate = (lang) => {
    switch (lang) {
      case 'python':
        return 'def solution(nums, target):\n    # Write your optimal algorithm here\n    pass\n';
      case 'java':
        return 'class Solution {\n    public int[] solution(int[] nums, int target) {\n        // Implementation\n        return new int[]{};\n    }\n}\n';
      case 'cpp':
        return '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        return {};\n    }\n};\n';
      case 'typescript':
        return 'function solution(nums: number[], target: number): number[] {\n  // Implementation here\n  return [];\n}\n';
      case 'javascript':
      default:
        return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction solution(nums, target) {\n  // Write your solution here\n  return [];\n}\n';
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    if (!code || code.trim() === '' || code.includes('function solution') || code.includes('def solution')) {
      setCode(getLanguageTemplate(lang));
    }
  };

  // Submit Code Handler
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setValidationError('Please write your solution before running tests.');
      return;
    }

    setValidationError('');
    setNetworkError('');
    setIsRunning(true);
    setConsoleExpanded(true);

    try {
      const response = await submitCodingAnswer(id, {
        questionId: currentQuestion?.id,
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response);
      setActiveConsoleTab('testcases');
    } catch (err) {
      console.error('Coding submission failed:', err);
      setNetworkError(getAiErrorMessage(err));
    } finally {
      setIsRunning(false);
    }
  };

  const handleProceedNext = async () => {
    if (submitResult?.readyForCompletion || !submitResult?.nextQuestion) {
      try {
        await completeInterview(id);
      } catch (e) {
        // ignore error and navigate
      }
      navigate(`/interview/report/${id}`);
    } else if (submitResult?.nextQuestion) {
      const nextQ = submitResult.nextQuestion;
      setCurrentQuestion(nextQ);
      setQuestionIndex(nextQ.questionOrder || questionIndex + 1);
      setSubmitResult(null);
      if (nextQ.starterCode) {
        setCode(nextQ.starterCode);
      } else {
        setCode(getLanguageTemplate(selectedLanguage));
      }
    }
  };

  // Line count for code editor margin
  const lineCount = code ? code.split('\n').length : 1;

  if (loadingInitial) {
    return <LoadingState message="Loading Coding IDE..." />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E4E4E7] flex flex-col font-body selection:bg-[#C85232]/30 selection:text-white overflow-hidden h-screen">
      {/* HEADER */}
      <header className="h-14 bg-[#121215] border-b border-neutral-800/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C85232]/15 border border-[#C85232]/30 flex items-center justify-center text-[#C85232] shrink-0">
            <Code2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs md:text-sm font-bold font-heading text-white truncate max-w-xs">
                {interview?.targetRole || 'Coding Challenge'}
              </h1>
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 font-mono border border-neutral-700">
                Problem {questionIndex}/{totalQuestions}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Timer & Progress */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-mono">
            <Clock size={14} className="text-[#C85232]" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExitModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition-all"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Exit Session</span>
          </button>
        </div>
      </header>

      {/* SPLIT LAYOUT WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL: PROBLEM DETAILS (5 cols) */}
        <div className="lg:col-span-5 bg-[#121215] border-r border-neutral-800/80 flex flex-col overflow-hidden h-full">
          {/* Left Panel Nav Tabs */}
          <div className="flex items-center bg-[#0E0E10] border-b border-neutral-800 px-3 text-xs shrink-0">
            <button
              onClick={() => setActiveLeftTab('problem')}
              className={`py-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
                activeLeftTab === 'problem'
                  ? 'border-[#C85232] text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileCode size={14} /> Description
            </button>
            <button
              onClick={() => setActiveLeftTab('hints')}
              className={`py-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
                activeLeftTab === 'hints'
                  ? 'border-[#C85232] text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Lightbulb size={14} className="text-amber-400" /> Hints & Concepts
            </button>
          </div>

          {/* Left Panel Scroll Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeLeftTab === 'problem' ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C85232]/20 text-[#C85232] border border-[#C85232]/30 uppercase">
                      {currentQuestion?.difficulty || 'HARD'}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      Question #{questionIndex}
                    </span>
                  </div>
                  <h2 className="text-base font-bold font-heading text-white leading-snug">
                    {currentQuestion?.questionText || 'Implement algorithmic solution'}
                  </h2>
                </div>

                {/* Problem Description Body */}
                <div className="text-xs text-neutral-300 leading-relaxed space-y-3 bg-[#0E0E10] p-4 rounded-xl border border-neutral-800">
                  <p className="whitespace-pre-line">
                    {currentQuestion?.problemDescription ||
                      currentQuestion?.questionText ||
                      'Write an efficient function to process inputs according to constraints. Ensure time complexity is optimal.'}
                  </p>
                </div>

                {/* Concepts & Topics */}
                {currentQuestion?.expectedConcepts && (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      Key Concepts
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {currentQuestion.expectedConcepts.split(',').map((concept, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded bg-neutral-800 text-[11px] font-mono text-neutral-300 border border-neutral-700"
                        >
                          {concept.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example Test Case Inputs */}
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Sample Test Cases
                  </h3>
                  <div className="bg-[#0E0E10] border border-neutral-800 rounded-xl p-3 font-mono text-xs space-y-2">
                    <div className="text-neutral-400 text-[10px] font-sans font-bold">Example 1:</div>
                    <div className="text-neutral-300">
                      <span className="text-neutral-500">Input:</span> nums = [2,7,11,15], target = 9
                    </div>
                    <div className="text-emerald-400">
                      <span className="text-neutral-500">Output:</span> [0,1]
                    </div>
                    <div className="text-neutral-400 text-[11px] pt-1 border-t border-neutral-800/80 font-sans">
                      Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 text-xs text-neutral-300">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <Lightbulb size={16} /> Technical Hint
                  </div>
                  <p className="leading-relaxed">
                    Consider using a HashMap or Hash Table to store previously visited elements to achieve an O(N) time complexity solution rather than brute force O(N^2).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Cpu size={16} className="text-[#C85232]" /> Evaluation Criteria
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 leading-relaxed text-[11px]">
                    <li>Correctness across all hidden test edge cases.</li>
                    <li>Time and Space Complexity optimization.</li>
                    <li>Code structure, variable naming, and clean readability.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CODE EDITOR & CONSOLE (7 cols) */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden bg-[#0A0A0C] h-full">
          {/* Editor Header Toolbar */}
          <div className="h-10 bg-[#121215] border-b border-neutral-800 px-4 flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <Terminal size={14} className="text-[#C85232]" />
              <span className="text-neutral-300 font-bold">Solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'cpp' ? 'cpp' : 'js'}</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="bg-neutral-900 text-neutral-200 text-xs px-2 py-1 rounded border border-neutral-700 focus:outline-none focus:border-[#C85232]"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="typescript">TypeScript</option>
              </select>

              <button
                onClick={() => setCode(getLanguageTemplate(selectedLanguage))}
                title="Reset code template"
                className="text-neutral-400 hover:text-white p-1"
              >
                <RotateCcw size={14} />
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isRunning}
                className="px-4 py-1.5 rounded bg-[#C85232] hover:bg-[#b04328] text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play size={12} fill="currentColor" />
                    <span>Run & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
              <span>{validationError}</span>
              <button onClick={() => setValidationError('')} className="text-amber-400 hover:text-white">✕</button>
            </div>
          )}

          {networkError && (
            <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-xs text-red-300 flex items-center justify-between">
              <span>{networkError}</span>
              <button onClick={() => setNetworkError('')} className="text-red-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Code Editor Body */}
          <div className="flex-1 relative flex overflow-hidden bg-[#0A0A0C]">
            {/* Line Numbers */}
            <div className="w-10 bg-[#0E0E10] text-neutral-600 font-mono text-xs py-3 select-none text-right pr-2 border-r border-neutral-800 shrink-0">
              {Array.from({ length: Math.max(lineCount, 20) }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Text Area */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your code solution here..."
              className="flex-1 bg-transparent text-emerald-400 font-mono text-xs p-3 focus:outline-none resize-none leading-6 border-none whitespace-pre overflow-auto"
              spellCheck="false"
            />
          </div>

          {/* CONSOLE / TEST RESULTS DRAWER */}
          <div
            className={`border-t border-neutral-800 bg-[#121215] flex flex-col transition-all duration-300 ${
              consoleExpanded ? 'h-64' : 'h-9'
            }`}
          >
            {/* Console Drawer Bar */}
            <div className="h-9 bg-[#0E0E10] px-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-4 text-xs">
                <button
                  onClick={() => {
                    setConsoleExpanded(true);
                    setActiveConsoleTab('testcases');
                  }}
                  className={`font-semibold flex items-center gap-1.5 ${
                    activeConsoleTab === 'testcases' && consoleExpanded
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Terminal size={14} /> Test Results
                  {submitResult && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        submitResult.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {submitResult.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  )}
                </button>

                {submitResult?.qualityComment && (
                  <button
                    onClick={() => {
                      setConsoleExpanded(true);
                      setActiveConsoleTab('feedback');
                    }}
                    className={`font-semibold flex items-center gap-1.5 ${
                      activeConsoleTab === 'feedback' && consoleExpanded
                        ? 'text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Sparkles size={14} className="text-[#C85232]" /> AI Code Review
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConsoleExpanded(!consoleExpanded)}
                  className="text-neutral-400 hover:text-white"
                >
                  {consoleExpanded ? <ChevronDown size={16} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>

            {/* Console Body Content */}
            {consoleExpanded && (
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-neutral-300">
                {!submitResult && !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-center font-sans space-y-1">
                    <Terminal size={24} className="opacity-40" />
                    <p className="text-xs">Run your solution to view test case execution outputs.</p>
                  </div>
                )}

                {isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 font-sans space-y-2">
                    <div className="w-6 h-6 border-2 border-[#C85232] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs">Executing test cases in isolated runtime sandbox...</p>
                  </div>
                )}

                {submitResult && activeConsoleTab === 'testcases' && (
                  <div className="space-y-4">
                    {/* Metrics Banner */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E0E10] border border-neutral-800 font-sans">
                      <div className="flex items-center gap-3">
                        {submitResult.passed ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <CheckCircle2 size={18} /> All Test Cases Passed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-400 font-bold">
                            <XCircle size={18} /> Test Cases Failed
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono">
                        {submitResult.score !== undefined && (
                          <span>Score: <strong className="text-white">{submitResult.score}/100</strong></span>
                        )}
                        {submitResult.timeComplexity && (
                          <span>Time: <strong className="text-[#C85232]">O({submitResult.timeComplexity})</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Test Cases Breakdown */}
                    {submitResult.testCaseResults && submitResult.testCaseResults.length > 0 ? (
                      <div className="space-y-3">
                        {submitResult.testCaseResults.map((tc, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border ${
                              tc.passed
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-red-500/5 border-red-500/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-neutral-200">
                                Test Case #{idx + 1}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tc.passed
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {tc.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                              <div className="bg-[#0E0E10] p-2 rounded border border-neutral-800">
                                <span className="text-neutral-500 block text-[10px]">Input:</span>
                                <code className="text-neutral-300">{tc.input || 'N/A'}</code>
                              </div>
                              <div className="bg-[#0E0E10] p-2 rounded border border-neutral-800">
                                <span className="text-neutral-500 block text-[10px]">Expected Output:</span>
                                <code className="text-emerald-400">{tc.expectedOutput || 'N/A'}</code>
                              </div>
                            </div>

                            {tc.actualOutput && (
                              <div className="mt-2 bg-[#0E0E10] p-2 rounded border border-neutral-800 text-[11px]">
                                <span className="text-neutral-500 block text-[10px]">Your Output:</span>
                                <code className={tc.passed ? 'text-emerald-400' : 'text-red-400'}>
                                  {tc.actualOutput}
                                </code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-400 text-xs">Test cases evaluated successfully.</p>
                    )}

                    {/* Proceed CTA Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleProceedNext}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C85232] hover:bg-[#b04328] flex items-center gap-2 shadow-lg transition-all"
                      >
                        <span>
                          {submitResult?.readyForCompletion || !submitResult?.nextQuestion
                            ? 'Finish & View Performance Report'
                            : 'Proceed to Next Question'}
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {submitResult && activeConsoleTab === 'feedback' && (
                  <div className="space-y-3 font-sans">
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                      <div className="font-bold text-[#C85232] flex items-center gap-1.5 text-xs">
                        <Sparkles size={16} /> AI Code Analysis & Quality Review
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {submitResult.qualityComment}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EXIT MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-neutral-200">
              <LogOut size={24} className="text-[#C85232]" />
              <h3 className="text-base font-bold text-white font-heading">
                End Coding Session?
              </h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to leave? Your code in the editor will be saved, and your progress evaluated.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              >
                Continue Coding
              </button>
              <button
                onClick={async () => {
                  try {
                    await completeInterview(id);
                  } catch (e) {}
                  navigate(`/interview/report/${id}`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C85232] text-white hover:bg-[#b04328]"
              >
                Exit & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
