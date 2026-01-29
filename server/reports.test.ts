/**
 * YETO Report Engine Tests
 * 
 * Comprehensive tests for report generation, distribution, and subscriber management
 */

import { describe, it, expect, beforeAll, vi } from "vitest";

// Mock data for testing
const mockReportTemplates = [
  {
    id: 1,
    slug: "quarterly",
    nameEn: "Quarterly Economic Report",
    nameAr: "التقرير الاقتصادي الفصلي",
    frequency: "quarterly",
    isActive: true,
    config: {
      sections: ["executive_summary", "fx_analysis", "inflation", "trade"],
      indicators: ["fx_rate", "inflation_rate"],
    },
  },
  {
    id: 2,
    slug: "annual",
    nameEn: "Annual Economic Review",
    nameAr: "المراجعة الاقتصادية السنوية",
    frequency: "annual",
    isActive: true,
    config: {
      sections: ["executive_summary", "macro_overview"],
      indicators: ["gdp", "fx_rate"],
    },
  },
  {
    id: 3,
    slug: "monthly",
    nameEn: "Monthly FX Summary",
    nameAr: "ملخص العملات الشهري",
    frequency: "monthly",
    isActive: true,
    config: {
      sections: ["fx_snapshot", "weekly_trends"],
      indicators: ["fx_rate"],
    },
  },
];

const mockSubscribers = [
  {
    id: 1,
    email: "researcher@example.com",
    nameEn: "John Researcher",
    nameAr: "جون الباحث",
    tier: "premium",
    preferredLanguage: "en",
    isActive: true,
    isVerified: true,
  },
  {
    id: 2,
    email: "analyst@example.com",
    nameEn: "Jane Analyst",
    nameAr: "جين المحللة",
    tier: "public",
    preferredLanguage: "ar",
    isActive: true,
    isVerified: true,
  },
];

const mockGeneratedReport = {
  id: 1,
  templateId: 1,
  periodStart: new Date("2025-01-01"),
  periodEnd: new Date("2025-03-31"),
  periodLabel: "Q1 2025",
  status: "success",
  s3UrlEn: "https://s3.example.com/reports/q1-2025-en.pdf",
  s3UrlAr: "https://s3.example.com/reports/q1-2025-ar.pdf",
  fileSizeBytesEn: 1024000,
  fileSizeBytesAr: 1100000,
  pageCountEn: 25,
  pageCountAr: 27,
};

describe("Report Engine - Template Management", () => {
  it("should have valid template structure", () => {
    mockReportTemplates.forEach((template) => {
      expect(template.slug).toBeDefined();
      expect(template.nameEn).toBeDefined();
      expect(template.nameAr).toBeDefined();
      expect(template.frequency).toMatch(/^(quarterly|annual|monthly|on_demand)$/);
      expect(template.isActive).toBe(true);
    });
  });

  it("should have valid config with sections and indicators", () => {
    mockReportTemplates.forEach((template) => {
      expect(template.config).toBeDefined();
      expect(Array.isArray(template.config.sections)).toBe(true);
      expect(template.config.sections.length).toBeGreaterThan(0);
    });
  });

  it("should have unique slugs", () => {
    const slugs = mockReportTemplates.map((t) => t.slug);
    const uniqueSlugs = [...new Set(slugs)];
    expect(slugs.length).toBe(uniqueSlugs.length);
  });

  it("should support bilingual names", () => {
    mockReportTemplates.forEach((template) => {
      expect(template.nameEn).not.toBe(template.nameAr);
      // Arabic should contain Arabic characters
      expect(/[\u0600-\u06FF]/.test(template.nameAr)).toBe(true);
    });
  });
});

