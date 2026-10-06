import { ExperimentLog, Badge } from '../types/analytics';
import { StudentProfile } from '../types/user';
import { INITIAL_STUDENT_PROFILE, INITIAL_EXPERIMENT_LOGS, INITIAL_BADGES } from './seedData';
import { authService } from '../auth/authService';

const GLOBAL_KEYS = {
  LEGACY_PROFILE: 'simulab_student_profile',
  LEGACY_LOGS: 'simulab_experiment_logs',
  LEGACY_BADGES: 'simulab_student_badges',
  LEGACY_COMPLETED: 'simulab_completed_simulations',
};

// Generates user-scoped storage key
function getUserKey(prefix: string, userId?: string): string {
  const activeId = userId || authService.getCurrentUser()?.id || 'guest_user';
  return `simulab_user_${activeId}_${prefix}`;
}

export const storageService = {
  // Active User Context Identifier
  getCurrentUserId(): string {
    return authService.getCurrentUser()?.id || 'guest_user';
  },

  getProfile(userId?: string): StudentProfile {
    const user = authService.getCurrentUser();
    if (user && (!userId || userId === user.id)) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '🔬',
        gradeLevel: user.gradeLevel || 'STEM Scholar',
        joinedDate: user.joinedDate,
        targetGoalHours: user.targetGoalHours || 15,
        streakDays: user.streakDays ?? 5,
      };
    }

    try {
      const key = getUserKey('profile', userId);
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }

    return INITIAL_STUDENT_PROFILE;
  },

  getUserProfile(userId?: string): StudentProfile {
    return this.getProfile(userId);
  },

  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener('simulab_storage_change', handler);
    window.addEventListener('simulab_auth_change', handler);
    return () => {
      window.removeEventListener('simulab_storage_change', handler);
      window.removeEventListener('simulab_auth_change', handler);
    };
  },

  saveProfile(profile: StudentProfile, userId?: string): void {
    try {
      const key = getUserKey('profile', userId);
      localStorage.setItem(key, JSON.stringify(profile));
      // Also update authService if current user
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === profile.id) {
        authService.updateProfile({
          name: profile.name,
          avatar: profile.avatar,
          gradeLevel: profile.gradeLevel,
          targetGoalHours: profile.targetGoalHours,
          streakDays: profile.streakDays,
        });
      }
      window.dispatchEvent(new Event('simulab_storage_change'));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getLogs(userId?: string): ExperimentLog[] {
    const key = getUserKey('logs', userId);
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }

    // If default demo student, provide seed data
    const activeId = userId || this.getCurrentUserId();
    if (activeId === 'student-alex-01' || activeId === 'student-alpha-01') {
      this.saveLogs(INITIAL_EXPERIMENT_LOGS, activeId);
      return INITIAL_EXPERIMENT_LOGS;
    }

    // New user starts with fresh clean learning state
    return [];
  },

  saveLogs(logs: ExperimentLog[], userId?: string): void {
    try {
      const key = getUserKey('logs', userId);
      localStorage.setItem(key, JSON.stringify(logs));
      window.dispatchEvent(new Event('simulab_storage_change'));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  addLog(newLog: Omit<ExperimentLog, 'id'>, userId?: string): ExperimentLog {
    const targetUserId = userId || this.getCurrentUserId();
    const logs = this.getLogs(targetUserId);
    const created: ExperimentLog = {
      ...newLog,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [created, ...logs];
    this.saveLogs(updated, targetUserId);

    // Also update completed list
    this.markCompleted(newLog.simulationId, targetUserId);
    // Check badges
    this.evaluateBadges(updated, targetUserId);

    return created;
  },

  getCompletedSimulationIds(userId?: string): string[] {
    const key = getUserKey('completed', userId);
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    const fromLogs: string[] = Array.from(new Set(this.getLogs(userId).map((l) => l.simulationId)));
    this.saveCompleted(fromLogs, userId);
    return fromLogs;
  },

  saveCompleted(ids: string[], userId?: string): void {
    try {
      const key = getUserKey('completed', userId);
      localStorage.setItem(key, JSON.stringify(ids));
      window.dispatchEvent(new Event('simulab_storage_change'));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  markCompleted(simulationId: string, userId?: string): void {
    const targetUserId = userId || this.getCurrentUserId();
    const current = this.getCompletedSimulationIds(targetUserId);
    if (!current.includes(simulationId)) {
      this.saveCompleted([...current, simulationId], targetUserId);
    }
  },

  getBadges(userId?: string): Badge[] {
    const key = getUserKey('badges', userId);
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    this.saveBadges(INITIAL_BADGES, userId);
    return INITIAL_BADGES;
  },

  saveBadges(badges: Badge[], userId?: string): void {
    try {
      const key = getUserKey('badges', userId);
      localStorage.setItem(key, JSON.stringify(badges));
      window.dispatchEvent(new Event('simulab_storage_change'));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  evaluateBadges(logs: ExperimentLog[], userId?: string): void {
    const badges = this.getBadges(userId);
    let changed = false;

    const completedIds = Array.from(new Set(logs.map((l) => l.simulationId)));
    const mathCount = logs.filter((l) => l.subject === 'mathematics').length;
    const physicsCount = logs.filter((l) => l.subject === 'physics').length;
    const chemCount = logs.filter((l) => l.subject === 'chemistry').length;
    const hasPerfect = logs.some((l) => l.accuracy === 100);

    const updated = badges.map((badge) => {
      if (badge.isUnlocked) return badge;

      let unlock = false;
      if (badge.id === 'badge-first-lab' && logs.length >= 1) unlock = true;
      if (badge.id === 'badge-physics-pioneer' && physicsCount >= 3) unlock = true;
      if (badge.id === 'badge-chemistry-alchemist' && chemCount >= 2) unlock = true;
      if (badge.id === 'badge-math-apprentice' && mathCount >= 3) unlock = true;
      if (badge.id === 'badge-perfect-score' && hasPerfect) unlock = true;
      if (badge.id === 'badge-ten-sims' && completedIds.length >= 10) unlock = true;

      if (unlock) {
        changed = true;
        return {
          ...badge,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
        };
      }
      return badge;
    });

    if (changed) {
      this.saveBadges(updated, userId);
    }
  },

  resetAll(): void {
    const targetUserId = this.getCurrentUserId();
    try {
      this.saveLogs(INITIAL_EXPERIMENT_LOGS, targetUserId);
      this.saveBadges(INITIAL_BADGES, targetUserId);
      const initCompleted = Array.from(new Set(INITIAL_EXPERIMENT_LOGS.map((l) => l.simulationId)));
      this.saveCompleted(initCompleted, targetUserId);
      window.dispatchEvent(new Event('simulab_storage_change'));
    } catch (e) {
      console.error('Storage reset error:', e);
    }
  },

  clearAllData(): void {
    const targetUserId = this.getCurrentUserId();
    try {
      this.saveLogs([], targetUserId);
      this.saveCompleted([], targetUserId);
      const clearedBadges = INITIAL_BADGES.map((b) => ({ ...b, isUnlocked: false, unlockedAt: undefined }));
      this.saveBadges(clearedBadges, targetUserId);
      window.dispatchEvent(new Event('simulab_storage_change'));
    } catch (e) {
      console.error('Storage clear error:', e);
    }
  },
};
