import { ExperimentLog, Recommendation, TopicMetric } from '../types/analytics';

export function generateRecommendations(
  logs: ExperimentLog[],
  topicMetrics: TopicMetric[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // If no logs, recommend onboarding starter simulations
  if (logs.length === 0) {
    return [
      {
        id: 'rec-init-1',
        simulationId: 'physics-ohms-law',
        simulationTitle: "Ohm's Law & Circuit Dynamics",
        subject: 'physics',
        topic: 'Electricity & Circuits',
        difficulty: 'Beginner',
        reason: 'Recommended as a foundational interactive circuit experiment to calibrate your laboratory baseline.',
        priority: 'High',
        triggerMetric: 'Initial baseline calibration',
      },
      {
        id: 'rec-init-2',
        simulationId: 'math-linear-equation',
        simulationTitle: 'Linear Equations & Slope Analysis',
        subject: 'mathematics',
        topic: 'Algebra & Functions',
        difficulty: 'Beginner',
        reason: 'Foundational algebra simulation to master coordinate geometry and rate of change.',
        priority: 'Medium',
        triggerMetric: 'Foundational core topic',
      },
      {
        id: 'rec-init-3',
        simulationId: 'chem-ph-scale',
        simulationTitle: 'pH Scale & Acid-Base Equilibrium',
        subject: 'chemistry',
        topic: 'Acids & Bases',
        difficulty: 'Beginner',
        reason: 'Explore logarithmic concentration calculations with visual universal indicators.',
        priority: 'Medium',
        triggerMetric: 'Foundational core topic',
      },
    ];
  }

  // 1. Weak topics (Accuracy < 65% or repeated mistakes)
  const weakTopics = topicMetrics.filter((m) => m.averageAccuracy < 68);
  weakTopics.forEach((wt) => {
    if (wt.topic.toLowerCase().includes('trig') || wt.subject === 'mathematics') {
      recommendations.push({
        id: `rec-weak-${wt.topic.toLowerCase().replace(/\s+/g, '-')}`,
        simulationId: 'math-trig-wave',
        simulationTitle: 'Trigonometric Wave Explorer',
        subject: 'mathematics',
        topic: wt.topic,
        difficulty: 'Beginner',
        reason: `Recommended because your accuracy in "${wt.topic}" is currently ${wt.averageAccuracy}% (<68%). Re-testing foundational wave amplitudes will solidify conceptual mastery.`,
        priority: 'High',
        triggerMetric: `Topic accuracy: ${wt.averageAccuracy}%`,
      });
    } else if (wt.subject === 'physics') {
      recommendations.push({
        id: `rec-weak-phys-${wt.topic.toLowerCase().replace(/\s+/g, '-')}`,
        simulationId: 'physics-pendulum',
        simulationTitle: 'Simple Harmonic Pendulum Oscillator',
        subject: 'physics',
        topic: wt.topic,
        difficulty: 'Beginner',
        reason: `Recommended because your recent accuracy in "${wt.topic}" dropped below 70%. Reinforce restorative force dynamics before tackling complex oscillators.`,
        priority: 'High',
        triggerMetric: `Topic accuracy: ${wt.averageAccuracy}%`,
      });
    }
  });

  // 2. High mistake count logs
  const highMistakeLogs = logs.filter((l) => l.mistakesCount >= 2);
  if (highMistakeLogs.length > 0) {
    const mostRecentMistake = highMistakeLogs[0];
    recommendations.push({
      id: `rec-mistake-${mostRecentMistake.id}`,
      simulationId: mostRecentMistake.simulationId,
      simulationTitle: mostRecentMistake.simulationTitle,
      subject: mostRecentMistake.subject,
      topic: mostRecentMistake.topic,
      difficulty: 'Intermediate',
      reason: `Recommended because you made ${mostRecentMistake.mistakesCount} verification mistakes in your last run. Practicing the parameter variation questions will overcome recurring misconceptions.`,
      priority: 'High',
      triggerMetric: `${mostRecentMistake.mistakesCount} verification mistakes recorded`,
    });
  }

  // 3. High mastery topics (Accuracy > 85%) -> Recommend Next Advanced Simulation
  const masteredTopics = topicMetrics.filter((m) => m.averageAccuracy >= 85 && m.totalAttempts >= 1);
  masteredTopics.forEach((mt) => {
    if (mt.subject === 'physics') {
      recommendations.push({
        id: `rec-adv-physics-${mt.topic.toLowerCase().replace(/\s+/g, '-')}`,
        simulationId: 'physics-spring-mass',
        simulationTitle: 'Spring-Mass Oscillator & Energy Conservation',
        subject: 'physics',
        topic: 'Oscillations & Energy',
        difficulty: 'Intermediate',
        reason: `Recommended because you mastered "${mt.topic}" with ${mt.averageAccuracy}% accuracy. Ready for phase space analysis and Hooke's Law energy conservation.`,
        priority: 'Medium',
        triggerMetric: `Mastery score: ${mt.averageAccuracy}%`,
      });
    } else if (mt.subject === 'chemistry') {
      recommendations.push({
        id: `rec-adv-chem-${mt.topic.toLowerCase().replace(/\s+/g, '-')}`,
        simulationId: 'chem-titration',
        simulationTitle: 'Acid-Base Titration & Equivalence Curves',
        subject: 'chemistry',
        topic: 'Quantitative Analysis',
        difficulty: 'Advanced',
        reason: `Recommended because your chemistry accuracy is stellar (${mt.averageAccuracy}%). Progress to quantitative burette drop titration and stoichiometry.`,
        priority: 'Medium',
        triggerMetric: `Mastery score: ${mt.averageAccuracy}%`,
      });
    } else if (mt.subject === 'mathematics') {
      recommendations.push({
        id: `rec-adv-math-${mt.topic.toLowerCase().replace(/\s+/g, '-')}`,
        simulationId: 'math-calculus-derivative',
        simulationTitle: 'Calculus: Derivative & Instantaneous Rate of Change',
        subject: 'mathematics',
        topic: 'Calculus',
        difficulty: 'Advanced',
        reason: `Recommended because your algebra baseline is strong (${mt.averageAccuracy}%). Elevate to dynamic tangent lines and limit definitions of derivatives.`,
        priority: 'Medium',
        triggerMetric: `Mastery score: ${mt.averageAccuracy}%`,
      });
    }
  });

  // Deduplicate recommendations by simulationId
  const seen = new Set<string>();
  const deduplicated: Recommendation[] = [];

  for (const rec of recommendations) {
    if (!seen.has(rec.simulationId)) {
      seen.add(rec.simulationId);
      deduplicated.push(rec);
    }
    if (deduplicated.length >= 4) break;
  }

  // Ensure at least 2 recommendations
  if (deduplicated.length === 0) {
    deduplicated.push({
      id: 'rec-fallback-1',
      simulationId: 'physics-projectile',
      simulationTitle: 'Kinematic Projectile Motion',
      subject: 'physics',
      topic: 'Classical Mechanics',
      difficulty: 'Intermediate',
      reason: 'Recommended for exploring multi-variable vector kinematics and gravity vectors.',
      priority: 'Medium',
      triggerMetric: 'Curriculum balance',
    });
  }

  return deduplicated;
}
