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
      {/* Pure CSS gradient background matching CauseWay brand */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `radial-gradient(ellipse at center, #3a4a32 0%, #2C3424 50%, #1a2018 100%)`,
        }}
      />

      {/* Decorative corner frames - gold geometric pattern */}
      <div className="absolute top-4 left-4 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 opacity-50">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L180 0 L180 15 L15 15 L15 180 L0 180 Z" fill="none" stroke="#C9A227" strokeWidth="1.5"/>
          <rect x="25" y="25" width="18" height="18" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="50" y="25" width="12" height="12" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="25" y="50" width="12" height="12" fill="none" stroke="#C9A227" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 opacity-50 rotate-90">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L180 0 L180 15 L15 15 L15 180 L0 180 Z" fill="none" stroke="#C9A227" strokeWidth="1.5"/>
          <rect x="25" y="25" width="18" height="18" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="50" y="25" width="12" height="12" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="25" y="50" width="12" height="12" fill="none" stroke="#C9A227" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute bottom-4 left-4 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 opacity-50 -rotate-90">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L180 0 L180 15 L15 15 L15 180 L0 180 Z" fill="none" stroke="#C9A227" strokeWidth="1.5"/>
          <rect x="25" y="25" width="18" height="18" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="50" y="25" width="12" height="12" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="25" y="50" width="12" height="12" fill="none" stroke="#C9A227" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute bottom-4 right-4 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 opacity-50 rotate-180">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L180 0 L180 15 L15 15 L15 180 L0 180 Z" fill="none" stroke="#C9A227" strokeWidth="1.5"/>
          <rect x="25" y="25" width="18" height="18" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="50" y="25" width="12" height="12" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="25" y="50" width="12" height="12" fill="none" stroke="#C9A227" strokeWidth="1"/>
        </svg>
      </div>

      {/* Main Content - Centered with proper mobile spacing */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 sm:px-8">
        
        {/* Logo and Text Container */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-8 sm:mb-10"
        >
          {/* CauseWay Logo Icon - Exact recreation matching mockup */}
          <div className="mb-6 sm:mb-8">
            <svg 
              viewBox="0 0 100 85" 
              className="w-20 h-16 sm:w-28 sm:h-24 md:w-36 md:h-28"
            >
              {/* Main C shape - Cypress green with darker fill */}
              <path 
                d="M5 8 L55 8 Q60 8 60 13 L60 22 L25 22 L25 63 L60 63 L60 72 Q60 77 55 77 L5 77 Q0 77 0 72 L0 13 Q0 8 5 8 Z" 
                fill="#2e6b4f"
              />
              {/* Inner olive square */}
              <rect x="40" y="30" width="22" height="22" rx="3" fill="#5a7a5a"/>
              {/* Top right gold square */}
              <rect x="68" y="8" width="22" height="22" rx="4" fill="#C9A227"/>
              {/* Bottom right small dark green square */}
              <rect x="68" y="40" width="14" height="14" rx="3" fill="#2e6b4f"/>
            </svg>
          </div>

          {/* CauseWay | كوزواي */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <span className="text-white text-2xl sm:text-3xl md:text-4xl font-light tracking-wide">CauseWay</span>
            <span className="text-[#5a7a5a] text-2xl sm:text-3xl md:text-4xl font-light">|</span>
            <span className="text-[#5a7a5a] text-2xl sm:text-3xl md:text-4xl font-arabic">كوزواي</span>
          </div>

          {/* Arabic Title */}
          <h1 className="text-[#DADED8] text-lg sm:text-xl md:text-2xl font-arabic mb-2 leading-relaxed" dir="rtl">
            المرصد اليمني للشفافية الاقتصادية
          </h1>

          {/* English Subtitle */}
          <p className="text-[#959581] text-xs sm:text-sm md:text-base tracking-wide mb-5 sm:mb-6">
            (Yemen Economic Transparency Observatory)
          </p>

          {/* Arabic Tagline - Gold color */}
          <p className="text-[#C9A227] text-base sm:text-lg md:text-xl font-arabic" dir="rtl">
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
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-[#C9A227] text-[#2C3424] hover:bg-[#d4ad32] transition-all duration-300 rounded text-base sm:text-lg font-arabic font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            ادخل بالعربية
          </button>
          <button
            onClick={() => handleLanguageSelect("en")}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/10 transition-all duration-300 rounded text-base sm:text-lg tracking-wide"
          >
            Enter in English
          </button>
        </motion.div>

        {/* Powered by text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 sm:mt-10 text-center"
        >
          <p className="text-[#959581] text-xs sm:text-sm">
            Powered by CauseWay Financial & Banking Consultancies
          </p>
          <p className="text-[#5a7a5a] text-xs font-arabic mt-1" dir="rtl">
            بدعم من كوزواي للاستشارات المالية والمصرفية
          </p>
        </motion.div>
      </div>
    </div>
  );
}
