import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Trash2,
  FileCheck,
  ChevronRight,
  ShieldAlert,
  Loader2,
  BarChart3
} from 'lucide-react';
import { uploadResume, analyzeResume, getUserResumes } from '../../services/resumeService';
import { getAiErrorMessage } from '../../utils/aiErrorUtils';
import CareerHubHeader from '../../components/hub/CareerHubHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';

export default function ResumeAnalyzer() {
  const navigate = useNavigate();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(''); // 'uploading' | 'analyzing'
  const [progressPercent, setProgressPercent] = useState(0);

  const [existingResumes, setExistingResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoadingResumes(true);
      const data = await getUserResumes();
      setExistingResumes(data || []);
    } catch (err) {
      console.error("Failed to fetch user resumes:", err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const validateFile = (file) => {
    if (!file) return false;

    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(fileExt);
    const isAllowedType = ALLOWED_TYPES.includes(file.type) || isAllowedExt;

    if (!isAllowedType) {
      setFileError('Invalid file type. Only PDF and DOCX formats are supported.');
      return false;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller file.');
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadStep('Uploading resume file...');
      setProgressPercent(25);

      // Step 1: Upload resume to server
      const uploadedResume = await uploadResume(selectedFile);
      setProgressPercent(55);

      // Step 2: Trigger AI Analysis
      setUploadStep('AI is evaluating your formatting, keywords, and skill gaps...');
      setProgressPercent(80);

      const analysisResult = await analyzeResume(uploadedResume.id);
      setProgressPercent(100);

      // Navigate to detailed result page
      setTimeout(() => {
        navigate(`/hub/resume/result/${uploadedResume.id}`);
      }, 500);

    } catch (err) {
      console.error("Failed to upload and analyze resume:", err);
      setFileError(getAiErrorMessage(err));
      setUploading(false);
      setProgressPercent(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-body pb-12">
      <CareerHubHeader />

      {/* Header Banner */}
      <div className="bg-[#EFECE6] dark:bg-[#1E1E1E] border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#C85232]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85232]/10 border border-[#C85232]/25 text-[#C85232] font-semibold text-xs mb-3">
              <Sparkles size={14} />
              <span>AI Resume Screening Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] dark:text-white">
              Resume Analyzer & ATS Checker
            </h1>
            <p className="text-xs sm:text-sm text-[#5E5B56] dark:text-neutral-400 mt-1 max-w-xl">
              Get an instant score, spot missing industry keywords, and uncover formatting issues before recruiters do.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-[#EAE6DF] dark:bg-[#282828] border border-[rgba(0,0,0,0.1)] dark:border-[#383838] px-4 py-2.5 rounded-xl text-xs text-[#111111] dark:text-neutral-300">
            <BarChart3 size={16} className="text-[#C85232]" />
            <span>Target Match: <strong className="text-[#111111] dark:text-white">Software Roles</strong></span>
          </div>
        </div>
      </div>

      {/* Upload Box Container */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold font-heading text-[#111111] dark:text-white mb-2 flex items-center gap-2">
          <Upload size={20} className="text-[#C85232]" />
          Upload Your Resume
        </h2>
        <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mb-6">
          Supported Formats: PDF or DOCX (Max size: 10MB). Your document remains confidential and secure.
        </p>

        {/* Drag & Drop Zone */}
        {!uploading ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer relative ${
              dragActive
                ? 'border-[#C85232] bg-[#C85232]/5 dark:bg-[#C85232]/10 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10'
                : 'border-[#D1CDC7] dark:border-[#333333] hover:border-[#C85232] bg-[#FAF8F5] dark:bg-[#121212]'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <FileCheck size={28} />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#111111] dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Analysis
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-xs text-rose-500 hover:underline font-semibold mt-1"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EFECE6] dark:bg-[#252525] text-[#C85232] flex items-center justify-center">
                  <Upload size={28} />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#111111] dark:text-white">
                    Drag & drop your resume here, or <span className="text-[#C85232] underline">browse files</span>
                  </p>
                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
                    Accepts PDF or DOCX files up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Uploading & Analyzing Progress Screen */
          <div className="border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-8 bg-[#FAF8F5] dark:bg-[#121212] text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#C85232]/10 text-[#C85232] flex items-center justify-center mx-auto animate-pulse">
              <Loader2 size={32} className="animate-spin" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#111111] dark:text-white">
                Analyzing Your Resume...
              </h3>
              <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
                {uploadStep}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-full bg-[#E2DFD9] dark:bg-[#2A2A2A] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#C85232] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-right text-[11px] font-bold text-[#C85232]">{progressPercent}%</p>
            </div>
          </div>
        )}

        {/* File Error Message */}
        {fileError && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{fileError}</span>
            </div>
            {selectedFile && (
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition-colors shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        {selectedFile && !uploading && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleStartAnalysis}
              className="w-full sm:w-auto px-6 py-3 bg-[#C85232] hover:bg-[#B34528] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <Sparkles size={18} />
              <span>Run AI Resume Analysis</span>
            </button>
          </div>
        )}
      </div>

      {/* Past Uploaded Resumes Section */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold font-heading text-[#111111] dark:text-white mb-4 flex items-center gap-2">
          <Clock size={18} className="text-[#C85232]" />
          Previous Resume Evaluations
        </h2>

        {loadingResumes ? (
          <LoadingState message="Loading saved resumes..." />
        ) : existingResumes.length === 0 ? (
          <EmptyState
            title="No Resume Uploaded Yet"
            description="Upload your first resume above to generate a comprehensive AI score report with key insights and recruiter recommendations."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {existingResumes.map((resume) => {
              const score = resume.analysis?.overallScore;
              return (
                <div
                  key={resume.id}
                  onClick={() => navigate(`/hub/resume/result/${resume.id}`)}
                  className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-[#2E2E2E] bg-[#FAF8F5] dark:bg-[#121212] hover:border-[#C85232] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-lg bg-[#EFECE6] dark:bg-[#252525] text-[#C85232] flex items-center justify-center shrink-0 font-bold">
                      <FileText size={20} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#111111] dark:text-white truncate">
                        {resume.originalFilename}
                      </p>
                      <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                        Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {score !== undefined && (
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                        score >= 80
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : score >= 60
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      }`}>
                        Score: {score}/100
                      </div>
                    )}
                    <ChevronRight size={16} className="text-neutral-400 group-hover:text-[#C85232] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
