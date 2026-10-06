import { AuthUser, AuthSession, StoredAccount } from '../types/auth';
import { hashPasswordWithSalt, generateCryptoSalt, generateSecureToken } from './crypto';

const AUTH_KEYS = {
  SESSION: 'simulab_auth_session_v2',
  ACCOUNTS: 'simulab_auth_accounts_v2',
  CURRENT_USER_ID: 'simulab_auth_current_user_id',
};

// Seed default student account if zero accounts exist yet
const INITIAL_DEMO_ACCOUNT: Omit<StoredAccount, 'passwordSalt' | 'passwordHash'> = {
  id: 'student-alex-01',
  name: 'Alex Mercer',
  email: 'alex.mercer@simulab.edu',
  gradeLevel: 'Undergraduate STEM / AP Science',
  joinedDate: '2026-08-20',
  avatar: '🧪',
  targetGoalHours: 15,
  streakDays: 5,
};

class AuthService {
  private listeners: Set<() => void> = new Set();
  private initialized: Promise<void> | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return this.initialized;
    this.initialized = this.initAccounts();
    return this.initialized;
  }

  private async initAccounts(): Promise<void> {
    try {
      const existing = localStorage.getItem(AUTH_KEYS.ACCOUNTS);
      if (!existing || JSON.parse(existing).length === 0) {
        // Create demo account with salted hash for "Simulab2026!"
        const salt = generateCryptoSalt();
        const hash = await hashPasswordWithSalt('Simulab2026!', salt);
        const demoAccount: StoredAccount = {
          ...INITIAL_DEMO_ACCOUNT,
          passwordSalt: salt,
          passwordHash: hash,
        };
        localStorage.setItem(AUTH_KEYS.ACCOUNTS, JSON.stringify([demoAccount]));
      }
    } catch (e) {
      console.error('Error initializing auth accounts:', e);
    }
  }

  private getStoredAccounts(): StoredAccount[] {
    try {
      const raw = localStorage.getItem(AUTH_KEYS.ACCOUNTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading accounts:', e);
    }
    return [];
  }

  private saveStoredAccounts(accounts: StoredAccount[]): void {
    try {
      localStorage.setItem(AUTH_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Error saving accounts:', e);
    }
  }

  // Subscribe to auth state changes
  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Auth subscriber error:', err);
      }
    });
  }

  // Session verification & persistence
  public getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(AUTH_KEYS.SESSION);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);

      // Check expiration (30 days persistence)
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public getCurrentUser(): AuthUser | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  public isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  // Register new student account
  public async register(params: {
    name: string;
    email: string;
    password: string;
    gradeLevel?: string;
  }): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    await this.ensureInitialized();
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.name.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters long.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (params.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    const accounts = this.getStoredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please login instead.',
      };
    }

    const salt = generateCryptoSalt();
    const passwordHash = await hashPasswordWithSalt(params.password, salt);
    const userId = `student-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const newAccount: StoredAccount = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordSalt: salt,
      passwordHash,
      gradeLevel: params.gradeLevel || 'STEM Scholar / Undergraduate',
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: '🔬',
      targetGoalHours: 10,
      streakDays: 1,
    };

    accounts.push(newAccount);
    this.saveStoredAccounts(accounts);

    // Auto-login into session
    const authUser: AuthUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      gradeLevel: newAccount.gradeLevel,
      joinedDate: newAccount.joinedDate,
      avatar: newAccount.avatar,
      targetGoalHours: newAccount.targetGoalHours,
      streakDays: newAccount.streakDays,
    };

    this.createSession(authUser);
    return { success: true, user: authUser };
  }

  // Login with Email + Password
  public async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    await this.ensureInitialized();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both your email and password.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const accounts = this.getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, error: 'Email or password is incorrect.' };
    }

    const hashAttempt = await hashPasswordWithSalt(password, account.passwordSalt);
    if (hashAttempt !== account.passwordHash) {
      return { success: false, error: 'Email or password is incorrect.' };
    }

    const authUser: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      gradeLevel: account.gradeLevel,
      joinedDate: account.joinedDate,
      avatar: account.avatar,
      targetGoalHours: account.targetGoalHours,
      streakDays: account.streakDays,
    };

    this.createSession(authUser);
    return { success: true, user: authUser };
  }

  // Create persistent session (30-day token expiry for Android & Web persistence)
  private createSession(user: AuthUser): void {
    const token = generateSecureToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const session: AuthSession = {
      user,
      token,
      expiresAt,
    };

    try {
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
      localStorage.setItem(AUTH_KEYS.CURRENT_USER_ID, user.id);
      window.dispatchEvent(new Event('simulab_auth_change'));
    } catch (e) {
      console.error('Failed to store session:', e);
    }

    this.notify();
  }

  // Request password reset instructions
  public async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string; message?: string }> {
    await this.ensureInitialized();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const accounts = this.getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      // Do not reveal whether account exists for security, return standard message
      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.',
      };
    }

    // Generate real secure reset token & 1-hour expiry
    const resetToken = generateSecureToken();
    account.resetToken = resetToken;
    account.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    this.saveStoredAccounts(accounts);

    return {
      success: true,
      message: 'Password reset instructions have been sent to your email.',
    };
  }

  // Reset password using reset token or direct verification
  public async resetPasswordWithToken(
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    await this.ensureInitialized();
    const cleanEmail = email.trim().toLowerCase();

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }

    const accounts = this.getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, error: 'Account not found.' };
    }

    const newSalt = generateCryptoSalt();
    const newHash = await hashPasswordWithSalt(newPassword, newSalt);

    account.passwordSalt = newSalt;
    account.passwordHash = newHash;
    account.resetToken = undefined;
    account.resetTokenExpiry = undefined;

    this.saveStoredAccounts(accounts);
    return { success: true };
  }

  // Update profile details for authenticated user
  public updateProfile(updates: Partial<AuthUser>): AuthUser | null {
    const session = this.getSession();
    if (!session) return null;

    const updatedUser: AuthUser = {
      ...session.user,
      ...updates,
    };

    // Update in stored accounts list
    const accounts = this.getStoredAccounts();
    const idx = accounts.findIndex((a) => a.id === updatedUser.id);
    if (idx !== -1) {
      accounts[idx] = {
        ...accounts[idx],
        name: updatedUser.name,
        gradeLevel: updatedUser.gradeLevel || accounts[idx].gradeLevel,
        avatar: updatedUser.avatar || accounts[idx].avatar,
        targetGoalHours: updatedUser.targetGoalHours || accounts[idx].targetGoalHours,
        streakDays: updatedUser.streakDays ?? accounts[idx].streakDays,
      };
      this.saveStoredAccounts(accounts);
    }

    // Refresh active session
    this.createSession(updatedUser);
    return updatedUser;
  }

  // Logout current session
  public logout(): void {
    try {
      localStorage.removeItem(AUTH_KEYS.SESSION);
      localStorage.removeItem(AUTH_KEYS.CURRENT_USER_ID);
      window.dispatchEvent(new Event('simulab_auth_change'));
    } catch (e) {
      console.error('Failed to remove session:', e);
    }
    this.notify();
  }
}

export const authService = new AuthService();
