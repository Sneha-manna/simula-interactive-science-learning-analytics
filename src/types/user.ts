export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  gradeLevel: string;
  joinedDate: string;
  targetGoalHours: number;
  streakDays?: number;
}

export type UserProfile = StudentProfile;
