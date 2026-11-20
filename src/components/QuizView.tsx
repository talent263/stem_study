import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, ChevronRight, HelpCircle, Sparkles, Plus, PencilLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { QuizQuestion } from '../types/index.ts';

const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Software Architecture & Design Patterns (SE201)',
    question: 'In the Observer pattern, what is the primary benefit of decoupling the Subject from the Observers?',
    options: [
      'It enforces all observers to execute synchronously on the main thread.',
      'The Subject can notify an arbitrary number of Observers without knowing their concrete classes.',
      'It completely removes the need for memory allocation.',
      'It restricts notifications to only one subscriber at a time.',
    ],
    correctIndex: 1,
    explanation: 'The Observer pattern establishes a 1-to-many dependency so that when one object modifies state, all dependents are notified and updated automatically without tight coupling to concrete observer implementations.',
  },
  {
    id: 'q2',
    topic: 'Algorithm Analysis & Complexity (CS101)',
    question: 'Given the recurrence relation T(n) = 2T(n/2) + O(n), what is the asymptotic runtime complexity according to the Master Theorem?',
    options: [
      'O(n)',
      'O(n log n)',
      'O(n²)',
      'O(2ⁿ)',
    ],
    correctIndex: 1,
    explanation: 'Here a=2, b=2, so log_b(a) = log_2(2) = 1. Since f(n) = O(n¹) = Theta(n^(log_b(a))), Case 2 of the Master Theorem applies: T(n) = Theta(n log n). This is the exact recurrence of Merge Sort.',
  },
  {
    id: 'q3',
    topic: 'Relational & NoSQL Database Modeling (UZ DB)',
    question: 'When designing a scalable schema in MongoDB for audit logs or chat messages, why is an unbounded array in a single document discouraged?',
    options: [
      'MongoDB documents have a strict 16MB maximum document size limit, which unbounded arrays will eventually exceed.',
      'Arrays in MongoDB can only hold numbers, not strings or objects.',
      'Indexes cannot be created on MongoDB document fields.',
      'JSON does not support nested elements.',
    ],
    correctIndex: 0,
    explanation: 'MongoDB enforces a 16MB BSON document size limit. Unbounded lists (such as continuous audit trails or chat logs) must be modeled as separate documents in a dedicated collection to prevent document truncation and high reallocation costs.',
  },
  {
    id: 'q4',
    topic: 'Calculus & Engineering Mathematics (MTH204)',
    question: 'What is the Laplace transform of the function f(t) = e^(3t)?',
    options: [
      '1 / (s + 3)',
      '3 / s',
      '1 / (s - 3)',
      's / (s² + 9)',
    ],
    correctIndex: 2,
    explanation: 'By the standard Laplace transform definition L{e^(at)} = 1 / (s - a) for s > a. Here a = 3, so L{e^(3t)} = 1 / (s - 3).',
  },
  {
    id: 'q5',
    topic: 'Embedded Systems & Computer Engineering (EE302)',
    question: 'In an ARM Cortex-M microcontroller, what register operation is used to set bit 5 of the GPIOA_ODR register without altering any other pin states?',
    options: [
      'GPIOA_ODR = 5;',
      'GPIOA_ODR |= (1 << 5);',
      'GPIOA_ODR &= ~(1 << 5);',
      'GPIOA_ODR ^= 0xFF;',
    ],
    correctIndex: 1,
    explanation: 'Bitwise OR with a mask (1 << 5) sets bit 5 to 1 while leaving all other bits unchanged.',
  },
];

const EMPTY_DRAFT = {
  topic: '',
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
};

