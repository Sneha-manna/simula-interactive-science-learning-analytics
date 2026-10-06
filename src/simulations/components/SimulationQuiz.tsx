import React, { useState } from 'react';
import { CheckCircle, XCircle, HelpCircle, ArrowRight, Award } from 'lucide-react';
import { QuizQuestion } from '../../types/simulation';

interface SimulationQuizProps {
  questions: QuizQuestion[];
  onFinishQuiz: (stats: { correctCount: number; totalCount: number; answers: number[] }) => void;
}

export const SimulationQuiz: React.FC<SimulationQuizProps> = ({ questions, onFinishQuiz }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [submittedCurrent, setSubmittedCurrent] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <HelpCircle className="w-10 h-10 mx-auto mb-2 text-slate-500" />
        <p>No verification questions are registered for this simulation.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selected = selectedOptions[currentIndex];
  const isAnswered = selected !== undefined;
  const isCorrect = isAnswered && selected === currentQ.correctIndex;

  const handleSelect = (index: number) => {
    if (submittedCurrent) return;
    setSelectedOptions((prev) => ({ ...prev, [currentIndex]: index }));
  };

  const handleConfirmAnswer = () => {
    setSubmittedCurrent(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSubmittedCurrent(selectedOptions[currentIndex + 1] !== undefined);
    } else {
      // Calculate results
      let correct = 0;
      const ansArr: number[] = [];
      questions.forEach((q, idx) => {
        const choice = selectedOptions[idx] ?? -1;
        ansArr.push(choice);
        if (choice === q.correctIndex) correct++;
      });
      setShowSummary(true);
      onFinishQuiz({
        correctCount: correct,
        totalCount: questions.length,
        answers: ansArr,
      });
    }
  };

  if (showSummary) {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedOptions[idx] === q.correctIndex) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);

    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
        <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Verification Assessment Complete</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          You answered {correct} out of {questions.length} questions correctly ({pct}% accuracy).
        </p>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setSelectedOptions({});
              setCurrentIndex(0);
              setSubmittedCurrent(false);
              setShowSummary(false);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      {/* Quiz Header & Progress */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-5 h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-cyan-400'
                  : selectedOptions[idx] !== undefined
                  ? 'bg-emerald-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <h4 className="text-base font-semibold text-slate-100 mb-4">
        {currentQ.question}
      </h4>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {currentQ.options.map((opt, idx) => {
          const isThisSelected = selected === idx;
          let optStyle = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40';

          if (submittedCurrent) {
            if (idx === currentQ.correctIndex) {
              optStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold';
            } else if (isThisSelected) {
              optStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
            } else {
              optStyle = 'border-slate-800/40 bg-slate-950/30 text-slate-500';
            }
          } else if (isThisSelected) {
            optStyle = 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-semibold ring-1 ring-cyan-400/40';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={submittedCurrent}
              className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${optStyle}`}
            >
              <span>{opt}</span>
              {submittedCurrent && idx === currentQ.correctIndex && (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {submittedCurrent && isThisSelected && idx !== currentQ.correctIndex && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation after submission */}
      {submittedCurrent && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed mb-4 ${
            isCorrect
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}
        >
          <span className="font-bold block mb-1">
            {isCorrect ? '✓ Correct Answer!' : '✗ Explanation:'}
          </span>
          {currentQ.explanation}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
        {!submittedCurrent ? (
          <button
            onClick={handleConfirmAnswer}
            disabled={!isAnswered}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isAnswered
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
