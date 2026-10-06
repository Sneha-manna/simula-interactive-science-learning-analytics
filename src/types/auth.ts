export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  gradeLevel?: string;
  joinedDate: string;
  targetGoalHours?: number;
  streakDays?: number;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  gradeLevel: string;
  joinedDate: string;
  avatar: string;
  targetGoalHours: number;
  streakDays: number;
  resetToken?: string;
  resetTokenExpiry?: number;
}
