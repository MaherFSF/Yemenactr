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
      {/* Background Image - Full screen */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('/images/splash-bg.jpg')`,
        }}
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a2318]/80" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6">
        
        {/* Language Selection Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-md"
        >
          <button
            onClick={() => handleLanguageSelect("ar")}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-[#C9A227] text-[#2C3424] hover:bg-[#d4ad32] transition-all duration-300 rounded-sm text-base sm:text-lg font-arabic font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            ادخل بالعربية
          </button>
          <button
            onClick={() => handleLanguageSelect("en")}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/10 transition-all duration-300 rounded-sm text-base sm:text-lg tracking-wide backdrop-blur-sm"
          >
            Enter in English
          </button>
        </motion.div>

        {/* Powered by text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 sm:mt-10 text-center"
        >
          <p className="text-[#DADED8]/80 text-xs sm:text-sm">
            Powered by CauseWay Financial & Banking Consultancies
          </p>
          <p className="text-[#DADED8]/60 text-xs font-arabic mt-1" dir="rtl">
            بدعم من كوزواي للاستشارات المالية والمصرفية
          </p>
        </motion.div>
      </div>
    </div>
  );
}
