import React, { useState } from 'react';
import {
  FlaskConical,
  Compass,
  BarChart3,
  Lightbulb,
  Flame,
  User,
  Sparkles,
  BookOpen,
  LogIn,
  LogOut,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { UserProfile } from '../../types/user';
import { useAuth } from '../../auth/AuthContext';

export type NavView = 'home' | 'library' | 'analytics' | 'recommendations' | 'simulation' | 'profile';

interface NavigationProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  userProfile: UserProfile;
  onOpenAuthModal?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  userProfile,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div
          onClick={() => onSelectView('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 group-hover:scale-105 transition-all shadow-lg shadow-cyan-500/10">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-100 tracking-tight font-sans">
                SIMU<span className="text-cyan-400">LAB</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider">
              STEM SIMULATION PLATFORM
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => onSelectView('library')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'library'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Simulations</span>
          </button>

          <button
            onClick={() => onSelectView('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'analytics'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Student Analytics</span>
          </button>

          <button
            onClick={() => onSelectView('recommendations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'recommendations'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Pathways</span>
          </button>

          <button
            onClick={() => onSelectView('home')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'home'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Overview</span>
          </button>
        </nav>

        {/* Right Student Profile & Streak Badge / Auth Controls */}
        <div className="flex items-center gap-3">
          {/* Daily Streak */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>{user?.streakDays ?? userProfile.streakDays ?? 5} Day Streak</span>
          </div>

          {/* User Profile or Login CTA */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-90 transition-opacity cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs group-hover:border-cyan-500/50">
                  {user.avatar || (user.name ? user.name.charAt(0) : 'S')}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-200 leading-none group-hover:text-cyan-300 transition-colors">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                    {user.gradeLevel || 'STEM Scholar'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-fade-in"
                >
                  <div className="px-4 py-2 border-b border-slate-800/80">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate font-mono">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectView('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>My Account &amp; Goals</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('analytics');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Learning Telemetry</span>
                  </button>

                  <div className="border-t border-slate-800/80 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
