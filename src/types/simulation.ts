export type Subject = 'mathematics' | 'physics' | 'chemistry';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ControlDefinition {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  description?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface SimulationExplanation {
  concept: string;
  whatWeChange: string;
  whatHappens: string;
  whyItHappens: string;
  formula: string;
  takeaway: string;
}

export interface SimulationMetadata {
  id: string;
  title: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  description: string;
  learningObjectives: string[];
  prerequisites: string[];
  explanation: SimulationExplanation;
  controls: ControlDefinition[];
  questions: QuizQuestion[];
  recommendedNextTopics: string[];
  isImplemented: boolean;
  badgeCode?: string;
}

export interface ExperimentRunResult {
  simulationId: string;
  simulationTitle: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  timeSpentSeconds: number;
  attemptsCount: number;
  correctAnswers: number;
  totalQuestions: number;
  score: number; // 0 - 100
  accuracy: number; // 0 - 100
  conceptUnderstanding: 'Needs Review' | 'Developing' | 'Good' | 'Mastered';
  strengths: string[];
  weaknesses: string[];
  recommendedSimulationId?: string;
  timestamp: string;
}
