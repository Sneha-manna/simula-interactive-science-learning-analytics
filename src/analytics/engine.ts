import { ExperimentLog, AnalyticsSummary, TopicMetric, SubjectAnalytics } from '../types/analytics';
import { Subject } from '../types/simulation';
import { generateRecommendations } from './recommendations';

export function computeAnalyticsSummary(logs: ExperimentLog[]): AnalyticsSummary {
  const subjects: Subject[] = ['mathematics', 'physics', 'chemistry'];

  if (logs.length === 0) {
    const defaultSubjectBreakdown = subjects.reduce((acc, subj) => {
      acc[subj] = {
        subject: subj,
        averageScore: 0,
        averageAccuracy: 0,
        simulationsCompleted: 0,
        totalTimeMinutes: 0,
        topicsCount: 0,
      };
      return acc;
    }, {} as Record<Subject, SubjectAnalytics>);

    return {
      overallLearningScore: 0,
      overallAccuracy: 0,
      totalSimulationsRun: 0,
      totalTimeMinutes: 0,
      currentStreakDays: 0,
      strongestSubject: 'mathematics',
      weakestSubject: 'mathematics',
      strongTopics: [],
      weakTopics: [],
      subjectBreakdown: defaultSubjectBreakdown,
      topicMetrics: [],
      recommendations: generateRecommendations([], []),
      accuracyTrend: [],
      weeklyActivity: [
        { day: 'Mon', minutes: 0, experiments: 0 },
        { day: 'Tue', minutes: 0, experiments: 0 },
        { day: 'Wed', minutes: 0, experiments: 0 },
        { day: 'Thu', minutes: 0, experiments: 0 },
        { day: 'Fri', minutes: 0, experiments: 0 },
        { day: 'Sat', minutes: 0, experiments: 0 },
        { day: 'Sun', minutes: 0, experiments: 0 },
      ],
    };
  }

  // Calculate totals
  const totalScore = logs.reduce((sum, l) => sum + l.score, 0);
  const totalAccuracy = logs.reduce((sum, l) => sum + l.accuracy, 0);
  const totalSeconds = logs.reduce((sum, l) => sum + l.durationSeconds, 0);

  const overallLearningScore = Math.round(totalScore / logs.length);
  const overallAccuracy = Math.round(totalAccuracy / logs.length);
  const totalTimeMinutes = Math.round(totalSeconds / 60);

  // Group by topic
  const topicMap = new Map<string, {
    topic: string;
    subject: Subject;
    logs: ExperimentLog[];
  }>();

  logs.forEach((log) => {
    const existing = topicMap.get(log.topic);
    if (existing) {
      existing.logs.push(log);
    } else {
      topicMap.set(log.topic, {
        topic: log.topic,
        subject: log.subject,
        logs: [log],
      });
    }
  });

  const topicMetrics: TopicMetric[] = Array.from(topicMap.values()).map(({ topic, subject, logs: tLogs }) => {
    const avgScore = Math.round(tLogs.reduce((s, l) => s + l.score, 0) / tLogs.length);
    const avgAcc = Math.round(tLogs.reduce((s, l) => s + l.accuracy, 0) / tLogs.length);
    const timeSpent = tLogs.reduce((s, l) => s + l.durationSeconds, 0);

    let status: 'Needs Practice' | 'Proficient' | 'Mastered' = 'Proficient';
    if (avgAcc >= 85 && avgScore >= 85) {
      status = 'Mastered';
    } else if (avgAcc < 65 || avgScore < 65) {
      status = 'Needs Practice';
    }

    // Sort by timestamp to find last
    const sorted = [...tLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      topic,
      subject,
      totalAttempts: tLogs.length,
      averageScore: avgScore,
      averageAccuracy: avgAcc,
      timeSpentSeconds: timeSpent,
      lastAttemptDate: sorted[0]?.timestamp || new Date().toISOString(),
      status,
    };
  });

  // Identify Strong & Weak Topics
  const weakTopics = topicMetrics
    .filter((m) => m.averageAccuracy < 70 || m.status === 'Needs Practice')
    .sort((a, b) => a.averageAccuracy - b.averageAccuracy)
    .map((m) => m.topic);

  const strongTopics = topicMetrics
    .filter((m) => m.averageAccuracy >= 80 && m.totalAttempts >= 1)
    .sort((a, b) => b.averageAccuracy - a.averageAccuracy)
    .map((m) => m.topic);

  // Subject breakdown
  const subjectBreakdown = subjects.reduce((acc, subj) => {
    const subjLogs = logs.filter((l) => l.subject === subj);
    const subjTopics = new Set(subjLogs.map((l) => l.topic)).size;
    const completedSims = new Set(subjLogs.map((l) => l.simulationId)).size;
    const sTime = Math.round(subjLogs.reduce((s, l) => s + l.durationSeconds, 0) / 60);

    const sScore = subjLogs.length > 0
      ? Math.round(subjLogs.reduce((s, l) => s + l.score, 0) / subjLogs.length)
      : 0;

    const sAcc = subjLogs.length > 0
      ? Math.round(subjLogs.reduce((s, l) => s + l.accuracy, 0) / subjLogs.length)
      : 0;

    acc[subj] = {
      subject: subj,
      averageScore: sScore,
      averageAccuracy: sAcc,
      simulationsCompleted: completedSims,
      totalTimeMinutes: sTime,
      topicsCount: subjTopics,
    };
    return acc;
  }, {} as Record<Subject, SubjectAnalytics>);

  // Determine strongest and weakest subjects
  const rankedSubjects = subjects
    .map((s) => ({ subject: s, score: subjectBreakdown[s].averageScore }))
    .sort((a, b) => b.score - a.score);

  const strongestSubject = rankedSubjects[0]?.subject || 'mathematics';
  const weakestSubject = rankedSubjects[rankedSubjects.length - 1]?.subject || 'mathematics';

  // Chronological accuracy trend (chronological order)
  const chronologicalLogs = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const accuracyTrend = chronologicalLogs.slice(-10).map((l) => {
    const d = new Date(l.timestamp);
    const dateFormatted = `${d.getMonth() + 1}/${d.getDate()}`;
    return {
      date: dateFormatted,
      accuracy: l.accuracy,
      score: l.score,
    };
  });

  // Calculate streak
  const uniqueDates = Array.from(
    new Set(logs.map((l) => new Date(l.timestamp).toISOString().split('T')[0]))
  ).sort();
  const currentStreakDays = Math.min(uniqueDates.length, 7);

  // Weekly activity distribution
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayBuckets: Record<string, { minutes: number; experiments: number }> = {};
  dayNames.forEach((name) => {
    dayBuckets[name] = { minutes: 0, experiments: 0 };
  });

  logs.forEach((log) => {
    const d = new Date(log.timestamp);
    const day = dayNames[d.getDay()];
    if (dayBuckets[day]) {
      dayBuckets[day].minutes += Math.round(log.durationSeconds / 60);
      dayBuckets[day].experiments += 1;
    }
  });

  const weeklyActivity = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    minutes: dayBuckets[day]?.minutes || 0,
    experiments: dayBuckets[day]?.experiments || 0,
  }));

  // Recommendations
  const recommendations = generateRecommendations(logs, topicMetrics);

  return {
    overallLearningScore,
    overallAccuracy,
    totalSimulationsRun: logs.length,
    totalTimeMinutes,
    currentStreakDays,
    strongestSubject,
    weakestSubject,
    strongTopics,
    weakTopics,
    subjectBreakdown,
    topicMetrics,
    recommendations,
    accuracyTrend,
    weeklyActivity,
  };
}
