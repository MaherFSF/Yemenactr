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
      {/* Pure CSS gradient background - no watermarks */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `radial-gradient(ellipse at center, #3a4a32 0%, #2C3424 50%, #1a2018 100%)`,
        }}
      />

      {/* Decorative corner frames - gold geometric pattern */}
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 opacity-40">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L200 0 L200 20 L20 20 L20 200 L0 200 Z" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="30" y="30" width="20" height="20" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="60" y="30" width="15" height="15" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="30" y="60" width="15" height="15" fill="none" stroke="#C9A227" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 opacity-40 rotate-90">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L200 0 L200 20 L20 20 L20 200 L0 200 Z" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="30" y="30" width="20" height="20" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="60" y="30" width="15" height="15" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="30" y="60" width="15" height="15" fill="none" stroke="#C9A227" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 opacity-40 -rotate-90">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L200 0 L200 20 L20 20 L20 200 L0 200 Z" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="30" y="30" width="20" height="20" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="60" y="30" width="15" height="15" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="30" y="60" width="15" height="15" fill="none" stroke="#C9A227" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 opacity-40 rotate-180">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0 0 L200 0 L200 20 L20 20 L20 200 L0 200 Z" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="30" y="30" width="20" height="20" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="60" y="30" width="15" height="15" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <rect x="30" y="60" width="15" height="15" fill="none" stroke="#C9A227" strokeWidth="1"/>
        </svg>
      </div>

      {/* Main Content - Centered with proper mobile spacing */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
        
        {/* Logo and Text Container */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-8 sm:mb-12"
        >
          {/* CauseWay Logo Icon - SVG recreation */}
          <div className="mb-6 sm:mb-8">
            <svg width="120" height="100" viewBox="0 0 120 100" className="w-24 h-20 sm:w-32 sm:h-28 md:w-40 md:h-32">
              {/* Main C shape - dark green */}
              <path 
                d="M20 15 L70 15 L70 30 L35 30 L35 70 L70 70 L70 85 L20 85 Z" 
                fill="#2C3424" 
                stroke="#4C583E" 
                strokeWidth="2"
              />
              {/* Inner square - olive green */}
              <rect x="50" y="35" width="25" height="25" fill="#768064" rx="2"/>
              {/* Top right square - gold */}
              <rect x="80" y="15" width="20" height="20" fill="#C9A227" rx="3"/>
              {/* Bottom right small square - dark green */}
              <rect x="80" y="45" width="12" height="12" fill="#4C583E" rx="2"/>
            </svg>
          </div>

          {/* CauseWay | كوزواي */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="text-white text-2xl sm:text-3xl md:text-4xl font-light tracking-wide">CauseWay</span>
            <span className="text-[#768064] text-2xl sm:text-3xl md:text-4xl">|</span>
            <span className="text-[#768064] text-2xl sm:text-3xl md:text-4xl font-arabic">كوزواي</span>
          </div>

          {/* Arabic Title */}
          <h1 className="text-[#DADED8] text-xl sm:text-2xl md:text-3xl font-arabic mb-2 sm:mb-3 leading-relaxed" dir="rtl">
            المرصد اليمني للشفافية الاقتصادية
          </h1>

          {/* English Subtitle */}
          <p className="text-[#959581] text-sm sm:text-base md:text-lg tracking-wide mb-4 sm:mb-6">
            (Yemen Economic Transparency Observatory)
          </p>

          {/* Arabic Tagline */}
          <p className="text-[#C9A227] text-lg sm:text-xl md:text-2xl font-arabic" dir="rtl">
            نحو اقتصاد مبني على الحقائق
          </p>
        </motion.div>

        {/* Language Selection Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-md"
        >
          <button
            onClick={() => handleLanguageSelect("ar")}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-[#C9A227] text-[#2C3424] hover:bg-[#d4ad32] transition-all duration-300 rounded-sm text-base sm:text-lg font-arabic font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            ادخل بالعربية
          </button>
          <button
            onClick={() => handleLanguageSelect("en")}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/10 transition-all duration-300 rounded-sm text-base sm:text-lg tracking-wide"
          >
            Enter in English
          </button>
        </motion.div>

        {/* Powered by text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 sm:mt-12 text-center"
        >
          <p className="text-[#959581] text-xs sm:text-sm">
            Powered by CauseWay Financial & Banking Consultancies
          </p>
          <p className="text-[#768064] text-xs font-arabic mt-1" dir="rtl">
            بدعم من كوزواي للاستشارات المالية والمصرفية
          </p>
        </motion.div>
      </div>
    </div>
  );
}