export const QuizView: React.FC = () => {
  const { user } = useAuth();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(SAMPLE_QUIZ);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState(EMPTY_DRAFT);

  const activeQuiz = quizQuestions.length > 0 ? quizQuestions : SAMPLE_QUIZ;
  const currentQ = activeQuiz[currentIndex];
  const hasAnswered = selectedAnswers[currentIndex] !== undefined;
  const canManageQuiz = user?.role === 'TUTOR' || user?.role === 'ADMIN';

  const handleSelectOption = (optionIdx: number) => {
    if (hasAnswered) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentIndex < activeQuiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    activeQuiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleDraftOptionChange = (index: number, value: string) => {
    setDraftQuestion((prev) => ({
      ...prev,
      options: prev.options.map((option, optionIndex) => (optionIndex === index ? value : option)),
    }));
  };

  const handleSaveQuestion = () => {
    const trimmedTopic = draftQuestion.topic.trim();
    const trimmedQuestion = draftQuestion.question.trim();
    const filledOptions = draftQuestion.options.map((option) => option.trim());
    const hasValidOptions = filledOptions.every((option) => option.length > 0);

    if (!trimmedTopic || !trimmedQuestion || !hasValidOptions) {
      return;
    }

    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      topic: trimmedTopic,
      question: trimmedQuestion,
      options: filledOptions,
      correctIndex: draftQuestion.correctIndex,
      explanation: draftQuestion.explanation.trim() || 'This question was added by a tutor for the active study set.',
    };

    setQuizQuestions((prev) => [...prev, newQuestion]);
    setDraftQuestion(EMPTY_DRAFT);
    setIsQuizBuilderOpen(false);
    setCurrentIndex(Math.max(0, quizQuestions.length));
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleResetQuiz = () => {
    setQuizQuestions(SAMPLE_QUIZ);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const totalScore = calculateScore();
  const percentage = Math.round((totalScore / activeQuiz.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            STEM Mastery Practice Assessment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test your knowledge across Software Engineering, Algorithms, Databases, and Applied Math.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManageQuiz && (
            <button
              type="button"
              onClick={() => setIsQuizBuilderOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-[11px] font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Set New Quiz</span>
            </button>
          )}
          <div className="text-right">
            <span className="text-xs text-slate-400">Question</span>
            <p className="font-mono font-bold text-indigo-300 text-sm">
              {currentIndex + 1} / {activeQuiz.length}
            </p>
          </div>
        </div>
      </div>

      {canManageQuiz && isQuizBuilderOpen && (
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-indigo-200">
              <PencilLine className="h-4 w-4" />
              <h3 className="text-sm font-bold uppercase tracking-[0.18em]">Build a custom quiz</h3>
            </div>
            <button
              type="button"
              onClick={handleResetQuiz}
              className="text-[11px] font-semibold text-slate-300 hover:text-white"
            >
              Reset sample quiz
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-slate-300">Topic</label>
              <input
                type="text"
                value={draftQuestion.topic}
                onChange={(e) => setDraftQuestion((prev) => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g. Database Normalization"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-slate-300">Question</label>
              <textarea
                rows={3}
                value={draftQuestion.question}
                onChange={(e) => setDraftQuestion((prev) => ({ ...prev, question: e.target.value }))}
                placeholder="Write the assessment question..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {draftQuestion.options.map((option, idx) => (
              <div key={idx}>
                <label className="mb-1 block text-[11px] font-semibold text-slate-300">Option {idx + 1}</label>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleDraftOptionChange(idx, e.target.value)}
                  placeholder={`Choice ${String.fromCharCode(65 + idx)}`}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-slate-300">Correct answer</label>
              <select
                value={draftQuestion.correctIndex}
                onChange={(e) => setDraftQuestion((prev) => ({ ...prev, correctIndex: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {draftQuestion.options.map((_, idx) => (
                  <option key={idx} value={idx}>
                    Option {idx + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-slate-300">Explanation</label>
              <textarea
                rows={2}
                value={draftQuestion.explanation}
                onChange={(e) => setDraftQuestion((prev) => ({ ...prev, explanation: e.target.value }))}
                placeholder="Explain why this answer is correct..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveQuestion}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Add question to quiz
            </button>
          </div>
        </div>
      )}

      {!showResults ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / activeQuiz.length) * 100}%` }}
            />
          </div>

          {/* Topic Badge */}
          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {currentQ.topic}
          </span>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let btnClass = 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200';

              if (hasAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                } else if (isSelected) {
                  btnClass = 'bg-rose-950/60 border-rose-500 text-rose-200';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {hasAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation box after answer */}
          {hasAnswered && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <HelpCircle className="w-4 h-4" />
                <span>Explanation & Syllabus Reference:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Bottom Action */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!hasAnswered}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>{currentIndex === activeQuiz.length - 1 ? 'View Final Results' : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Quiz Completed!</h2>
            <p className="text-xs text-slate-400 mt-1">Here is how you scored on the STEM practice assessment:</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-sm mx-auto">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Your Score</span>
            <p className="text-5xl font-extrabold font-mono text-white mt-1">
              {totalScore} / {activeQuiz.length}
            </p>
            <p className="text-sm font-semibold text-emerald-400 mt-2">
              {percentage}% Proficiency
            </p>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {percentage >= 80
              ? 'Excellent mastery of core STEM modules! You are well prepared for examination assessments.'
              : 'Good effort! Review the lecture notes and past papers in the Academic Resources hub to boost your retention.'}
          </p>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
};
