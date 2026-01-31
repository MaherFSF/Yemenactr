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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - Yemen Map with dark green overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/images/yemen-map-splash.png')",
        }}
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C3424]/90 via-[#2C3424]/80 to-[#2C3424]/95" />
      
      {/* Decorative corner frames - matching CauseWay design */}
      <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-[#C9A227]/40" />
      <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-[#C9A227]/40" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-[#C9A227]/40" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-[#C9A227]/40" />
      
      {/* Small decorative squares in corners */}
      <div className="absolute top-12 left-12 w-4 h-4 border border-[#C9A227]/30" />
      <div className="absolute top-20 left-20 w-3 h-3 border border-[#C9A227]/20" />
      <div className="absolute top-12 right-12 w-4 h-4 border border-[#C9A227]/30" />
      <div className="absolute top-20 right-20 w-3 h-3 border border-[#C9A227]/20" />
      <div className="absolute bottom-12 left-12 w-4 h-4 border border-[#C9A227]/30" />
      <div className="absolute bottom-20 left-20 w-3 h-3 border border-[#C9A227]/20" />
      <div className="absolute bottom-12 right-12 w-4 h-4 border border-[#C9A227]/30" />
      <div className="absolute bottom-20 right-20 w-3 h-3 border border-[#C9A227]/20" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* CauseWay Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          {/* Logo Icon */}
          <div className="flex justify-center mb-4">
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main C shape */}
              <path 
                d="M10 10 L10 70 L60 70 L60 55 L25 55 L25 25 L60 25 L60 10 Z" 
                fill="#4C583E" 
                stroke="#4C583E" 
                strokeWidth="2"
              />
              {/* Top right square - Olive */}
              <rect x="50" y="10" width="20" height="20" fill="#768064" rx="2" />
              {/* Bottom right square - Gold */}
              <rect x="75" y="10" width="15" height="15" fill="#C9A227" rx="2" />
              {/* Small circle */}
              <circle cx="85" cy="40" r="6" fill="#4C583E" />
            </svg>
          </div>
          
          {/* CauseWay Text */}
          <h1 className="text-4xl md:text-5xl font-serif text-white text-center tracking-wide">
            CauseWay
          </h1>
          <p className="text-2xl md:text-3xl text-[#768064] text-center font-arabic mt-1">
            كوزواي
          </p>
        </motion.div>

        {/* Yemen Economic Observatory Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl md:text-2xl text-[#DADED8] tracking-[0.3em] uppercase font-light">
            Yemen Economic Observatory
          </h2>
          <p className="text-lg md:text-xl text-[#959581] font-arabic mt-2">
            مرصد اليمن الاقتصادي
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-12 max-w-2xl"
        >
          <p className="text-xl md:text-2xl text-white/90 italic font-serif leading-relaxed">
            "For a decade, decisions have been made in the dark.
          </p>
          <p className="text-xl md:text-2xl text-[#C9A227] italic font-serif mt-2">
            Something is about to change."
          </p>
        </motion.div>

        {/* Language Selection Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex gap-4"
        >
          <button
            onClick={() => handleLanguageSelect("en")}
            className="px-8 py-3 border-2 border-[#C9A227]/60 text-white hover:bg-[#C9A227]/20 transition-all duration-300 rounded-sm text-lg tracking-wide"
          >
            English
          </button>
          <button
            onClick={() => handleLanguageSelect("ar")}
            className="px-8 py-3 bg-[#C9A227]/10 border-2 border-[#C9A227]/60 text-white hover:bg-[#C9A227]/30 transition-all duration-300 rounded-sm text-lg font-arabic"
          >
            العربية
          </button>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-12 text-[#959581] text-sm md:text-base text-center max-w-xl px-4"
        >
          Illuminating Yemen's path to economic recovery through data-driven accountability
        </motion.p>
      </div>
    </div>
  );
}
