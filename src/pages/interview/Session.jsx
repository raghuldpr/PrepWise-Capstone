import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Code2,
  UserCheck,
  Terminal,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  ShieldAlert,
  RefreshCw,
  SkipForward,
  LogOut,
  ChevronRight,
  Send,
  Cpu,
  FileCode,
  RotateCcw,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import {
  getInterview,
  startInterview,
  answerQuestion,
  submitCodingAnswer,
  completeInterview
} from '../../services/interviewService';
import { getAiErrorMessage } from '../../utils/aiErrorUtils';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export default function Session() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Response inputs
  const [answerText, setAnswerText] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  // Loading & evaluation states
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [completingSession, setCompletingSession] = useState(false);

  // Results state for coding questions
  const [codingResult, setCodingResult] = useState(null);

  // Error and validation inline states
  const [networkError, setNetworkError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Audio / Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(true);

  // Elapsed time counter
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // 1. Timer setup
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format timer string (MM:SS)
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setAnswerText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    } else {
      setRecordingSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // 3. Load Interview Session & Initial Question
  useEffect(() => {
    let isMounted = true;
    setLoadingInitial(true);
    setNetworkError('');

    const initSession = async () => {
      try {
        const data = await getInterview(id);
        if (!isMounted) return;

        setInterview(data);
        setTotalQuestions(data.questionCount || 5);

        if (data.status === 'COMPLETED') {
          navigate(`/interview/report/${id}`);
          return;
        }

        // Fetch or start question
        const qData = await startInterview(id);
        if (!isMounted) return;

        setCurrentQuestion(qData);
        setQuestionIndex(qData.questionOrder || 1);

        if (qData.starterCode) {
          setCodeAnswer(qData.starterCode);
        } else {
          setCodeAnswer('// Write your solution here\nfunction solution() {\n  // Implementation\n}');
        }

        // Speak question if AI speech is enabled
        if (!speechMuted && qData.questionText) {
          speakText(qData.questionText);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
        if (isMounted) {
          setNetworkError(getAiErrorMessage(err));
        }
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    };

    initSession();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // Speak AI text via Web Speech Synthesis
  const speakText = (text) => {
    if (!synthRef.current || speechMuted) return;
    try {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis failed:', e);
      setIsSpeaking(false);
    }
  };

  const toggleSpeechMute = () => {
    if (!speechMuted) {
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeaking(false);
    } else if (currentQuestion?.questionText) {
      speakText(currentQuestion.questionText);
    }
    setSpeechMuted(!speechMuted);
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setValidationError('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Failed to start recording:', e);
      }
    }
  };

  // Handle Standard Answer Submission
  const handleSubmitAnswer = async (skipped = false) => {
    setValidationError('');
    setNetworkError('');

    const isCodingQuestion =
      currentQuestion?.questionType === 'CODING' || currentQuestion?.starterCode;

    if (!skipped) {
      if (isCodingQuestion && !codeAnswer.trim()) {
        setValidationError('Please provide code in the editor before submitting.');
        return;
      }
      if (!isCodingQuestion && !answerText.trim()) {
        setValidationError(
          'Please enter your response before submitting, or click "Skip Question" to pass.'
        );
        return;
      }
    }

    setEvaluating(true);
    setCodingResult(null);

    try {
      let response;
      if (isCodingQuestion) {
        response = await submitCodingAnswer(id, {
          questionId: currentQuestion.id,
          code: skipped ? '// Skipped question' : codeAnswer,
          language: selectedLanguage
        });
        if (response.testCaseResults) {
          setCodingResult(response);
        }
      } else {
        response = await answerQuestion(id, {
          questionId: currentQuestion.id,
          answerText: skipped ? 'SKIP_QUESTION' : answerText.trim()
        });
      }

      // Check if session completed or next question is ready
      if (response.readyForCompletion || !response.nextQuestion) {
        await handleFinishSession();
      } else {
        // Transition to next question
        setTimeout(() => {
          const nextQ = response.nextQuestion;
          setCurrentQuestion(nextQ);
          setQuestionIndex(nextQ.questionOrder || questionIndex + 1);
          setAnswerText('');
          if (nextQ.starterCode) {
            setCodeAnswer(nextQ.starterCode);
          } else {
            setCodeAnswer('// Write your solution here\nfunction solution() {\n  \n}');
          }
          setEvaluating(false);

          if (!speechMuted && nextQ.questionText) {
            speakText(nextQ.questionText);
          }
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setEvaluating(false);
      setNetworkError(getAiErrorMessage(err));
    }
  };

  // Complete Interview and Redirect to Report
  const handleFinishSession = async () => {
    setCompletingSession(true);
    try {
      await completeInterview(id);
      navigate(`/interview/report/${id}`);
    } catch (err) {
      console.error('Failed to complete interview:', err);
      // Navigate anyway so user isn't stuck
      navigate(`/interview/report/${id}`);
    }
  };

  // Loading initial state
  if (loadingInitial) {
    return <LoadingState message="Connecting AI Interviewer..." />;
  }

  // Network initialization failure
  if (networkError && !currentQuestion) {
    return <ErrorState message={networkError} onRetry={() => window.location.reload()} />;
  }

  const isCoding =
    currentQuestion?.questionType === 'CODING' || !!currentQuestion?.starterCode;

  return (
    <div className="min-h-screen bg-canvas text-[#111111] dark:text-[#E4E4E7] flex flex-col font-body selection:bg-[#C85232]/30 selection:text-white">
      {/* IMMERSIVE HEADER (MINIMAL CHROME) */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-[rgba(0,0,0,0.08)] dark:border-neutral-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Interview Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C85232]/15 border border-[#C85232]/30 flex items-center justify-center text-[#C85232] shrink-0 font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold font-heading text-[#111111] dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  {interview?.targetRole || 'AI Practice Interview'}
                </h1>
                {interview?.companyName && interview?.companyName !== 'General Practice' && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#EAE6DF] dark:bg-neutral-800 text-[10px] text-[#111111] dark:text-neutral-300 font-semibold border border-[rgba(0,0,0,0.08)] dark:border-neutral-700">
                    {interview.companyName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5E5B56] dark:text-neutral-400 flex items-center gap-2">
                <span>
                  Question {questionIndex} of {totalQuestions}
                </span>
                <span>•</span>
                <span className="text-[#C85232] font-semibold">
                  {currentQuestion?.questionType || interview?.interviewType || 'TECHNICAL'}
                </span>
              </p>
            </div>
          </div>

          {/* Progress Bar & Timer */}
          <div className="hidden md:flex items-center gap-6">
            <div className="w-48 bg-[#EAE6DF] dark:bg-neutral-800 h-2 rounded-full overflow-hidden relative">
              <div
                className="bg-[#C85232] h-full transition-all duration-500 rounded-full"
                style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F5] dark:bg-neutral-900 border border-[rgba(0,0,0,0.08)] dark:border-neutral-800 text-xs text-[#111111] dark:text-neutral-300 font-mono">
              <Clock size={14} className="text-[#C85232]" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeechMute}
              title={speechMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                speechMuted
                  ? 'bg-[#EAE6DF] dark:bg-neutral-800 text-[#5E5B56] dark:text-neutral-400 border-[rgba(0,0,0,0.08)] dark:border-neutral-700'
                  : 'bg-[#C85232]/10 text-[#C85232] border-[#C85232]/30'
              }`}
            >
              {speechMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              onClick={() => setShowExitModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EAE6DF] dark:bg-neutral-800/80 hover:bg-[#E2DDD5] dark:hover:bg-neutral-700 text-[#111111] dark:text-neutral-300 border border-[rgba(0,0,0,0.08)] dark:border-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">End Session</span>
            </button>
          </div>
        </div>

        {/* Mobile Progress Line */}
        <div className="md:hidden mt-2.5 h-1 bg-[#EAE6DF] dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="bg-[#C85232] h-full transition-all duration-300"
            style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* MAIN IMMERSIVE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: AI INTERVIEWER PANEL (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface border border-[rgba(0,0,0,0.08)] dark:border-neutral-800/90 rounded-2xl p-5 relative overflow-hidden shadow-xs">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C85232] to-transparent opacity-80" />

            {/* AI Avatar & Pulse Indicator */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#EAE6DF] dark:from-[#1E1E22] via-[#F7F5F0] dark:via-[#2A2A30] to-[#C85232]/20 border border-[#C85232]/40 flex items-center justify-center text-[#C85232] shadow-inner ${
                    isSpeaking ? 'ring-2 ring-[#C85232] animate-pulse' : ''
                  }`}
                >
                  <Cpu size={28} />
                </div>
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C85232] rounded-full ring-2 ring-surface animate-ping" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#111111] dark:text-white font-heading">
                    AI Evaluator
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C85232]/20 text-[#C85232] font-semibold border border-[#C85232]/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#5E5B56] dark:text-neutral-400 mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSpeaking ? 'bg-[#C85232] animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  {isSpeaking ? 'Speaking prompt...' : 'Listening to candidate'}
                </p>
              </div>
            </div>

            {/* Live Audio Visualizer Animation */}
            {isSpeaking && (
              <div className="mb-4 p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-neutral-900/80 border border-[rgba(0,0,0,0.08)] dark:border-neutral-800 flex items-center justify-center gap-1 h-10">
                {[40, 75, 100, 60, 90, 45, 80, 30, 95, 65, 50, 85].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#C85232] rounded-full animate-bounce"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.08}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
            )}

            {/* AI Prompt / Instruction Text */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-neutral-900/60 border border-[rgba(0,0,0,0.06)] dark:border-neutral-800/80 text-xs text-[#2A2A2A] dark:text-neutral-300 leading-relaxed space-y-2">
              <div className="font-semibold text-[#111111] dark:text-neutral-200 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#C85232]" />
                Interviewer Guidance:
              </div>
              <p className="text-[#5E5B56] dark:text-neutral-400">
                {isCoding
                  ? 'Analyze problem constraints, write robust code in the editor, and run test cases before final submission.'
                  : 'Speak clearly or type your answer. Structure your thoughts using key concepts, tradeoffs, and practical scenarios.'}
              </p>
            </div>

            {/* Expected Focus Areas */}
            {currentQuestion?.expectedConcepts && (
              <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-neutral-800/80">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E5B56] dark:text-neutral-400 mb-2">
                  Target Evaluation Concepts
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {currentQuestion.expectedConcepts.split(',').map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-neutral-800 text-[11px] font-medium text-[#111111] dark:text-neutral-300 border border-[rgba(0,0,0,0.08)] dark:border-neutral-700/60"
                    >
                      {concept.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Helper Tips */}
          <div className="bg-surface border border-[rgba(0,0,0,0.08)] dark:border-neutral-800/90 rounded-2xl p-4 text-xs text-[#5E5B56] dark:text-neutral-400 space-y-2 shadow-xs">
            <div className="font-semibold text-[#111111] dark:text-neutral-200 flex items-center gap-1.5">
              <HelpCircle size={14} className="text-[#C85232]" />
              Evaluation Tips:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-[#5E5B56] dark:text-neutral-400">
              <li>Address core principles first before diving into edge cases.</li>
              <li>For coding questions, focus on time/space complexity.</li>
              <li>You can skip questions if needed without stalling your session.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: QUESTION & ANSWER PANEL (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Question Display Card */}
          <div className="bg-surface border border-[rgba(0,0,0,0.08)] dark:border-neutral-800/90 rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#C85232]/15 text-[#C85232] text-xs font-bold uppercase tracking-wider border border-[#C85232]/30">
                  {currentQuestion?.questionType || 'QUESTION'}
                </span>
                <span className="text-xs text-[#5E5B56] dark:text-neutral-400 font-mono">
                  #{questionIndex} of {totalQuestions}
                </span>
              </div>

              {currentQuestion?.questionText && (
                <button
                  onClick={() => speakText(currentQuestion.questionText)}
                  className="text-xs text-[#C85232] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Volume2 size={14} /> Replay Prompt
                </button>
              )}
            </div>

            <h2 className="text-lg md:text-xl font-bold font-heading text-[#111111] dark:text-white leading-snug">
              {currentQuestion?.questionText || 'Loading prompt...'}
            </h2>
          </div>

          {/* Inline Network or Validation Alert */}
          {networkError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
              <ShieldAlert size={18} className="shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 space-y-2">
                <div className="font-semibold">Network Error</div>
                <p className="text-[#2A2A2A] dark:text-neutral-300 leading-relaxed">{networkError}</p>
                <button
                  onClick={() => handleSubmitAnswer(false)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw size={14} /> Retry Submission
                </button>
              </div>
            </div>
          )}

          {validationError && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-amber-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* ANSWER INPUT AREA */}
          {isCoding ? (
            /* CODING EDITOR MODE */
            <div className="bg-surface border border-[rgba(0,0,0,0.08)] dark:border-neutral-800/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-[#FAF8F5] dark:bg-neutral-900 px-4 py-2.5 border-b border-[rgba(0,0,0,0.08)] dark:border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-[#C85232]" />
                  <span className="font-bold text-[#111111] dark:text-neutral-200">Code Solution Editor</span>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-[#EAE6DF] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 text-xs px-2.5 py-1 rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-neutral-700 focus:outline-none focus:border-[#C85232]"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="typescript">TypeScript</option>
                  </select>

                  <button
                    onClick={() => {
                      if (currentQuestion?.starterCode) {
                        setCodeAnswer(currentQuestion.starterCode);
                      } else {
                        setCodeAnswer('// Reset solution\n');
                      }
                    }}
                    title="Reset Starter Code"
                    className="text-[#5E5B56] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-neutral-200 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={codeAnswer}
                  onChange={(e) => setCodeAnswer(e.target.value)}
                  placeholder="// Type your code implementation here..."
                  rows={12}
                  className="w-full bg-[#121214] text-emerald-400 font-mono text-xs p-4 focus:outline-none resize-y leading-relaxed border-none"
                  spellCheck="false"
                />
              </div>

              {/* Code Test Case Evaluation Results */}
              {codingResult && (
                <div className="p-4 bg-[#FAF8F5] dark:bg-neutral-900/90 border-t border-[rgba(0,0,0,0.08)] dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111111] dark:text-neutral-200 flex items-center gap-1.5">
                      {codingResult.passed ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                      Execution Score: {codingResult.score || 0}/100
                    </span>

                    {codingResult.timeComplexity && (
                      <span className="text-[11px] font-mono text-[#5E5B56] dark:text-neutral-400">
                        O({codingResult.timeComplexity}) time | O({codingResult.spaceComplexity || '1'}) space
                      </span>
                    )}
                  </div>

                  {codingResult.qualityComment && (
                    <p className="text-xs text-[#2A2A2A] dark:text-neutral-300 bg-white dark:bg-neutral-800/60 p-2.5 rounded-lg border border-[rgba(0,0,0,0.08)] dark:border-neutral-700/50 leading-relaxed">
                      {codingResult.qualityComment}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* STANDARD TEXT/VOICE ANSWER MODE */
            <div className="bg-surface border border-[rgba(0,0,0,0.08)] dark:border-neutral-800/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111111] dark:text-neutral-300">Your Response</span>

                {/* Voice Input Toggle Button */}
                {recordingSupported && (
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-red-500/20 text-red-500 border border-red-500/40 animate-pulse'
                        : 'bg-[#EAE6DF] dark:bg-neutral-800 text-[#111111] dark:text-neutral-300 hover:bg-[#E2DDD5] dark:hover:bg-neutral-700 border border-[rgba(0,0,0,0.08)] dark:border-neutral-700'
                    }`}
                  >
                    {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
                  </button>
                )}
              </div>

              <textarea
                value={answerText}
                onChange={(e) => {
                  setAnswerText(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Type your response here. Include technical concepts, design decisions, and real-world examples..."
                rows={8}
                className="w-full bg-[#FAF8F5] dark:bg-[#0E0E10] text-[#111111] dark:text-neutral-200 text-sm p-4 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-neutral-800 focus:outline-none focus:border-[#C85232] transition-all leading-relaxed"
              />

              <div className="flex items-center justify-between text-[11px] text-[#5E5B56] dark:text-neutral-400">
                <span>
                  {answerText.trim() ? answerText.trim().split(/\s+/).length : 0} words |{' '}
                  {answerText.length} characters
                </span>
                {isRecording && (
                  <span className="text-red-500 font-semibold flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Transcribing speech live...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ACTION CTA BAR */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={evaluating}
              onClick={() => setShowSkipModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5E5B56] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-neutral-200 bg-[#EAE6DF] dark:bg-neutral-900 border border-[rgba(0,0,0,0.08)] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <SkipForward size={14} />
              <span>Skip Question</span>
            </button>

            <button
              type="button"
              disabled={evaluating}
              onClick={() => handleSubmitAnswer(false)}
              className="px-7 py-3 rounded-xl text-sm font-bold text-white bg-[#C85232] hover:bg-[#b04328] shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {evaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating AI Score...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* EVALUATING OVERLAY MODAL */}
      {evaluating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-[rgba(0,0,0,0.1)] dark:border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#C85232]/15 border border-[#C85232]/30 flex items-center justify-center text-[#C85232] mx-auto animate-pulse">
              <Cpu size={32} />
            </div>

            <h3 className="text-lg font-bold font-heading text-[#111111] dark:text-white">
              Evaluating Answer...
            </h3>
            <p className="text-xs text-[#5E5B56] dark:text-neutral-400 leading-relaxed">
              AI engine is analyzing technical terminology, correctness, structure, and depth to formulate your real-time score.
            </p>

            <div className="w-full bg-[#EAE6DF] dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#C85232] h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* SKIP QUESTION CONFIRMATION MODAL */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-[rgba(0,0,0,0.1)] dark:border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold text-[#111111] dark:text-white font-heading">
                Skip Question #{questionIndex}?
              </h3>
            </div>

            <p className="text-xs text-[#5E5B56] dark:text-neutral-300 leading-relaxed">
              Skipping this question will mark it as unanswered and record a score of 0 for this question in your final feedback report.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSkipModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EAE6DF] dark:bg-neutral-800 text-[#111111] dark:text-neutral-300 hover:bg-[#E2DDD5] dark:hover:bg-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSkipModal(false);
                  handleSubmitAnswer(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C85232] text-white hover:bg-[#b04328] cursor-pointer"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* END SESSION CONFIRMATION MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-[rgba(0,0,0,0.1)] dark:border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#111111] dark:text-neutral-200">
              <LogOut size={24} className="text-[#C85232]" />
              <h3 className="text-base font-bold text-[#111111] dark:text-white font-heading">
                End Interview Session?
              </h3>
            </div>

            <p className="text-xs text-[#5E5B56] dark:text-neutral-300 leading-relaxed">
              Are you sure you want to exit? Your answers up to question #{questionIndex} will be evaluated and compiled into a performance report.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EAE6DF] dark:bg-neutral-800 text-[#111111] dark:text-neutral-300 hover:bg-[#E2DDD5] dark:hover:bg-neutral-700 cursor-pointer"
              >
                Continue Session
              </button>
              <button
                onClick={handleFinishSession}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C85232] text-white hover:bg-[#b04328] cursor-pointer"
              >
                End & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
