import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LANGUAGE_INFO, LoveLanguage } from "@/lib/quizData";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Heart, Link2, ArrowRight, FileDown, Loader2 } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { generateComparePdf } from "@/lib/generatePdf";

/*
 * Design: Warm Embrace - Compare Page
 * Side-by-side comparison of two people's love language results
 * Accepts shared links or manual score input
 */

interface CompareResult {
  scores: Record<LoveLanguage, number>;
  primary: LoveLanguage;
  secondary: LoveLanguage;
}

function decodeScores(encoded: string): CompareResult | null {
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
    };
  } catch {
    return null;
  }
}

function extractScoresFromUrl(url: string): string | null {
  try {
    // Handle full URL or just the query param
    if (url.includes('?s=')) {
      const match = url.match(/[?&]s=([0-9-]+)/);
      return match ? match[1] : null;
    }
    // Handle raw score format like "10-8-5-4-3"
    if (/^\d+-\d+-\d+-\d+-\d+$/.test(url.trim())) {
      return url.trim();
    }
    return null;
  } catch {
    return null;
  }
}

export default function Compare() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [link1, setLink1] = useState("");
  const [link2, setLink2] = useState("");
  const [result1, setResult1] = useState<CompareResult | null>(null);
  const [result2, setResult2] = useState<CompareResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const name1 = "나";
  const name2 = "배우자";
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handlePdfDownload = async () => {
    if (!result1 || !result2) return;
    setIsPdfLoading(true);
    try {
      const { isMobile } = await generateComparePdf(result1, result2);
      if (isMobile) {
        toast.success("PDF가 새 탭에서 열렸습니다", {
          description: "페이지 상단의 '📥 PDF 저장하기' 버튼을 눌러 저장하세요.",
          duration: 6000,
        });
      } else {
        toast.success("커플 비교 PDF가 다운로드되었습니다", {
          description: "다운로드 폴더에서 확인하세요.",
        });
      }
    } catch (err) {
      toast.error("PDF 생성에 실패했습니다");
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Check URL params for pre-loaded comparison
  useMemo(() => {
    const params = new URLSearchParams(searchString);
    const s1 = params.get('a');
    const s2 = params.get('b');
    if (s1 && s2) {
      // Both provided — show results immediately
      const r1 = decodeScores(s1);
      const r2 = decodeScores(s2);
      if (r1 && r2) {
        setResult1(r1);
        setResult2(r2);
        setShowResults(true);
        setLink1(s1);
        setLink2(s2);
      }
    } else if (s1) {
      // Only A (my result) provided — pre-fill and wait for B
      const r1 = decodeScores(s1);
      if (r1) {
        setResult1(r1);
        setLink1(s1);
      }
    }
  }, [searchString]);

  const handleCompare = () => {
    const scores1 = extractScoresFromUrl(link1);
    const scores2 = extractScoresFromUrl(link2);

    if (!scores1) {
      toast.error("첫 번째 링크가 올바르지 않습니다.", {
        description: "결과 공유하기로 복사된 링크를 붙여넣어 주세요.",
      });
      return;
    }
    if (!scores2) {
      toast.error("두 번째 링크가 올바르지 않습니다.", {
        description: "결과 공유하기로 복사된 링크를 붙여넣어 주세요.",
      });
      return;
    }

    const r1 = decodeScores(scores1);
    const r2 = decodeScores(scores2);

    if (!r1 || !r2) {
      toast.error("점수 데이터를 해석할 수 없습니다.");
      return;
    }

    setResult1(r1);
    setResult2(r2);
    setShowResults(true);
  };

  const languages: LoveLanguage[] = ['A', 'B', 'C', 'D', 'E'];

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
            <span className="font-serif text-sm font-medium text-[#3D3535]">결과 비교</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto py-10 px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7B68EE]/10 text-[#7B68EE] text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            사랑의 언어 비교
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3D3535] mb-3">
            두 사람의 사랑의 언어를 비교해보세요
          </h1>
          <p className="text-[#3D3535]/60">
            각자의 진단 결과 공유 링크를 입력하면 사랑의 언어를 나란히 비교할 수 있습니다.
          </p>
        </motion.div>

        {/* Input Section */}
        {!showResults && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#3D3535]/5 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#3D3535] mb-2">
                    <Heart className="w-4 h-4 inline mr-1 text-[#E8736F]" />
                    나의 결과
                  </label>
                  <Input
                    value={link1}
                    onChange={(e) => setLink1(e.target.value)}
                    placeholder="결과 공유 링크 또는 점수 (예: 10-8-5-4-3)"
                    className={`border-[#3D3535]/10 ${result1 ? 'bg-[#E8736F]/5 border-[#E8736F]/30' : ''}`}
                    readOnly={!!result1}
                  />
                  {result1 && (
                    <p className="text-xs text-[#E8736F] mt-1 font-medium">
                      ✓ 내 진단 결과가 자동으로 입력되었습니다
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D3535] mb-2">
                    <Heart className="w-4 h-4 inline mr-1 text-[#7B68EE]" />
                    배우자의 결과
                  </label>
                  <Input
                    value={link2}
                    onChange={(e) => setLink2(e.target.value)}
                    placeholder="배우자의 공유 링크 또는 점수를 붙여넣으세요"
                    className="border-[#3D3535]/10"
                    autoFocus={!!result1}
                  />
                </div>
                <Button
                  onClick={handleCompare}
                  className="w-full bg-[#7B68EE] hover:bg-[#6A5ACD] text-white py-6 text-lg rounded-2xl"
                >
                  <Users className="w-5 h-5 mr-2" />
                  비교하기
                </Button>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#FDF8F4] border border-[#3D3535]/5">
                <p className="text-xs text-[#3D3535]/50 leading-relaxed">
                  <strong className="text-[#3D3535]/70">사용 방법:</strong> 내 결과는 자동으로 채워져 있습니다. 배우자가 진단을 완료한 후 "결과 공유하기"로 복사한 링크를 아래에 붙여넣으세요.
                  또는 점수를 직접 입력할 수도 있습니다 (인정하는말-함께하는시간-선물-봉사-스킨십 순서).
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Comparison Results */}
        <AnimatePresence>
          {showResults && result1 && result2 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Primary Languages */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8736F]/20 text-center">
                  <p className="text-xs text-[#3D3535]/50 mb-2 font-medium">{name1}</p>
                  <div className="text-3xl mb-2">{LANGUAGE_INFO[result1.primary].icon}</div>
                  <h3 className="font-serif font-bold text-[#3D3535] text-lg">
                    {LANGUAGE_INFO[result1.primary].name}
                  </h3>
                  <p className="text-xs text-[#3D3535]/50 mt-1">{LANGUAGE_INFO[result1.primary].nameEn}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#7B68EE]/20 text-center">
                  <p className="text-xs text-[#3D3535]/50 mb-2 font-medium">{name2}</p>
                  <div className="text-3xl mb-2">{LANGUAGE_INFO[result2.primary].icon}</div>
                  <h3 className="font-serif font-bold text-[#3D3535] text-lg">
                    {LANGUAGE_INFO[result2.primary].name}
                  </h3>
                  <p className="text-xs text-[#3D3535]/50 mt-1">{LANGUAGE_INFO[result2.primary].nameEn}</p>
                </div>
              </section>

              {/* Score Comparison Chart */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-[#3D3535]/5 mb-8">
                <h3 className="font-serif font-semibold text-[#3D3535] mb-6 text-center text-lg">
                  점수 비교
                </h3>
                <div className="space-y-6">
                  {languages.map((key) => {
                    const lang = LANGUAGE_INFO[key];
                    const score1 = result1.scores[key];
                    const score2 = result2.scores[key];
                    const maxScore = Math.max(score1, score2, 1);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-lg">{lang.icon}</span>
                          <span className="text-sm font-medium text-[#3D3535]">{lang.name}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                          {/* Person 1 bar (right-aligned) */}
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-bold text-[#E8736F]">{score1}점</span>
                            <div className="w-full max-w-[200px] h-4 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                              <motion.div
                                className="h-full rounded-full bg-[#E8736F]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(score1 / 12) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                              />
                            </div>
                          </div>
                          {/* Divider */}
                          <div className="w-px h-4 bg-[#3D3535]/10" />
                          {/* Person 2 bar (left-aligned) */}
                          <div className="flex items-center gap-2">
                            <div className="w-full max-w-[200px] h-4 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-[#7B68EE]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(score2 / 12) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                              />
                            </div>
                            <span className="text-xs font-bold text-[#7B68EE]">{score2}점</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-6 pt-4 border-t border-[#3D3535]/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#E8736F]" />
                    <span className="text-xs text-[#3D3535]/60">{name1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#7B68EE]" />
                    <span className="text-xs text-[#3D3535]/60">{name2}</span>
                  </div>
                </div>
              </section>

              {/* Compatibility Insight */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-[#3D3535]/5 mb-8">
                <h3 className="font-serif font-bold text-[#3D3535] text-lg mb-4">
                  관계 인사이트
                </h3>
                <div className="space-y-4 text-sm text-[#3D3535]/70 leading-relaxed">
                  {result1.primary === result2.primary ? (
                    <p>
                      <strong className="text-[#E8736F]">같은 사랑의 언어!</strong>{' '}
                      두 분 모두 <strong className="text-[#3D3535]">{LANGUAGE_INFO[result1.primary].name}</strong>을(를) 주된 사랑의 언어로 가지고 있습니다.
                      서로의 사랑 표현을 자연스럽게 이해하고 받아들일 수 있는 좋은 조합입니다.
                    </p>
                  ) : (
                    <>
                      <p>
                        <strong className="text-[#3D3535]">{name1}</strong>은(는) <strong style={{ color: LANGUAGE_INFO[result1.primary].color }}>{LANGUAGE_INFO[result1.primary].name}</strong>으로 사랑을 느끼고,{' '}
                        <strong className="text-[#3D3535]">{name2}</strong>은(는) <strong style={{ color: LANGUAGE_INFO[result2.primary].color }}>{LANGUAGE_INFO[result2.primary].name}</strong>으로 사랑을 느낍니다.
                      </p>
                      <p>
                        서로 다른 사랑의 언어를 가지고 있다면, 상대방이 원하는 방식으로 사랑을 표현하는 것이 중요합니다.
                        나의 방식이 아닌, 상대방의 언어로 사랑을 전달해보세요.
                      </p>
                    </>
                  )}
                  <div className="mt-4 p-4 rounded-xl bg-[#FDF8F4] border border-[#3D3535]/5">
                    <p className="text-xs text-[#3D3535]/60">
                      <strong className="text-[#3D3535]">팁:</strong>{' '}
                      {name1}에게는 {LANGUAGE_INFO[result1.primary].tips[0].toLowerCase()}{' '}
                      {name2}에게는 {LANGUAGE_INFO[result2.primary].tips[0].toLowerCase()}
                    </p>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-3 pb-10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false);
                    setResult1(null);
                    setResult2(null);
                    setLink1("");
                    setLink2("");
                  }}
                  className="border-[#3D3535]/20 text-[#3D3535]/70"
                >
                  다른 결과 비교하기
                </Button>
                <Button
                  onClick={handlePdfDownload}
                  disabled={isPdfLoading}
                  className="bg-[#7B68EE] hover:bg-[#6A5ACD] text-white"
                >
                  {isPdfLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 mr-2" />
                  )}
                  PDF 저장
                </Button>
                <Button
                  onClick={() => navigate('/quiz')}
                  className="bg-[#E8736F] hover:bg-[#D4605C] text-white"
                >
                  나도 진단하기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
