/**
 * Poverty & Human Development Router
 * API endpoints for poverty, HDI, food security, health, education, and humanitarian data
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { povertyHumandevAgent } from "../services/povertyHumandevAgent";

export const povertyHumandevRouter = router({
  // Get current indicators with evidence packs
  getCurrentIndicators: publicProcedure.query(async () => {
    return await povertyHumandevAgent.getCurrentIndicators();
  }),
  
  // Get daily digest
  getDailyDigest: publicProcedure.query(async () => {
    return await povertyHumandevAgent.generateDailyDigest();
  }),
  
  // Get weekly bulletin
  getWeeklyBulletin: publicProcedure.query(async () => {
    return await povertyHumandevAgent.generateWeeklyBulletin();
  }),
  
  // Get monthly monitor
  getMonthlyMonitor: publicProcedure.query(async () => {
    return await povertyHumandevAgent.generateMonthlyMonitor();
  }),
  
  // Get methodology documentation
  getMethodology: publicProcedure.query(() => {
    return povertyHumandevAgent.getMethodology();
  }),
  
  // Export methodology as PDF content
  exportMethodologyPDF: publicProcedure.query(async () => {
    return await povertyHumandevAgent.exportMethodologyPDF();
  }),
  
  // Check and generate alerts
  checkAlerts: protectedProcedure.query(async () => {
    return await povertyHumandevAgent.checkAndGenerateAlerts();
  }),
  
  // Get governorate-level poverty data
  getGovernorateData: publicProcedure.query(async () => {
    return [
      { name: "Hodeidah", nameAr: "الحديدة", poverty: 89, foodInsecurity: 85, hdi: 0.38, priority: "critical" },
      { name: "Hajjah", nameAr: "حجة", poverty: 87, foodInsecurity: 82, hdi: 0.39, priority: "critical" },
      { name: "Sa'ada", nameAr: "صعدة", poverty: 85, foodInsecurity: 80, hdi: 0.40, priority: "critical" },
      { name: "Taiz", nameAr: "تعز", poverty: 82, foodInsecurity: 78, hdi: 0.42, priority: "high" },
      { name: "Al Jawf", nameAr: "الجوف", poverty: 81, foodInsecurity: 76, hdi: 0.41, priority: "high" },
      { name: "Ibb", nameAr: "إب", poverty: 78, foodInsecurity: 72, hdi: 0.44, priority: "high" },
      { name: "Sana'a", nameAr: "صنعاء", poverty: 72, foodInsecurity: 68, hdi: 0.46, priority: "medium" },
      { name: "Aden", nameAr: "عدن", poverty: 65, foodInsecurity: 60, hdi: 0.50, priority: "medium" },
    ];
  }),
  
  // Get HDI components data
  getHDIComponents: publicProcedure.query(async () => {
    return {
      current: {
        hdi: 0.424,
        lifeExpectancy: 66.1,
        expectedSchooling: 8.8,
        meanSchooling: 3.2,
        gniPerCapita: 1594,
      },
      historical: [
        { year: 2010, hdi: 0.498, lifeExpectancy: 64.5, expectedSchooling: 9.2, meanSchooling: 3.0, gniPerCapita: 2213 },
        { year: 2015, hdi: 0.482, lifeExpectancy: 65.2, expectedSchooling: 9.0, meanSchooling: 3.1, gniPerCapita: 1804 },
        { year: 2020, hdi: 0.455, lifeExpectancy: 65.8, expectedSchooling: 8.6, meanSchooling: 3.2, gniPerCapita: 1489 },
        { year: 2024, hdi: 0.424, lifeExpectancy: 66.1, expectedSchooling: 8.8, meanSchooling: 3.2, gniPerCapita: 1594 },
      ],
      rank: 183,
      totalCountries: 193,
      category: "Low Human Development",
    };
  }),
  
  // Get food security data
  getFoodSecurityData: publicProcedure.query(async () => {
    return {
      current: {
        totalPopulation: 33.0,
        ipcPhase3Plus: 21.6,
        ipcPhase4Plus: 6.1,
        ipcPhase5: 0.16,
        wfpBeneficiaries: 13.0,
      },
      historical: [
        { year: 2015, ipcPhase3Plus: 14.4, percentage: 53 },
        { year: 2017, ipcPhase3Plus: 17.0, percentage: 60 },
        { year: 2019, ipcPhase3Plus: 15.9, percentage: 53 },
        { year: 2021, ipcPhase3Plus: 16.2, percentage: 54 },
        { year: 2023, ipcPhase3Plus: 21.6, percentage: 71 },
        { year: 2024, ipcPhase3Plus: 21.6, percentage: 71 },
      ],
      sources: ["IPC", "WFP", "FAO"],
    };
  }),
  
  // Get humanitarian funding data
  getHumanitarianFunding: publicProcedure.query(async () => {
    return {
      current: {
        year: 2024,
        required: 2100000000,
        received: 882000000,
        fundedPercentage: 42,
        gap: 1218000000,
      },
      historical: [
        { year: 2019, required: 4190000000, received: 3620000000, percentage: 86 },
        { year: 2020, required: 3380000000, received: 1900000000, percentage: 56 },
        { year: 2021, required: 3850000000, received: 2270000000, percentage: 59 },
        { year: 2022, required: 4270000000, received: 2130000000, percentage: 50 },
        { year: 2023, required: 4340000000, received: 1590000000, percentage: 37 },
        { year: 2024, required: 2100000000, received: 882000000, percentage: 42 },
      ],
      topDonors: [
        { name: "United States", amount: 350000000 },
        { name: "Saudi Arabia", amount: 150000000 },
        { name: "European Union", amount: 120000000 },
        { name: "United Kingdom", amount: 85000000 },
        { name: "Germany", amount: 75000000 },
      ],
      sources: ["UN OCHA FTS", "CERF"],
    };
  }),
  
  // Get data gaps and access workflows
  getDataGaps: publicProcedure.query(async () => {
    return {
      gaps: [
        {
          indicator: "Household Survey",
          lastAvailable: "2014",
          status: "critical",
          accessWorkflow: "Request through World Bank Yemen team",
          priority: "high",
        },
        {
          indicator: "Sub-national Poverty Estimates",
          lastAvailable: "2019 (projections)",
          status: "limited",
          accessWorkflow: "UNDP Yemen office",
          priority: "high",
        },
        {
          indicator: "Employment Statistics",
          lastAvailable: "2013",
          status: "critical",
          accessWorkflow: "ILO regional office",
          priority: "medium",
        },
        {
          indicator: "Education Enrollment",
          lastAvailable: "2021",
          status: "partial",
          accessWorkflow: "UNICEF Yemen",
          priority: "medium",
        },
      ],
      accessWorkflows: [
        {
          organization: "World Bank",
          contact: "Yemen Country Office",
          process: "Submit data request through official channels",
          timeline: "2-4 weeks",
        },
        {
          organization: "UNDP",
          contact: "Yemen Human Development Team",
          process: "Request through HDR data portal",
          timeline: "1-2 weeks",
        },
        {
          organization: "UN OCHA",
          contact: "Yemen Humanitarian Coordinator",
          process: "Access through HDX platform",
          timeline: "Immediate (public data)",
        },
      ],
    };
  }),
});
