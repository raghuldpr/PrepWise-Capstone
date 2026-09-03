import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import Modal from '../../components/common/Modal';
import { useTheme } from '../../context/ThemeContext';
import {
  getUserSettings,
  updateUserSettings,
  changePassword,
  updateUserProfile,
} from '../../services/userService';
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Bell,
  Sun,
  Moon,
  Laptop,
  Key,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Lock,
  Mail,
  Smartphone,
  Save,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Settings() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account'); // account, preferences, notifications, security, placement
  const [loading, setLoading] = useState(true);

  // Account State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountCreatedAt, setAccountCreatedAt] = useState('');
  const [accountRole, setAccountRole] = useState('STUDENT');

  // Preferences State
  const [language, setLanguage] = useState('en');

  // Notification Toggles State
  const [notifications, setNotifications] = useState({
    mockInterviewReminders: true,
    dailyPracticeReminders: true,
    newAssessmentAlerts: true,
    placementOpportunityAlerts: true,
    progressMilestones: true,
    emailDigest: false,
  });

  // Security / Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Placement Quick Preferences
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [placementStatus, setPlacementStatus] = useState('Actively Preparing');
  const [jobType, setJobType] = useState('Full-Time');

  // General Notification / Save feedback
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState(null);

  // Confirmation Modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getUserSettings();
      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
        setAccountRole(data.role || 'STUDENT');
        if (data.createdAt) {
          try {
            const date = new Date(data.createdAt);
            setAccountCreatedAt(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
          } catch (e) {
            setAccountCreatedAt('September 2026');
          }
        } else {
          setAccountCreatedAt('September 2026');
        }

        if (data.settingsData) {
          try {
            const parsed = JSON.parse(data.settingsData);
            if (parsed.notifications) {
              setNotifications(parsed.notifications);
            }
            if (parsed.language) {
              setLanguage(parsed.language);
            }
          } catch (e) {
            console.warn('Failed to parse settings JSON:', e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);
    try {
      const payload = {
        name,
        settingsData: JSON.stringify({
          notifications,
          language,
        }),
      };
      await updateUserSettings(payload);

      // Update local storage user name
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      localUser.name = name;
      localStorage.setItem('user', JSON.stringify(localUser));

      setSaveSuccessMessage('Account information updated successfully.');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err) {
      setSaveErrorMessage(err.response?.data?.message || 'Failed to update account settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingSettings(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);
    try {
      const payload = {
        settingsData: JSON.stringify({
          notifications,
          language,
        }),
      };
      await updateUserSettings(payload);
      setSaveSuccessMessage('Notification preferences saved.');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err) {
      setSaveErrorMessage('Failed to save notification preferences.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSavePlacementPreferences = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);
    try {
      await updateUserProfile({
        targetRole,
        placementStatus,
        jobType,
      });
      setSaveSuccessMessage('Placement preferences saved successfully.');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err) {
      setSaveErrorMessage('Failed to save placement preferences.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Ensure your current password is correct.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutAllDevices = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <LoadingState message="Loading portal settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-body">
      {/* HEADER BANNER */}
      <div className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="primary" icon={SettingsIcon}>
            PORTAL SETTINGS
          </Badge>
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-[#111111] dark:text-white">
          Account Settings & Placement Preferences
        </h1>
        <p className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
          Manage your account profile, notification alerts, interface theme, and placement targets.
        </p>
      </div>

      {/* GLOBAL TOAST ALERTS */}
      {saveSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} /> {saveSuccessMessage}
        </div>
      )}

      {saveErrorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} /> {saveErrorMessage}
        </div>
      )}

      {/* SETTINGS TABS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar Tabs */}
        <aside className="space-y-1.5 md:col-span-1">
          {[
            { id: 'account', label: 'Account Information', icon: User },
            { id: 'preferences', label: 'Theme & Preferences', icon: Sun },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'placement', label: 'Placement Goals', icon: Briefcase },
            { id: 'security', label: 'Privacy & Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-colors text-left ${
                  isActive
                    ? 'bg-[#C85232] text-white shadow-xs'
                    : 'text-[#5E5B56] dark:text-[#A0A0A0] hover:bg-[#EAE6DF] dark:hover:bg-[#242424] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Main Tab Panels */}
        <main className="md:col-span-3 space-y-6">
          {/* TAB 1: ACCOUNT INFORMATION */}
          {activeTab === 'account' && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                <h3 className="font-heading font-bold text-lg text-[#111111] dark:text-white flex items-center gap-2">
                  <User size={18} className="text-[#C85232]" /> Personal Account Details
                </h3>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                  Update candidate identity details and contact credentials.
                </p>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1 font-semibold">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#EAE6DF]/60 dark:bg-[#242424]/60 border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] text-[#5E5B56] dark:text-[#A0A0A0] cursor-not-allowed"
                  />
                  <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
                    Your institutional or registered email is mapped to your authentication token.
                  </p>
                </div>

                {/* Account Status Card */}
                <div className="p-4 rounded-xl bg-surface-alt border border-[rgba(0,0,0,0.06)] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[#5E5B56] dark:text-[#A0A0A0] block text-[11px]">Portal Role</span>
                    <span className="font-bold text-[#111111] dark:text-white">{accountRole}</span>
                  </div>
                  <div>
                    <span className="text-[#5E5B56] dark:text-[#A0A0A0] block text-[11px]">Member Since</span>
                    <span className="font-bold text-[#111111] dark:text-white">{accountCreatedAt}</span>
                  </div>
                  <div>
                    <span className="text-[#5E5B56] dark:text-[#A0A0A0] block text-[11px]">Account Status</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck size={14} /> Active
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="btn-terracotta inline-flex items-center gap-2 text-xs px-4 py-2"
                  >
                    <Save size={14} />
                    {savingSettings ? 'Saving Changes...' : 'Save Account Info'}
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 2: THEME & PREFERENCES */}
          {activeTab === 'preferences' && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                <h3 className="font-heading font-bold text-lg text-[#111111] dark:text-white flex items-center gap-2">
                  <Sun size={18} className="text-[#C85232]" /> Interface Appearance & Language
                </h3>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                  Customize the look and editorial color theme of your PrepWise session.
                </p>
              </div>

              {/* Theme Options */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
                  Color Theme
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (isDarkMode) toggleTheme();
                    }}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all ${
                      !isDarkMode
                        ? 'border-2 border-[#C85232] bg-[#F7F5F0] text-[#111111] shadow-xs'
                        : 'border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] bg-surface text-[#5E5B56] dark:text-[#A0A0A0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sun size={20} className={!isDarkMode ? 'text-[#C85232]' : ''} />
                      {!isDarkMode && <CheckCircle2 size={16} className="text-[#C85232]" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">Light Editorial Mode</p>
                      <p className="text-[10px] opacity-75">Warm canvas background (#F7F5F0)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isDarkMode) toggleTheme();
                    }}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all ${
                      isDarkMode
                        ? 'border-2 border-[#C85232] bg-[#1E1E1E] text-white shadow-xs'
                        : 'border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] bg-surface text-[#5E5B56] dark:text-[#A0A0A0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Moon size={20} className={isDarkMode ? 'text-[#C85232]' : ''} />
                      {isDarkMode && <CheckCircle2 size={16} className="text-[#C85232]" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">Dark Tech Mode</p>
                      <p className="text-[10px] opacity-75">OLED contrast background (#121212)</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-2 pt-4 border-t border-[rgba(0,0,0,0.06)]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5B56] dark:text-[#A0A0A0]">
                  Portal Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full sm:w-64 px-3.5 py-2.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-xs text-[#111111] dark:text-white"
                >
                  <option value="en">English (United States / Global)</option>
                  <option value="en-in">English (India - Campus Curriculum)</option>
                </select>
              </div>
            </Card>
          )}

          {/* TAB 3: NOTIFICATION TOGGLES */}
          {activeTab === 'notifications' && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#111111] dark:text-white flex items-center gap-2">
                    <Bell size={18} className="text-[#C85232]" /> Notification & Alert Preferences
                  </h3>
                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                    Control interview reminder alarms, practice streaks, and assessment alerts.
                  </p>
                </div>
                <button
                  onClick={handleSaveNotifications}
                  disabled={savingSettings}
                  className="btn-terracotta text-xs px-3.5 py-2"
                >
                  {savingSettings ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'mockInterviewReminders',
                    title: 'Mock Interview Reminders',
                    desc: 'Receive reminders 15 minutes before scheduled AI technical mock interview sessions.',
                  },
                  {
                    key: 'dailyPracticeReminders',
                    title: 'Daily Practice Reminders',
                    desc: 'Daily nudge to maintain your active problem-solving streak and review weak areas.',
                  },
                  {
                    key: 'newAssessmentAlerts',
                    title: 'New Assessment & Question Banks',
                    desc: 'Notify when updated company-specific question sets (Google, Amazon, TCS) are published.',
                  },
                  {
                    key: 'placementOpportunityAlerts',
                    title: 'Placement Drive & Opportunity Alerts',
                    desc: 'Receive alerts when target companies matching your role profile open applications.',
                  },
                  {
                    key: 'progressMilestones',
                    title: 'Progress Milestones & Scorecard Reports',
                    desc: 'Weekly diagnostic report highlighting accuracy improvements and strong topics.',
                  },
                  {
                    key: 'emailDigest',
                    title: 'Email Summary Digest',
                    desc: 'Send a summary of weekly placement preparation analytics directly to your inbox.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl bg-surface-alt border border-[rgba(0,0,0,0.06)] flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[#111111] dark:text-white">{item.title}</h4>
                      <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">{item.desc}</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={!!notifications[item.key]}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-[#EAE6DF] dark:bg-[#242424] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#EAE6DF] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85232]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: PLACEMENT PREFERENCES */}
          {activeTab === 'placement' && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                <h3 className="font-heading font-bold text-lg text-[#111111] dark:text-white flex items-center gap-2">
                  <Briefcase size={18} className="text-[#C85232]" /> Placement Goal Settings
                </h3>
                <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                  Configure default job role targeting used to tailor question difficulty and AI feedback.
                </p>
              </div>

              <form onSubmit={handleSavePlacementPreferences} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1 font-semibold">Primary Target Job Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Software Development Engineer"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1 font-semibold">Placement Preparation Status</label>
                    <select
                      value={placementStatus}
                      onChange={(e) => setPlacementStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                    >
                      <option value="Actively Preparing">Actively Preparing</option>
                      <option value="Applying">Applying</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer Received">Offer Received</option>
                      <option value="Placed">Placed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1 font-semibold">Preferred Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                    >
                      <option value="Full-Time">Full-Time Campus Hire</option>
                      <option value="Internship">Summer / Winter Internship</option>
                      <option value="Internship + PPO">Internship + Pre-Placement Offer (PPO)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="btn-terracotta inline-flex items-center gap-2 text-xs px-4 py-2"
                  >
                    <Save size={14} />
                    {savingSettings ? 'Saving...' : 'Save Placement Goals'}
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 5: PRIVACY & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Card */}
              <Card className="p-6 space-y-4">
                <div className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                  <h3 className="font-heading font-bold text-lg text-[#111111] dark:text-white flex items-center gap-2">
                    <Key size={18} className="text-[#C85232]" /> Change Portal Password
                  </h3>
                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                    Secure your account credentials. Must be at least 6 characters.
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Password changed successfully.
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} /> {passwordError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1 font-semibold">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1 font-semibold">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5E5B56] dark:text-[#A0A0A0] mb-1 font-semibold">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)] text-[#111111] dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="btn-terracotta inline-flex items-center gap-2 text-xs px-4 py-2"
                    >
                      <Lock size={14} />
                      {passwordLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </Card>

              {/* Active Sessions & Logout */}
              <Card className="p-6 space-y-4">
                <div className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] pb-3">
                  <h3 className="font-heading font-bold text-lg text-[#111111] dark:text-white flex items-center gap-2">
                    <Laptop size={18} className="text-[#C85232]" /> Active Sessions & Devices
                  </h3>
                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">
                    Manage active logins and authenticated browser tokens.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-alt border border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#C85232]/10 text-[#C85232]">
                      <Laptop size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111111] dark:text-white flex items-center gap-2">
                        Current Browser Session
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-semibold">
                          Active Now
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0]">
                        JWT Authenticated • Bearer Token (24h validity)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <LogOut size={14} /> Sign Out All Devices
                  </button>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 space-y-4 border-rose-500/20 bg-rose-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                      <Trash2 size={16} /> Danger Zone: Account Deletion
                    </h4>
                    <p className="text-xs text-rose-600/80 dark:text-rose-300/80 mt-0.5">
                      Permanently remove your candidate profile, interview histories, and assessment progress.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* CONFIRMATION MODAL: LOGOUT ALL SESSIONS */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out All Sessions?"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#5E5B56] dark:text-[#A0A0A0]">
            This will invalidate your current session and require you to sign in again with your email and password.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2 rounded-lg font-semibold bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutAllDevices}
              className="px-4 py-2 rounded-lg font-semibold bg-rose-600 text-white hover:bg-rose-700"
            >
              Confirm Sign Out
            </button>
          </div>
        </div>
      </Modal>

      {/* CONFIRMATION MODAL: DELETE ACCOUNT */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete PrepWise Account?"
      >
        <div className="space-y-4 text-xs">
          <p className="text-rose-600 dark:text-rose-400 font-semibold">
            Warning: This action cannot be undone. All your question attempts, mock interviews, and personalized roadmaps will be permanently erased.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-lg font-semibold bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutAllDevices}
              className="px-4 py-2 rounded-lg font-semibold bg-rose-600 text-white hover:bg-rose-700"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
