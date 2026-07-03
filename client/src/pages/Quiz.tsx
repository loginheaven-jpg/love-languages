import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QUIZ_QUESTIONS, calculateResult } from "@/lib/quizData";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

/*
 * Design: Warm Embrace - Flowing Card Journey
 * One question per screen, organic progress indicator
 * Smooth transitions between questions
 * LocalStorage auto-save for resume capability
 */

const STORAGE_KEY = 'loveLanguageQuiz_progress';

interface SavedProgress {
  answers: (1 | 2 | undefined)[];
  currentIndex: number;
  timestamp: number;
}

function saveProgress(answers: (1 | 2 | undefined)[], currentIndex: number) {
  const data: SavedProgress = {
    answers,
    currentIndex,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: SavedProgress = JSON.parse(raw);
    return data;
  } catch {
    return null;
  }
}

function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function Quiz() {
  const [, navigate] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(1 | 2 | undefined)[]>(
    Array(QUIZ_QUESTIONS.length).fill(undefined)
  );
  const [direction, setDirection] = useState(1);
  const [resumed, setResumed] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    const saved = loadProgress();
    if (saved && saved.answers.some(a => a !== undefined)) {
      setAnswers(saved.answers);
      setCurrentIndex(saved.currentIndex);
      setResumed(true);
      toast.success("이전 진행 상태를 불러왔습니다.", {
        description: `${saved.answers.filter(a => a !== undefined).length}/30 문항 완료`,
      });
    }
  }, []);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const progress = ((currentIndex) / totalQuestions) * 100;
  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const isAnswered = answers[currentIndex] !== undefined;

  const handleSelect = useCallback((option: 1 | 2) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = option;
    setAnswers(newAnswers);

    // Auto-save to localStorage
    const nextIndex = currentIndex < totalQuestions - 1 ? currentIndex + 1 : currentIndex;
    saveProgress(newAnswers, nextIndex);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setDirection(1);
        setCurrentIndex(currentIndex + 1);
      }
    }, 400);
  }, [answers, currentIndex, totalQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
      saveProgress(answers, currentIndex - 1);
    }
  }, [currentIndex, answers]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1 && isAnswered) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
      saveProgress(answers, currentIndex + 1);
    }
  }, [currentIndex, totalQuestions, isAnswered, answers]);

  const handleSubmit = useCallback(() => {
    const validAnswers = answers.filter((a): a is 1 | 2 => a !== undefined);
    if (validAnswers.length === totalQuestions) {
      const result = calculateResult(validAnswers);
      sessionStorage.setItem('quizResult', JSON.stringify(result));
      // Do NOT clear progress here — keep until user starts a new quiz
      navigate('/result');
    }
  }, [answers, totalQuestions, navigate]);

  const handleReset = useCallback(() => {
    clearProgress();
    setAnswers(Array(QUIZ_QUESTIONS.length).fill(undefined));
    setCurrentIndex(0);
    setResumed(false);
    toast.info("처음부터 다시 시작합니다.");
  }, []);

  const canSubmit = answers.every(a => a !== undefined);
  const answeredCount = answers.filter(a => a !== undefined).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FDF8F4' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FDF8F4]/90 border-b border-[#E8736F]/10">
        <div className="container flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#3D3535]/60 hover:text-[#3D3535] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">홈으로</span>
          </button>
          <div className="flex items-center gap-2">
            <img src="/manus-storage/logo-icon_77006ad9.png" alt="Logo" className="w-6 h-6" />
            <span className="font-serif text-sm font-medium text-[#3D3535]">사랑의 언어 진단</span>
          </div>
          <div className="text-sm text-[#3D3535]/50 font-medium">
            {currentIndex + 1} / {totalQuestions}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-[#E8736F]/10">
          <motion.div
            className="h-full rounded-r-full"
            style={{ background: 'linear-gradient(90deg, #E8736F, #F5A623)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
      </header>

      {/* Resume Banner */}
      {resumed && answeredCount > 0 && answeredCount < totalQuestions && (
        <div className="bg-[#F5A623]/10 border-b border-[#F5A623]/20 px-4 py-2">
          <div className="container max-w-lg mx-auto flex items-center justify-between">
            <span className="text-xs text-[#3D3535]/70">
              이전 진행 상태에서 이어서 진행 중 ({answeredCount}/{totalQuestions})
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-[#E8736F] hover:underline font-medium"
            >
              처음부터 다시
            </button>
          </div>
        </div>
      )}

      {/* Question Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Question Number */}
              <div className="text-center mb-8">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#E8736F]/10 text-[#E8736F] font-serif font-bold text-sm">
                  Q{currentQuestion.id}
                </span>
                <p className="mt-4 text-[#3D3535]/50 text-sm">
                  두 가지 중 더 마음에 드는 것을 선택하세요
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <button
                  onClick={() => handleSelect(1)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 active:scale-[0.97] ${
                    answers[currentIndex] === 1
                      ? 'border-[#E8736F] bg-[#E8736F]/5 shadow-md shadow-[#E8736F]/10'
                      : 'border-[#3D3535]/10 bg-white hover:border-[#E8736F]/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                      answers[currentIndex] === 1
                        ? 'border-[#E8736F] bg-[#E8736F]'
                        : 'border-[#3D3535]/20'
                    }`}>
                      {answers[currentIndex] === 1 && (
                        <Heart className="w-3.5 h-3.5 text-white fill-white" />
                      )}
                    </div>
                    <p className={`text-base leading-relaxed ${
                      answers[currentIndex] === 1 ? 'text-[#3D3535] font-medium' : 'text-[#3D3535]/80'
                    }`}>
                      {currentQuestion.option1.text}
                    </p>
                  </div>
                </button>

                <div className="flex items-center justify-center">
                  <span className="text-xs text-[#3D3535]/30 font-medium">OR</span>
                </div>

                <button
                  onClick={() => handleSelect(2)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 active:scale-[0.97] ${
                    answers[currentIndex] === 2
                      ? 'border-[#E8736F] bg-[#E8736F]/5 shadow-md shadow-[#E8736F]/10'
                      : 'border-[#3D3535]/10 bg-white hover:border-[#E8736F]/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                      answers[currentIndex] === 2
                        ? 'border-[#E8736F] bg-[#E8736F]'
                        : 'border-[#3D3535]/20'
                    }`}>
                      {answers[currentIndex] === 2 && (
                        <Heart className="w-3.5 h-3.5 text-white fill-white" />
                      )}
                    </div>
                    <p className={`text-base leading-relaxed ${
                      answers[currentIndex] === 2 ? 'text-[#3D3535] font-medium' : 'text-[#3D3535]/80'
                    }`}>
                      {currentQuestion.option2.text}
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-[#3D3535]/5 py-4 px-4">
        <div className="container max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="text-[#3D3535]/60"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            이전
          </Button>

          {/* Quick navigation dots */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === currentIndex
                    ? 'w-6 bg-[#E8736F]'
                    : answers[i] !== undefined
                    ? 'bg-[#E8736F]/40'
                    : 'bg-[#3D3535]/15'
                }`}
              />
            ))}
          </div>

          {currentIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-[#E8736F] hover:bg-[#D4605C] text-white transition-all duration-200 active:scale-[0.97]"
            >
              결과 보기
              <Heart className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleNext}
              disabled={!isAnswered}
              className="text-[#3D3535]/60"
            >
              다음
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
