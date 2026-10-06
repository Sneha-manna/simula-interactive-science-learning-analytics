import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Award,
  Clock,
  Sparkles,
  LogOut,
  Target,
  Flame,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Save,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { storageService } from '../../storage/localStorage';
import { computeAnalyticsSummary } from '../../analytics/engine';

interface ProfileViewProps {
  onNavigateToSim: (simId: string) => void;
  onOpenLogin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToSim, onOpenLogin }) => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [gradeLevel, setGradeLevel] = useState(user?.gradeLevel || 'STEM Scholar / Undergraduate');
  const [targetGoalHours, setTargetGoalHours] = useState(user?.targetGoalHours || 15);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Student Profile Access</h2>
          <p className="text-xs text-slate-400">
            Sign in to view your learning milestones, saved telemetry, badges, and personalized goals.
          </p>
        </div>
        <button
          onClick={onOpenLogin}
          className="w-full py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const logs = storageService.getLogs(user.id);
  const badges = storageService.getBadges(user.id);
  const summary = computeAnalyticsSummary(logs);
  const unlockedBadges = badges.filter((b) => b.isUnlocked);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || user.name,
      gradeLevel,
      targetGoalHours: Number(targetGoalHours) || 15,
    });
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 animate-fade-in">
      {/* Profile Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border-2 border-cyan-500/40 flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/10">
              {user.avatar || '🧪'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  Verified Scholar
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
                <span className="text-slate-600">•</span>
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined {user.joinedDate}</span>
              </p>
              <div className="text-xs text-cyan-400 font-medium">
                {user.gradeLevel || 'STEM Scholar'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {savedNotice && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile settings updated successfully.</span>
          </div>
        )}
      </div>

      {/* Edit Profile Form Panel */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-cyan-400" />
              <span>Update Profile Credentials</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Curriculum / Grade Level
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g. AP Physics & Calculus / College STEM"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Monthly Lab Goal (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={targetGoalHours}
                onChange={(e) => setTargetGoalHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Labs Run</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary.totalSimulationsRun}</div>
          <div className="text-[10px] text-slate-500">Total laboratory runs</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Accuracy Rate</span>
            <Target className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">{summary.overallAccuracy}%</div>
          <div className="text-[10px] text-slate-500">Quiz &amp; concept precision</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Time Logged</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">
            {summary.totalTimeMinutes} <span className="text-xs font-normal text-slate-400">mins</span>
          </div>
          <div className="text-[10px] text-slate-500">Hands-on experiment time</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {user.streakDays ?? 5} <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[10px] text-slate-500">Active learning streak</div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Mastery Badges &amp; Achievements</h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {unlockedBadges.length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all ${
                badge.isUnlocked
                  ? 'bg-slate-950/80 border-amber-500/30 shadow-md shadow-amber-500/5'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {badge.icon}
                </span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{badge.title}</span>
                    {badge.isUnlocked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{badge.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono pt-1">
                    {badge.isUnlocked && badge.unlockedAt
                      ? `Unlocked ${new Date(badge.unlockedAt).toLocaleDateString()}`
                      : `Criteria: ${badge.criteria}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Experiment Logs for this authenticated user */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Your Recent Laboratory Telemetry</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Isolated to User ID: {user.id}</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-medium">No experiments completed yet under this account.</p>
            <p className="text-xs text-slate-500">
              Run any simulation from the library to record your scores, accuracy, and telemetry here.
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-x-auto">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                onClick={() => onNavigateToSim(log.simulationId)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-950 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {log.simulationTitle}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {log.subject.toUpperCase()} • {log.topic} • {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <div className="text-slate-300 font-bold">{log.score}% Score</div>
                    <div className="text-[10px] text-slate-500">{log.accuracy}% Accuracy</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