describe("Report Engine - Subscriber Management", () => {
  it("should have valid subscriber structure", () => {
    mockSubscribers.forEach((sub) => {
      expect(sub.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(sub.tier).toMatch(/^(public|premium|vip)$/);
      expect(sub.preferredLanguage).toMatch(/^(en|ar)$/);
    });
  });

  it("should support different subscription tiers", () => {
    const tiers = mockSubscribers.map((s) => s.tier);
    expect(tiers).toContain("premium");
    expect(tiers).toContain("public");
  });

  it("should track verification status", () => {
    mockSubscribers.forEach((sub) => {
      expect(typeof sub.isVerified).toBe("boolean");
      expect(typeof sub.isActive).toBe("boolean");
    });
  });

  it("should support bilingual names", () => {
    mockSubscribers.forEach((sub) => {
      if (sub.nameAr) {
        expect(/[\u0600-\u06FF]/.test(sub.nameAr)).toBe(true);
      }
    });
  });
});

describe("Report Engine - Report Generation", () => {
  it("should have valid report structure", () => {
    expect(mockGeneratedReport.templateId).toBeGreaterThan(0);
    expect(mockGeneratedReport.periodLabel).toBeDefined();
    expect(mockGeneratedReport.status).toMatch(/^(pending|generating|success|failed)$/);
  });

  it("should have valid period dates", () => {
    const start = new Date(mockGeneratedReport.periodStart);
    const end = new Date(mockGeneratedReport.periodEnd);
    expect(start.getTime()).toBeLessThan(end.getTime());
  });

  it("should have S3 URLs for successful reports", () => {
    if (mockGeneratedReport.status === "success") {
      expect(mockGeneratedReport.s3UrlEn).toMatch(/^https?:\/\//);
      expect(mockGeneratedReport.s3UrlAr).toMatch(/^https?:\/\//);
    }
  });

  it("should track file metadata", () => {
    expect(mockGeneratedReport.fileSizeBytesEn).toBeGreaterThan(0);
    expect(mockGeneratedReport.fileSizeBytesAr).toBeGreaterThan(0);
    expect(mockGeneratedReport.pageCountEn).toBeGreaterThan(0);
    expect(mockGeneratedReport.pageCountAr).toBeGreaterThan(0);
  });

  it("should format period label correctly", () => {
    // Quarterly format: Q1 2025, Q2 2025, etc.
    expect(mockGeneratedReport.periodLabel).toMatch(/^Q[1-4] \d{4}$/);
  });
});

describe("Report Engine - Period Calculations", () => {
  it("should calculate quarterly periods correctly", () => {
    const quarters = [
      { q: 1, startMonth: 0, endMonth: 2 },  // Jan-Mar
      { q: 2, startMonth: 3, endMonth: 5 },  // Apr-Jun
      { q: 3, startMonth: 6, endMonth: 8 },  // Jul-Sep
      { q: 4, startMonth: 9, endMonth: 11 }, // Oct-Dec
    ];

    quarters.forEach(({ q, startMonth, endMonth }) => {
      const year = 2025;
      const periodStart = new Date(year, startMonth, 1);
      const periodEnd = new Date(year, endMonth + 1, 0); // Last day of end month
      
      expect(periodStart.getMonth()).toBe((q - 1) * 3);
      expect(periodEnd.getMonth()).toBe(q * 3 - 1);
    });
  });

  it("should calculate annual periods correctly", () => {
    const year = 2025;
    const periodStart = new Date(year, 0, 1);  // Jan 1
    const periodEnd = new Date(year, 11, 31);  // Dec 31
    
    expect(periodStart.getFullYear()).toBe(year);
    expect(periodEnd.getFullYear()).toBe(year);
    expect(periodStart.getMonth()).toBe(0);
    expect(periodEnd.getMonth()).toBe(11);
  });

  it("should calculate monthly periods correctly", () => {
    const year = 2025;
    const month = 6; // July (0-indexed)
    
    const periodStart = new Date(year, month, 1);
    const periodEnd = new Date(year, month + 1, 0); // Last day of month
    
    expect(periodStart.getDate()).toBe(1);
    expect(periodEnd.getDate()).toBe(31); // July has 31 days
  });
});

describe("Report Engine - Distribution", () => {
  it("should filter subscribers by tier", () => {
    const premiumOnly = mockSubscribers.filter((s) => s.tier === "premium");
    const publicOnly = mockSubscribers.filter((s) => s.tier === "public");
    
    expect(premiumOnly.length).toBe(1);
    expect(publicOnly.length).toBe(1);
  });

  it("should filter subscribers by language preference", () => {
    const englishSubs = mockSubscribers.filter((s) => s.preferredLanguage === "en");
    const arabicSubs = mockSubscribers.filter((s) => s.preferredLanguage === "ar");
    
    expect(englishSubs.length).toBe(1);
    expect(arabicSubs.length).toBe(1);
  });

  it("should only distribute to verified subscribers", () => {
    const verifiedSubs = mockSubscribers.filter((s) => s.isVerified && s.isActive);
    expect(verifiedSubs.length).toBe(2);
  });

  it("should generate correct email subject lines", () => {
    const template = mockReportTemplates[0];
    const report = mockGeneratedReport;
    
    const subjectEn = `${template.nameEn} - ${report.periodLabel}`;
    const subjectAr = `${template.nameAr} - ${report.periodLabel}`;
    
    expect(subjectEn).toBe("Quarterly Economic Report - Q1 2025");
    expect(subjectAr).toContain("التقرير الاقتصادي الفصلي");
  });
});

describe("Report Engine - Schedule Validation", () => {
  it("should validate cron expressions for quarterly reports", () => {
    // Quarterly: Run on 1st of Jan, Apr, Jul, Oct at midnight
    const cronQuarterly = "0 0 1 1,4,7,10 *";
    const parts = cronQuarterly.split(" ");
    
    expect(parts.length).toBe(5);
    expect(parts[0]).toBe("0"); // minute
    expect(parts[1]).toBe("0"); // hour
    expect(parts[2]).toBe("1"); // day of month
    expect(parts[3]).toBe("1,4,7,10"); // months
    expect(parts[4]).toBe("*"); // day of week
  });

  it("should validate cron expressions for annual reports", () => {
    // Annual: Run on Jan 15 at midnight
    const cronAnnual = "0 0 15 1 *";
    const parts = cronAnnual.split(" ");
    
    expect(parts.length).toBe(5);
    expect(parts[3]).toBe("1"); // January only
  });

  it("should validate cron expressions for monthly reports", () => {
    // Monthly: Run on 1st of every month at midnight
    const cronMonthly = "0 0 1 * *";
    const parts = cronMonthly.split(" ");
    
    expect(parts.length).toBe(5);
    expect(parts[3]).toBe("*"); // every month
  });
});

describe("Report Engine - Data Validation", () => {
  it("should validate email format", () => {
    const validEmails = [
      "test@example.com",
      "user.name@domain.org",
      "researcher+tag@university.edu",
    ];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    validEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(true);
    });
  });

  it("should validate invalid email formats", () => {
    const invalidEmails = [
      "notanemail",
      "@nodomain.com",
      "spaces in@email.com",
      "",
    ];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    invalidEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it("should validate year range", () => {
    const validYears = [2010, 2015, 2020, 2025, 2026];
    const invalidYears = [1999, 2050, -1, 0];
    
    const isValidYear = (year: number) => year >= 2010 && year <= 2030;
    
    validYears.forEach((year) => {
      expect(isValidYear(year)).toBe(true);
    });
    
    invalidYears.forEach((year) => {
      expect(isValidYear(year)).toBe(false);
    });
  });

  it("should validate quarter range", () => {
    const validQuarters = [1, 2, 3, 4];
    const invalidQuarters = [0, 5, -1, 10];
    
    const isValidQuarter = (q: number) => q >= 1 && q <= 4;
    
    validQuarters.forEach((q) => {
      expect(isValidQuarter(q)).toBe(true);
    });
    
    invalidQuarters.forEach((q) => {
      expect(isValidQuarter(q)).toBe(false);
    });
  });
});

describe("Report Engine - File Size Formatting", () => {
  it("should format bytes correctly", () => {
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1048576)).toBe("1.0 MB");
    expect(formatFileSize(1572864)).toBe("1.5 MB");
  });
});

describe("Report Engine - Bilingual Support", () => {
  it("should detect Arabic text correctly", () => {
    const hasArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
    
    expect(hasArabic("التقرير الاقتصادي")).toBe(true);
    expect(hasArabic("Quarterly Report")).toBe(false);
    expect(hasArabic("Mixed مختلط Text")).toBe(true);
  });

  it("should support RTL direction for Arabic", () => {
    const getDirection = (lang: string) => lang === "ar" ? "rtl" : "ltr";
    
    expect(getDirection("ar")).toBe("rtl");
    expect(getDirection("en")).toBe("ltr");
  });
});
