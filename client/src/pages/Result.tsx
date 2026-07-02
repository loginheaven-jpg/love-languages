import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuizResult, LANGUAGE_INFO, LoveLanguage } from "@/lib/quizData";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, RotateCcw, Share2, Download } from "lucide-react";
import { useLocation } from "wouter";
import RadarChart from "@/components/RadarChart";

/*
 * Design: Warm Embrace - Personalized Result Page
 * Asymmetric layout, radar chart visualization
 * Detailed breakdown with tips
 */

export default function Result() {
  const [, navigate] = useLocation();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('quizResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!result) return null;

  const primaryLang = LANGUAGE_INFO[result.primary];
  const secondaryLang = LANGUAGE_INFO[result.secondary];
  const sortedScores = (Object.entries(result.scores) as [LoveLanguage, number][])
    .sort((a, b) => b[1] - a[1]);

  const handleRetake = () => {
    sessionStorage.removeItem('quizResult');
    navigate('/quiz');
  };

  const handleShare = async () => {
    const text = `나의 사랑의 언어는 "${primaryLang.name}" 입니다! ${primaryLang.icon}\n5가지 사랑의 언어 진단을 해보세요.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: '5가지 사랑의 언어 진단 결과', text });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FDF8F4' }}>
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
            <span className="font-serif text-sm font-medium text-[#3D3535]">진단 결과</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto py-10 px-4">
        {/* Primary Result */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ background: primaryLang.colorLight, color: primaryLang.color }}>
            <Heart className="w-4 h-4" />
            나의 주된 사랑의 언어
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3D3535] mb-3">
            <span style={{ color: primaryLang.color }}>{primaryLang.icon}</span>{' '}
            {primaryLang.name}
          </h1>
          <p className="text-lg text-[#3D3535]/50 font-medium">
            {primaryLang.nameEn}
          </p>
          <p className="mt-6 text-[#3D3535]/70 max-w-xl mx-auto leading-relaxed">
            {primaryLang.description}
          </p>
        </motion.section>

        {/* Chart & Scores */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* Radar Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#3D3535]/5">
            <h3 className="font-serif font-semibold text-[#3D3535] mb-4 text-center">
              나의 사랑의 언어 프로필
            </h3>
            <RadarChart scores={result.scores} />
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#3D3535]/5">
            <h3 className="font-serif font-semibold text-[#3D3535] mb-6 text-center">
              점수 분포
            </h3>
            <div className="space-y-4">
              {sortedScores.map(([key, score], index) => {
                const lang = LANGUAGE_INFO[key];
                const percentage = (score / 30) * 100;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.icon}</span>
                        <span className="text-sm font-medium text-[#3D3535]">
                          {lang.name}
                        </span>
                        {index === 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: lang.colorLight, color: lang.color }}>
                            주 언어
                          </span>
                        )}
                        {index === 1 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                            보조 언어
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold" style={{ color: lang.color }}>
                        {score}점
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: lang.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-[#3D3535]/40 text-center">
              총 30점 만점 (각 열의 합계 = 30)
            </p>
          </div>
        </motion.section>

        {/* Primary Language Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#3D3535]/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: primaryLang.colorLight }}>
                {primaryLang.icon}
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#3D3535] text-lg">
                  {primaryLang.name} 유형의 특징
                </h3>
                <p className="text-xs text-[#3D3535]/50">{primaryLang.nameEn}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[#3D3535] mb-3 text-sm">주요 특성</h4>
                <ul className="space-y-2">
                  {primaryLang.characteristics.map((char, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#3D3535]/70">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: primaryLang.color }} />
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#3D3535] mb-3 text-sm">실천 방법</h4>
                <ul className="space-y-2">
                  {primaryLang.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#3D3535]/70">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#F5A623]" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Secondary Language */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <div className="rounded-3xl p-6 border border-[#3D3535]/5"
            style={{ background: secondaryLang.colorLight + '40' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{secondaryLang.icon}</span>
              <div>
                <h3 className="font-serif font-semibold text-[#3D3535]">
                  보조 사랑의 언어: {secondaryLang.name}
                </h3>
                <p className="text-xs text-[#3D3535]/50">
                  {secondaryLang.nameEn} — {result.scores[result.secondary]}점
                </p>
              </div>
            </div>
            <p className="text-sm text-[#3D3535]/70 leading-relaxed">
              {secondaryLang.description}
            </p>
          </div>
        </motion.section>

        {/* Interpretation Guide */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#3D3535]/5">
            <h3 className="font-serif font-bold text-[#3D3535] text-lg mb-4">
              결과 해석 가이드
            </h3>
            <div className="space-y-4 text-sm text-[#3D3535]/70 leading-relaxed">
              <p>
                <strong className="text-[#3D3535]">주된 사랑의 언어</strong>는 당신이 가장 자연스럽게 사랑을 느끼는 방식입니다.
                이 언어로 사랑을 받을 때 가장 큰 만족감과 안정감을 느낍니다.
              </p>
              <p>
                <strong className="text-[#3D3535]">보조 사랑의 언어</strong>는 두 번째로 중요한 방식입니다.
                주 언어와 함께 충족될 때 관계의 만족도가 높아집니다.
              </p>
              <p>
                두 언어의 점수가 같다면, 당신은 <strong className="text-[#3D3535]">"이중 언어 사용자"</strong>입니다.
                두 가지 방식 모두 동등하게 중요합니다.
              </p>
              <p>
                이 결과를 파트너나 가족과 공유하면, 서로의 사랑 표현 방식을 이해하고
                더 깊은 소통을 할 수 있습니다.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-10"
        >
          <Button
            variant="outline"
            onClick={handleRetake}
            className="border-[#E8736F] text-[#E8736F] hover:bg-[#E8736F] hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 진단하기
          </Button>
          <Button
            onClick={handleShare}
            className="bg-[#E8736F] hover:bg-[#D4605C] text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            결과 공유하기
          </Button>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#3D3535]/10 bg-white">
        <div className="container text-center text-sm text-[#3D3535]/40">
          <p>Based on "The Five Love Languages" by Dr. Gary Chapman</p>
          <p className="mt-1">본 진단은 교육 및 자기이해 목적으로 제공됩니다.</p>
        </div>
      </footer>
    </div>
  );
}
