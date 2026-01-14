// Bank logo mappings for Yemen commercial banks
// Maps bank acronyms/IDs to their logo paths

export const bankLogos: Record<string, string> = {
  // Major Commercial Banks
  "TIIB": "/images/banks/tadhamon.png",
  "tadhamon": "/images/banks/tadhamon.png",
  "بنك التضامن": "/images/banks/tadhamon.png",
  
  "CAC": "/images/banks/cac-bank.jpg",
  "cac": "/images/banks/cac-bank.jpg",
  "كاك بنك": "/images/banks/cac-bank.jpg",
  
  "YKB": "/images/banks/ykb.jpg",
  "ykb": "/images/banks/ykb.jpg",
  "بنك اليمن والكويت": "/images/banks/ykb.jpg",
  
  "SIB": "/images/banks/saba.jpg",
  "saba": "/images/banks/saba.jpg",
  "بنك سبأ": "/images/banks/saba.jpg",
  
  "KIMB": "/images/banks/kuraimi.jpg",
  "kuraimi": "/images/banks/kuraimi.jpg",
  "بنك الكريمي": "/images/banks/kuraimi.jpg",
};

// Get bank logo by acronym or name
export function getBankLogo(bankAcronym?: string, bankName?: string): string | null {
  if (bankAcronym) {
    const upperAcronym = bankAcronym.toUpperCase();
    if (bankLogos[upperAcronym]) return bankLogos[upperAcronym];
    if (bankLogos[bankAcronym.toLowerCase()]) return bankLogos[bankAcronym.toLowerCase()];
  }
  
  if (bankName) {
    // Check for partial matches in Arabic names
    for (const [key, logo] of Object.entries(bankLogos)) {
      if (bankName.includes(key) || key.includes(bankName)) {
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
};

// Get bank website by acronym
export function getBankWebsite(bankAcronym?: string): string | null {
  if (!bankAcronym) return null;
  return bankWebsites[bankAcronym.toUpperCase()] || null;
}
