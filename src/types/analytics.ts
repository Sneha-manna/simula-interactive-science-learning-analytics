import { Subject, Difficulty } from './simulation';

export interface ExperimentLog {
  id: string;
  simulationId: string;
  simulationTitle: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  timestamp: string;
  durationSeconds: number;
  score: number;
  accuracy: number;
  attempts: number;
  mistakesCount: number;
  questionsAnswered: number;
  passed: boolean;
}

export interface TopicMetric {
  topic: string;
  subject: Subject;
  totalAttempts: number;
  averageScore: number;
  averageAccuracy: number;
  timeSpentSeconds: number;
  lastAttemptDate: string;
  status: 'Needs Practice' | 'Proficient' | 'Mastered';
}

export interface SubjectAnalytics {
  subject: Subject;
  averageScore: number;
  averageAccuracy: number;
  simulationsCompleted: number;
  totalTimeMinutes: number;
  topicsCount: number;
}

export interface Recommendation {
  id: string;
  simulationId: string;
  simulationTitle: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  triggerMetric: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  subject?: Subject;
  unlockedAt?: string;
  isUnlocked: boolean;
  criteria: string;
}

export interface AnalyticsSummary {
  overallLearningScore: number;
  overallAccuracy: number;
  totalSimulationsRun: number;
  totalTimeMinutes: number;
  currentStreakDays: number;
  strongestSubject: Subject;
  weakestSubject: Subject;
  strongTopics: string[];
  weakTopics: string[];
  subjectBreakdown: Record<Subject, SubjectAnalytics>;
  topicMetrics: TopicMetric[];
  recommendations: Recommendation[];
  accuracyTrend: { date: string; accuracy: number; score: number }[];
  weeklyActivity: { day: string; minutes: number; experiments: number }[];
}
