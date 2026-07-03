import { Button } from "@/components/ui/button";
import { LANGUAGE_INFO, LoveLanguage } from "@/lib/quizData";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Clock, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

/*
 * Design: Warm Embrace - Organic Modernism
 * Color: Coral Rose primary, warm cream background
 * Typography: Noto Serif KR headings, Noto Sans KR body
 */

const languages = Object.values(LANGUAGE_INFO);

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#FDF8F4' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#FDF8F4]/80 border-b border-[#E8736F]/10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="/manus-storage/logo-icon_77006ad9.png"
              alt="Logo"
              className="w-9 h-9"
            />
            <div className="flex flex-col">
              <span className="font-serif text-base font-semibold text-[#E8736F] leading-tight">
                예봄 부부의 삶
              </span>
              <span className="text-[11px] text-[#3D3535]/60 tracking-wider">
                사랑의 언어 진단
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-[#E8736F] text-[#E8736F] hover:bg-[#E8736F] hover:text-white transition-all duration-200"
            onClick={() => navigate("/quiz")}
          >
            진단 시작
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(/manus-storage/hero-bg_be7f1142.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8736F]/10 text-[#E8736F] text-sm font-medium mb-8">
              <Heart className="w-4 h-4" />
              게리 채프먼의 5가지 사랑의 언어
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#3D3535] leading-tight mb-6">
              당신은 어떤 사랑의 언어로<br />
              <span className="text-[#E8736F]">대화</span>하고 있나요?
            </h1>
            <p className="text-lg md:text-xl text-[#3D3535]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              30개의 질문으로 발견하는, 나만의 사랑 표현법.
              <br className="hidden sm:block" />
              사랑하는 사람과 더 깊이 연결되는 첫 걸음을 시작하세요.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-[#E8736F] hover:bg-[#D4605C] text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-[#E8736F]/20 transition-all duration-200 active:scale-[0.97]"
              onClick={() => navigate("/quiz")}
            >
              진단 시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <div className="flex items-center gap-2 text-[#3D3535]/50 text-sm">
              <Clock className="w-4 h-4" />
              약 5분 소요
            </div>
          </motion.div>
          {/* Scroll indicator - mobile only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-12 flex flex-col items-center gap-1 md:hidden"
          >
            <span className="text-xs text-[#3D3535]/50 tracking-wide">자세한 설명</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#E8736F]/60">
                <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5 Languages Overview */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, #FDF8F4 0%, #FFF 100%)' }}>
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#3D3535] mb-4">
              5가지 사랑의 언어란?
            </h2>
            <p className="text-[#3D3535]/60 max-w-xl mx-auto">
              사람마다 사랑을 느끼고 표현하는 방식이 다릅니다.
              당신의 주된 사랑의 언어를 알면, 관계가 더 풍요로워집니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {languages.map((lang, index) => (
              <motion.div
                key={lang.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative p-6 rounded-2xl border border-transparent hover:border-current/10 transition-all duration-300 cursor-default"
                style={{
                  background: lang.colorLight,
                  '--tw-border-opacity': '0.2',
                } as React.CSSProperties}
              >
                <div className="text-3xl mb-3">{lang.icon}</div>
                <h3 className="font-serif font-semibold text-[#3D3535] mb-1">
                  {lang.name}
                </h3>
                <p className="text-xs text-[#3D3535]/50">{lang.nameEn}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#3D3535] mb-4">
              어떻게 진행되나요?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '질문에 답하기', desc: '30개의 질문에서 더 마음에 드는 선택지를 고르세요.' },
              { step: '02', title: '결과 분석', desc: '당신의 응답을 바탕으로 5가지 언어별 점수를 산출합니다.' },
              { step: '03', title: '맞춤 진단서', desc: '주된 사랑의 언어와 실천 방법을 확인하세요.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#E8736F]/10 text-[#E8736F] font-serif font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="font-serif font-semibold text-[#3D3535] text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-[#3D3535]/60 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ background: '#FDF8F4' }}>
        <div className="container max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MessageCircle className="w-10 h-10 text-[#E8736F] mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#3D3535] mb-4">
              지금 바로 시작해보세요
            </h2>
            <p className="text-[#3D3535]/60 mb-3">
              나의 사랑의 언어를 알면, 상대방의 사랑도 더 잘 이해할 수 있습니다.
            </p>
            <p className="text-[#C0392B] text-sm font-bold mb-8">
              진단결과는 저장되지 않습니다. 진단종료후 결과지를 저장하시거나 캡춰하셔서 보관해 주십시요.
            </p>
            <Button
              size="lg"
              className="bg-[#E8736F] hover:bg-[#D4605C] text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-[#E8736F]/20 transition-all duration-200 active:scale-[0.97]"
              onClick={() => navigate("/quiz")}
            >
              무료 진단 시작
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

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
