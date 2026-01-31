import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Splash() {
  const { setLanguage } = useLanguage();
  const [, setLocation] = useLocation();

  const handleLanguageSelect = (lang: "en" | "ar") => {
    setLanguage(lang);
    localStorage.setItem("yeto-splash-seen", "true");
    localStorage.setItem("yeto-language", lang);
    setLocation("/home");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Pure CSS gradient background matching exact CauseWay mockup */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `radial-gradient(ellipse at center, #2a3a28 0%, #1f2d1d 40%, #162016 100%)`,
        }}
      />

      {/* Decorative corner frames - gold geometric pattern matching mockup */}
      <div className="absolute top-4 left-4 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 opacity-60">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L180 0 L180 12 L12 12 L12 180 L0 180 Z" fill="none" stroke="#d4a528" strokeWidth="1.5"/>
          <rect x="22" y="22" width="16" height="16" fill="none" stroke="#d4a528" strokeWidth="1"/>
          <rect x="45" y="22" width="10" height="10" fill="none" stroke="#d4a528" strokeWidth="1"/>
          <rect x="22" y="45" width="10" height="10" fill="none" stroke="#d4a528" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute top-4 right-4 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 opacity-60 rotate-90">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L180 0 L180 12 L12 12 L12 180 L0 180 Z" fill="none" stroke="#d4a528" strokeWidth="1.5"/>
          <rect x="22" y="22" width="16" height="16" fill="none" stroke="#d4a528" strokeWidth="1"/>
          <rect x="45" y="22" width="10" height="10" fill="none" stroke="#d4a528" strokeWidth="1"/>
          <rect x="22" y="45" width="10" height="10" fill="none" stroke="#d4a528" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute bottom-4 left-4 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 opacity-60 -rotate-90">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L180 0 L180 12 L12 12 L12 180 L0 180 Z" fill="none" stroke="#d4a528" strokeWidth="1.5"/>
          <rect x="22" y="22" width="16" height="16" fill="none" stroke="#d4a528" strokeWidth="1"/>
          <rect x="45" y="22" width="10" height="10" fill="none" stroke="#d4a528" strokeWidth="1"/>
          <rect x="22" y="45" width="10" height="10" fill="none" stroke="#d4a528" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute bottom-4 right-4 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 opacity-60 rotate-180">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L180 0 L180 12 L12 12 L12 180 L0 180 Z" fill="none" stroke="#d4a528" strokeWidth="1.5"/>
          <rect x="22" y="22" width="16" height="16" fill="none" stroke="#d4a528" strokeWidth="1"/>
          <rect x="45" y="22" width="10" height="10" fill="none" stroke="#d4a528" strokeWidth="1"/>
          <rect x="22" y="45" width="10" height="10" fill="none" stroke="#d4a528" strokeWidth="1"/>
        </svg>
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 sm:px-8">
        
        {/* Logo Container - Exact placement from mockup */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-8 sm:mb-10"
        >
          {/* CauseWay Logo Icon - EXACT recreation from mockup */}
          <div className="mb-6 sm:mb-8">
            <svg 
              viewBox="0 0 120 100" 
              className="w-24 h-20 sm:w-32 sm:h-28 md:w-40 md:h-32"
            >
              {/* Main C shape - Teal/Cypress green */}
              <path 
                d="M8 10 L62 10 Q68 10 68 16 L68 28 L28 28 L28 72 L68 72 L68 84 Q68 90 62 90 L8 90 Q2 90 2 84 L2 16 Q2 10 8 10 Z" 
                fill="#2e8b6e"
              />
              {/* Inner olive/sage square */}
              <rect x="48" y="36" width="26" height="26" rx="4" fill="#6b8e6b"/>
              {/* Top right gold/mustard square */}
              <rect x="82" y="10" width="26" height="26" rx="5" fill="#d4a528"/>
              {/* Bottom right small teal circle/square */}
              <rect x="82" y="48" width="16" height="16" rx="8" fill="#2e8b6e"/>
            </svg>
          </div>

          {/* CauseWay - English text (white) */}
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-3">
            CauseWay
          </h1>

          {/* كوزواي - Arabic text (sage green) */}
          <h2 className="text-[#6b8e6b] text-3xl sm:text-4xl md:text-5xl font-arabic mb-8 sm:mb-10" dir="rtl">
            كوزواي
          </h2>

          {/* Economic Observatory subtitle - creative addition */}
          <div className="border-t border-b border-[#d4a528]/30 py-3 px-6 mb-6">
            <p className="text-[#d4a528] text-sm sm:text-base tracking-[0.3em] uppercase">
              Economic Observatory
            </p>
          </div>

          {/* Arabic Title */}
          <h3 className="text-[#DADED8] text-lg sm:text-xl md:text-2xl font-arabic mb-2 leading-relaxed" dir="rtl">
            المرصد اليمني للشفافية الاقتصادية
          </h3>

          {/* English Subtitle */}
          <p className="text-[#8a9a8a] text-xs sm:text-sm md:text-base tracking-wide mb-6">
            Yemen Economic Transparency Observatory
          </p>

          {/* Arabic Tagline - Gold color */}
          <p className="text-[#d4a528] text-base sm:text-lg md:text-xl font-arabic" dir="rtl">
            نحو اقتصاد مبني على الحقائق
          </p>
        </motion.div>

        {/* Language Selection Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-md"
        >
          <button
            onClick={() => handleLanguageSelect("ar")}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-[#d4a528] text-[#1f2d1d] hover:bg-[#e0b030] transition-all duration-300 rounded text-base sm:text-lg font-arabic font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            ادخل بالعربية
          </button>
          <button
            onClick={() => handleLanguageSelect("en")}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#d4a528] text-[#d4a528] hover:bg-[#d4a528]/10 transition-all duration-300 rounded text-base sm:text-lg tracking-wide"
          >
            Enter in English
          </button>
        </motion.div>

        {/* Powered by text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 sm:mt-12 text-center"
        >
          <p className="text-[#8a9a8a] text-xs sm:text-sm">
            Powered by CauseWay Financial & Banking Consultancies
          </p>
          <p className="text-[#6b8e6b] text-xs font-arabic mt-1" dir="rtl">
            بدعم من كوزواي للاستشارات المالية والمصرفية
          </p>
        </motion.div>
      </div>
    </div>
  );
}
