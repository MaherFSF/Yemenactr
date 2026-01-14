// Bank logo mappings for Yemen commercial banks
// Maps bank acronyms/IDs to their logo paths

export const bankLogos: Record<string, string> = {
  // Major Commercial Banks
  "TIIB": "/images/banks/tadhamon.jpg",
  "tadhamon": "/images/banks/tadhamon.jpg",
  "بنك التضامن": "/images/banks/tadhamon.jpg",
  "Tadhamon International Islamic Bank": "/images/banks/tadhamon.jpg",
  
  "YBRD": "/images/banks/ybrd.png",
  "ybrd": "/images/banks/ybrd.png",
  "البنك اليمني للإنشاء والتعمير": "/images/banks/ybrd.png",
  "Yemen Bank for Reconstruction and Development": "/images/banks/ybrd.png",
  
  "IBYFI": "/images/banks/ibyfi.png",
  "ibyfi": "/images/banks/ibyfi.png",
  "البنك الإسلامي اليمني للتمويل والاستثمار": "/images/banks/ibyfi.png",
  "Islamic Bank of Yemen for Finance and Investment": "/images/banks/ibyfi.png",
  
  "CAC": "/images/banks/cac-bank.jpg",
  "cac": "/images/banks/cac-bank.jpg",
  "كاك بنك": "/images/banks/cac-bank.jpg",
  "CAC Bank": "/images/banks/cac-bank.jpg",
  "Cooperative & Agricultural Credit Bank": "/images/banks/cac-bank.jpg",
  
  "YKB": "/images/banks/ykb.jpg",
  "ykb": "/images/banks/ykb.jpg",
  "بنك اليمن والكويت": "/images/banks/ykb.jpg",
  "Yemen Kuwait Bank": "/images/banks/ykb.jpg",
  
  "SIB": "/images/banks/saba.jpg",
  "saba": "/images/banks/saba.jpg",
  "بنك سبأ": "/images/banks/saba.jpg",
  "Saba Islamic Bank": "/images/banks/saba.jpg",
  
  "KIMB": "/images/banks/alkuraimi.jpg",
  "kuraimi": "/images/banks/alkuraimi.jpg",
  "بنك الكريمي": "/images/banks/alkuraimi.jpg",
  "Al-Kuraimi Islamic Microfinance Bank": "/images/banks/alkuraimi.jpg",
  "Alkuraimi": "/images/banks/alkuraimi.jpg",
  
  "NBY": "/images/banks/nby.jpg",
  "nby": "/images/banks/nby.jpg",
  "البنك الأهلي اليمني": "/images/banks/nby.jpg",
  "National Bank of Yemen": "/images/banks/nby.jpg",
  
  "YCB": "/images/banks/ycb.jpg",
  "ycb": "/images/banks/ycb.jpg",
  "البنك التجاري اليمني": "/images/banks/ycb.jpg",
  "Yemen Commercial Bank": "/images/banks/ycb.jpg",
  
  "YIB": "/images/banks/iby.png",
  "IBY": "/images/banks/iby.png",
  "iby": "/images/banks/iby.png",
  "بنك اليمن الدولي": "/images/banks/iby.png",
  "International Bank of Yemen": "/images/banks/iby.png",
  
  "SHAMIL": "/images/banks/shamil.jpg",
  "shamil": "/images/banks/shamil.jpg",
  "مصرف اليمن البحرين الشامل": "/images/banks/shamil.jpg",
  "Shamil Bank of Yemen & Bahrain": "/images/banks/shamil.jpg",
  
  "AIMB": "/images/banks/aden-islamic.jpg",
  "aden": "/images/banks/aden-islamic.jpg",
  "بنك عدن الإسلامي": "/images/banks/aden-islamic.jpg",
  "Aden Islamic Bank": "/images/banks/aden-islamic.jpg",
  
  "AMAL": "/images/banks/amal.jpg",
  "amal": "/images/banks/amal.jpg",
  "بنك الأمل": "/images/banks/amal.jpg",
  "Al-Amal Microfinance Bank": "/images/banks/amal.jpg",
  
  "ADEN": "/images/banks/aden-bank.jpg",
  "aden-bank": "/images/banks/aden-bank.jpg",
  "بنك عدن": "/images/banks/aden-bank.jpg",
  "Aden Bank": "/images/banks/aden-bank.jpg",
  
  "GULF": "/images/banks/gulf-bank.png",
  "gulf": "/images/banks/gulf-bank.png",
  "بنك الخليج": "/images/banks/gulf-bank.png",
  "Gulf Bank Yemen": "/images/banks/gulf-bank.png",
  
  // Central Bank
  "CBY": "/images/banks/cby.jpeg",
  "cby": "/images/banks/cby.jpeg",
  "البنك المركزي اليمني": "/images/banks/cby.jpeg",
  "Central Bank of Yemen": "/images/banks/cby.jpeg",
};

// Get bank logo by acronym or name
export function getBankLogo(bankAcronym?: string, bankName?: string): string | null {
  if (bankAcronym) {
    const upperAcronym = bankAcronym.toUpperCase();
    if (bankLogos[upperAcronym]) return bankLogos[upperAcronym];
    if (bankLogos[bankAcronym.toLowerCase()]) return bankLogos[bankAcronym.toLowerCase()];
    if (bankLogos[bankAcronym]) return bankLogos[bankAcronym];
  }
  
  if (bankName) {
    // Direct match first
    if (bankLogos[bankName]) return bankLogos[bankName];
    
    // Check for partial matches in Arabic and English names
    for (const [key, logo] of Object.entries(bankLogos)) {
      if (bankName.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(bankName.toLowerCase()) ||
          bankName.includes(key) || 
          key.includes(bankName)) {
        return logo;
      }
    }
  }
  
  return null;
}

// Bank website URLs
export const bankWebsites: Record<string, string> = {
  "TIIB": "https://www.tadhamonbank.com/",
  "YBRD": "https://www.ybrdye.com/",
  "NBY": "https://nby.com.ye/",
  "YKB": "https://www.yk-bank.com/",
  "YCB": "https://www.ycb.bank/",
  "SIB": "http://sababank.com/",
  "KIMB": "https://kuraimibank.com/",
  "CAC": "https://www.cacbank.com.ye/",
  "YIB": "https://ibyemen.com/",
  "IBY": "https://ibyemen.com/",
  "SHAMIL": "https://www.shamilbank.com/",
  "AIMB": "https://adenislamicbank.com/",
  "AMAL": "https://alamal.bank/",
};

// Get bank website by acronym
export function getBankWebsite(bankAcronym?: string): string | null {
  if (!bankAcronym) return null;
  return bankWebsites[bankAcronym.toUpperCase()] || null;
}
