import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Splash() {
  const { setLanguage } = useLanguage();
  const [, setLocation] = useLocation();

  const handleLanguageSelect = (lang: "en" | "ar") => {
    setLanguage(lang);
    // Store in localStorage to remember choice
    localStorage.setItem("yeto-splash-seen", "true");
    localStorage.setItem("yeto-language", lang);
    setLocation("/home");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#1a2318] via-[#2C3424] to-[#1a2318]">
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ 
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(76, 88, 62, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 50%, rgba(76, 88, 62, 0.2) 0%, transparent 50%)`,
        }}
      />
      
      {/* Decorative corner frames - matching CauseWay design */}
      {/* Top Left Corner */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8">
        <div className="w-16 sm:w-24 h-16 sm:h-24 border-l-2 border-t-2 border-[#C9A227]/50" />
        <div className="absolute top-2 left-2 w-3 sm:w-4 h-3 sm:h-4 border border-[#C9A227]/30" />
        <div className="absolute top-6 sm:top-10 left-6 sm:left-10 w-2 sm:w-3 h-2 sm:h-3 border border-[#C9A227]/20" />
      </div>
      
      {/* Top Right Corner */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8">
        <div className="w-16 sm:w-24 h-16 sm:h-24 border-r-2 border-t-2 border-[#C9A227]/50" />
        <div className="absolute top-2 right-2 w-3 sm:w-4 h-3 sm:h-4 border border-[#C9A227]/30" />
        <div className="absolute top-6 sm:top-10 right-6 sm:right-10 w-2 sm:w-3 h-2 sm:h-3 border border-[#C9A227]/20" />
      </div>
      
      {/* Bottom Left Corner */}
      <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8">
        <div className="w-16 sm:w-24 h-16 sm:h-24 border-l-2 border-b-2 border-[#C9A227]/50" />
        <div className="absolute bottom-2 left-2 w-3 sm:w-4 h-3 sm:h-4 border border-[#C9A227]/30" />
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 w-2 sm:w-3 h-2 sm:h-3 border border-[#C9A227]/20" />
      </div>
      
      {/* Bottom Right Corner */}
      <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8">
        <div className="w-16 sm:w-24 h-16 sm:h-24 border-r-2 border-b-2 border-[#C9A227]/50" />
        <div className="absolute bottom-2 right-2 w-3 sm:w-4 h-3 sm:h-4 border border-[#C9A227]/30" />
        <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 w-2 sm:w-3 h-2 sm:h-3 border border-[#C9A227]/20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8">
        {/* CauseWay Logo Icon */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 sm:mb-6"
        >
          {/* Logo Icon - Exact CauseWay Design */}
          <svg 
            className="w-20 h-16 sm:w-28 sm:h-22 md:w-32 md:h-24" 
            viewBox="0 0 140 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main C shape - Dark Cypress Green with gradient effect */}
            <defs>
              <linearGradient id="cGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4C583E" />
                <stop offset="100%" stopColor="#3a4530" />
              </linearGradient>
            </defs>
            <path 
              d="M10 10 L10 80 L65 80 L65 65 L25 65 L25 25 L65 25 L65 10 Z" 
              fill="url(#cGradient)"
            />
            {/* Top right square - Olive Green */}
            <rect x="70" y="18" width="28" height="28" fill="#768064" rx="4" />
            {/* Top right small square - Old Gold */}
            <rect x="103" y="18" width="22" height="22" fill="#C9A227" rx="4" />
            {/* Bottom small circle - Cypress */}
            <circle cx="114" cy="60" r="10" fill="#4C583E" />
          </svg>
        </motion.div>

        {/* CauseWay Text with Arabic - Horizontal Layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6"
        >
          <span className="text-2xl sm:text-3xl md:text-4xl text-[#C9A227] font-arabic">كوزواي</span>
          <span className="hidden sm:block text-2xl sm:text-3xl md:text-4xl text-[#C9A227]/60">|</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-serif text-white tracking-wide">CauseWay</span>
        </motion.div>

        {/* Yemen Economic Transparency Observatory - Arabic Primary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-4 sm:mb-6 px-4"
        >
          <h1 className="text-lg sm:text-xl md:text-2xl text-[#C9A227] font-arabic mb-2" dir="rtl">
            المرصد اليمني للشفافية الاقتصادية
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#959581] tracking-wide">
            (Yemen Economic Transparency Observatory)
          </p>
        </motion.div>

        {/* Tagline - Arabic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-8 sm:mb-12 px-4"
        >
          <p className="text-xl sm:text-2xl md:text-3xl text-white font-arabic leading-relaxed" dir="rtl">
            نحو اقتصاد مبني على الحقائق
          </p>
          <p className="text-sm sm:text-base md:text-lg text-[#959581] mt-2 italic">
            Towards an economy built on facts
          </p>
        </motion.div>

        {/* Language Selection Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none sm:w-auto"
        >
          <button
            onClick={() => handleLanguageSelect("ar")}
            className="px-6 sm:px-8 py-3 bg-[#C9A227] text-[#2C3424] hover:bg-[#d4ad32] transition-all duration-300 rounded-sm text-base sm:text-lg font-arabic font-semibold shadow-lg"
          >
            ادخل بالعربية
          </button>
          <button
            onClick={() => handleLanguageSelect("en")}
            className="px-6 sm:px-8 py-3 border-2 border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/10 transition-all duration-300 rounded-sm text-base sm:text-lg tracking-wide"
          >
            Enter in English
          </button>
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="absolute bottom-6 sm:bottom-10 text-center max-w-md sm:max-w-xl px-4"
        >
          <p className="text-[#768064] text-xs sm:text-sm">
            Powered by CauseWay Financial & Banking Consultancies
          </p>
          <p className="text-[#768064]/70 text-xs font-arabic mt-1" dir="rtl">
            بدعم من كوزواي للاستشارات المالية والمصرفية
          </p>
        </motion.div>
      </div>
    </div>
  );
}
