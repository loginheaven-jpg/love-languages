import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuizResult, LANGUAGE_INFO, LoveLanguage, calculateResult } from "@/lib/quizData";
import { generateResultPdf } from "@/lib/generatePdf";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, RotateCcw, Share2, Download, Loader2, Link2, Users, ArrowRight } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import RadarChart from "@/components/RadarChart";
import { toast } from "sonner";

/*
 * Design: Warm Embrace - Personalized Result Page
 * Asymmetric layout, radar chart visualization
 * Detailed breakdown with tips
 * PDF download & share link functionality
 * Supports URL-based result sharing via encoded scores
 */

// Encode scores into a compact URL parameter: A-B-C-D-E format
function encodeScores(scores: Record<LoveLanguage, number>): string {
  return `${scores.A}-${scores.B}-${scores.C}-${scores.D}-${scores.E}`;
}

// Decode scores from URL parameter
function decodeScores(encoded: string): QuizResult | null {
  try {
    const parts = encoded.split('-').map(Number);
    if (parts.length !== 5 || parts.some(isNaN) || parts.some(n => n < 0 || n > 30)) {
      return null;
    }
    const scores: Record<LoveLanguage, number> = {
      A: parts[0], B: parts[1], C: parts[2], D: parts[3], E: parts[4],
    };
    const sorted = (Object.entries(scores) as [LoveLanguage, number][])
      .sort((a, b) => b[1] - a[1]);
    return {
      scores,
      primary: sorted[0][0],
      secondary: sorted[1][0],
      answers: [], // Not available from shared link
    };
  } catch {
    return null;
  }
}

export default function Result() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    // First try URL params (shared link)
    const params = new URLSearchParams(searchString);
    const scoresParam = params.get('s');
    if (scoresParam) {
      const decoded = decodeScores(scoresParam);
      if (decoded) {
        setResult(decoded);
        setIsShared(true);
        return;
      }
    }

    // Then try sessionStorage (just completed quiz)
    const stored = sessionStorage.getItem('quizResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate('/');
    }
  }, [navigate, searchString]);

  if (!result) return null;

  const primaryLang = LANGUAGE_INFO[result.primary];
  const secondaryLang = LANGUAGE_INFO[result.secondary];
  const sortedScores = (Object.entries(result.scores) as [LoveLanguage, number][])
    .sort((a, b) => b[1] - a[1]);

  const handleRetake = () => {
    sessionStorage.removeItem('quizResult');
    localStorage.removeItem('loveLanguageQuiz_progress');
    navigate('/quiz');
  };

  const handleShare = async () => {
    const encoded = encodeScores(result.scores);
    const shareUrl = `${window.location.origin}/result?s=${encoded}`;
    const shareText = `[예봄 부부의 삶] 나의 사랑의 언어 진단 결과\n\n` +
      `주 언어: ${primaryLang.icon} ${primaryLang.name} (${result.scores[result.primary]}점)\n` +
      `보조 언어: ${secondaryLang.icon} ${secondaryLang.name} (${result.scores[result.secondary]}점)\n\n` +
      `결과 보기: ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("결과 링크가 클립보드에 복사되었습니다!", {
        description: "카카오톡이나 메시지에 붙여넣기 하세요.",
      });
    } catch {
      // Fallback: create a temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success("결과 링크가 클립보드에 복사되었습니다!");
    }
  };

  const handlePdfDownload = async () => {
    setIsPdfLoading(true);
    try {
      const { isMobile } = await generateResultPdf(result);
      if (isMobile) {
        toast.success("PDF가 새 탭에서 열렸습니다.", {
          description: "우측 상단 다운로드 아이콘을 눌러 저장하세요. 파일명: 예봄-사랑의언어_진단결과",
          duration: 8000,
        });
      } else {
        toast.success("PDF가 다운로드되었습니다!", {
          description: "파일명: 예봄-사랑의언어_진단결과 (다운로드 폴더에서 확인)",
          duration: 5000,
        });
      }
    } catch (e) {
      toast.error("PDF 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsPdfLoading(false);
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
        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <span className="text-sm text-[#3D3535]/40 font-medium tracking-wide">예봄 부부의 삶</span>
        </motion.div>

        {/* Shared badge */}
        {isShared && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
              <Link2 className="w-3 h-3" />
              공유된 결과를 보고 있습니다
            </span>
          </motion.div>
        )}

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

        {/* Shared link CTA - 나도 진단해보기 */}
        {isShared && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-[#E8736F]/10 to-[#F5A623]/10 rounded-3xl p-8 border border-[#E8736F]/20 text-center">
              <h3 className="font-serif font-bold text-[#3D3535] text-xl mb-2">
                나의 사랑의 언어도 궁금하신가요?
              </h3>
              <p className="text-sm text-[#3D3535]/60 mb-6">
                30개의 질문으로 나만의 사랑 표현법을 발견해보세요. 약 5분이면 충분합니다.
              </p>
              <Button
                size="lg"
                className="bg-[#E8736F] hover:bg-[#D4605C] text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-[#E8736F]/20 transition-all duration-200 active:scale-[0.97]"
                onClick={() => {
                  localStorage.removeItem('loveLanguageQuiz_progress');
                  navigate('/quiz');
                }}
              >
                나도 진단해보기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.section>
        )}

        {/* Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-10"
        >
          <Button
            variant="outline"
            onClick={handleRetake}
            className="border-[#3D3535]/20 text-[#3D3535]/70 hover:bg-[#3D3535]/5"
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
          <Button
            onClick={handlePdfDownload}
            disabled={isPdfLoading}
            variant="outline"
            className="border-[#E8736F] text-[#E8736F] hover:bg-[#E8736F] hover:text-white"
          >
            {isPdfLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            PDF 저장
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/compare?a=${encodeScores(result.scores)}`)}
            className="border-[#7B68EE] text-[#7B68EE] hover:bg-[#7B68EE] hover:text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            결과 비교하기
          </Button>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#3D3535]/10 bg-white">
        <div className="container text-center">
          <p className="text-sm text-[#3D3535]/60 font-medium mb-1">예봄 부부의 삶</p>
          <p className="text-xs text-[#3D3535]/40">Based on "The Five Love Languages" by Dr. Gary Chapman</p>
          <p className="text-xs text-[#3D3535]/40 mt-0.5">본 진단은 교육 및 자기이해 목적으로 제공됩니다.</p>
        </div>
      </footer>
    </div>
  );
}
