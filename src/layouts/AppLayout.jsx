import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Briefcase,
  Compass,
  Video,
  BarChart2,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const AppLayout = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Placement', path: '/placement', icon: Briefcase },
    { name: 'Career Hub', path: '/career-hub', icon: Compass },
    { name: 'Mock Interview', path: '/mock-interview', icon: Video },
    { name: 'Progress', path: '/progress', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const bottomNavItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Placement', path: '/placement', icon: Briefcase },
    { name: 'Hub', path: '/career-hub', icon: Compass },
    { name: 'Interview', path: '/mock-interview', icon: Video },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const currentUser = JSON.parse(localStorage.getItem('user') || '{"name": "Student User", "email": "student@prepwise.edu"}');

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col md:flex-row font-body">
      {/* Mobile Top Header (<768px) */}
      <header className="md:hidden sticky top-0 z-40 bg-[#EFECE6] dark:bg-[#1E1E1E] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/apple-touch-icon.png"
            alt="PrepWise"
            className="w-8 h-8 rounded-lg object-contain shadow-xs shrink-0"
            onError={(e) => {
              e.currentTarget.src = '/favicon-32x32.png';
            }}
          />
          <span className="font-bold text-xl font-heading text-[#111111] dark:text-white">
            PrepWise
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#EFECE6] dark:bg-[#1E1E1E] border-t border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)] p-6 rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C85232] text-white flex items-center justify-center font-bold">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div>
                  <p className="font-semibold text-[#111111] dark:text-white">{currentUser.name}</p>
                  <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0]">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-[#5E5B56] dark:text-[#A0A0A0]"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1 mb-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#C85232] text-white shadow-xs'
                        : 'text-[#111111] dark:text-white hover:bg-[#EAE6DF] dark:hover:bg-[#242424]'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                    <ChevronRight size={16} className="ml-auto opacity-60" />
                  </NavLink>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-[#EFECE6] dark:bg-[#1E1E1E] border-r border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] p-6 z-30 justify-between">
        <div>
          {/* App Logo */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <img
              src="/apple-touch-icon.png"
              alt="PrepWise"
              className="w-10 h-10 rounded-xl object-contain shadow-xs shrink-0"
              onError={(e) => {
                e.currentTarget.src = '/favicon-32x32.png';
              }}
            />
            <div>
              <span className="font-extrabold text-2xl font-heading text-[#111111] dark:text-white tracking-tight">
                PrepWise
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-[#C85232]">
                Placement AI Engine
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#C85232] text-white font-semibold shadow-xs'
                      : 'text-[#5E5B56] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-[#EAE6DF] dark:hover:bg-[#242424]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-[#5E5B56] dark:text-[#A0A0A0]'} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-4 pt-6 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]">
          {/* User Profile Mini Bar */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-[#C85232] text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-[#111111] dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-[#5E5B56] dark:text-[#A0A0A0] truncate">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] transition-colors hover:bg-[#E2DDD5]"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Outlet Container */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-10 max-w-7xl w-full pb-20 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#EFECE6] dark:bg-[#1E1E1E] border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] px-2 py-1.5 flex justify-around items-center">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[#C85232] font-bold'
                  : 'text-[#5E5B56] dark:text-[#A0A0A0]'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-[#C85232]' : ''} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
