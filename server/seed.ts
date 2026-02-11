/**
 * YETO Database Seed Script
 * Seeds the database with sample Yemen economic data for demonstration.
 *
 * Sources are seeded into the canonical `source_registry` table.
 * Run with: npx tsx server/seed.ts
 *
 * NOTE: For full source registry population (292+ sources), run:
 *   npx tsx scripts/import-registry.ts
 */

import { getDb } from "./db";
import {
  sourceRegistry,
  timeSeries,
  economicEvents,
  glossaryTerms,
  stakeholders,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Starting database seed...\n");

  const db = await getDb();
  if (!db) {
    console.error("Could not connect to database. Make sure DATABASE_URL is set.");
    process.exit(1);
  }

  try {
    // ============================================================================
    // SEED SOURCES (into sourceRegistry — the canonical source table)
    // ============================================================================
    console.log("Seeding sources into source_registry...");

    const seedSources = [
      {
        sourceId: "SEED-CBY-ADEN",
        name: "Central Bank of Yemen - Aden",
        publisher: "Central Bank of Yemen - Aden",
        webUrl: "https://cby-ye.com",
        license: "Government Public Data",
        tier: "T0" as const,
        status: "ACTIVE" as const,
        accessType: "WEB" as const,
        updateFrequency: "MONTHLY" as const,
        regimeApplicability: "ADEN_IRG" as const,
        description: "Official IRG central bank data",
        notes: "Official IRG central bank data",
      },
      {
        sourceId: "SEED-CBY-SANAA",
        name: "Central Bank of Yemen - Sana'a",
        publisher: "Central Bank of Yemen - Sana'a",
        license: "Government Public Data",
        tier: "T0" as const,
        status: "ACTIVE" as const,
        accessType: "WEB" as const,
        updateFrequency: "MONTHLY" as const,
        regimeApplicability: "SANAA_DFA" as const,
        description: "DFA central bank data",
        notes: "DFA central bank data",
      },
      {
        sourceId: "SEED-WORLD-BANK",
        name: "World Bank",
        publisher: "World Bank",
        webUrl: "https://data.worldbank.org/country/yemen",
        license: "CC-BY-4.0",
        tier: "T1" as const,
        status: "ACTIVE" as const,
        accessType: "API" as const,
        updateFrequency: "QUARTERLY" as const,
        regimeApplicability: "GLOBAL" as const,
        description: "International development data",
        notes: "International development data",
      },
      {
        sourceId: "SEED-UN-OCHA",
        name: "UN OCHA",
        publisher: "UN OCHA",
        webUrl: "https://unocha.org/yemen",
        license: "CC-BY-3.0-IGO",
        tier: "T1" as const,
        status: "ACTIVE" as const,
        accessType: "API" as const,
        updateFrequency: "WEEKLY" as const,
        regimeApplicability: "BOTH" as const,
        description: "Humanitarian coordination data",
        notes: "Humanitarian coordination data",
      },
      {
        sourceId: "SEED-WFP",
        name: "WFP - World Food Programme",
        publisher: "WFP",
        webUrl: "https://www.wfp.org/countries/yemen",
        license: "CC-BY-4.0",
        tier: "T1" as const,
        status: "ACTIVE" as const,
        accessType: "API" as const,
        updateFrequency: "MONTHLY" as const,
        regimeApplicability: "BOTH" as const,
        description: "Food security and market data",
        notes: "Food security and market data",
      },
      {
        sourceId: "SEED-SANAA-CENTER",
        name: "Sana'a Center for Strategic Studies",
        publisher: "Sana'a Center for Strategic Studies",
        webUrl: "https://sanaacenter.org",
        license: "CC-BY-NC-4.0",
        tier: "T2" as const,
        status: "ACTIVE" as const,
        accessType: "WEB" as const,
        updateFrequency: "IRREGULAR" as const,
        regimeApplicability: "BOTH" as const,
        description: "Research and analysis",
        notes: "Research and analysis",
      },
      {
        sourceId: "SEED-ACAPS",
        name: "ACAPS",
        publisher: "ACAPS",
        webUrl: "https://www.acaps.org/country/yemen",
        license: "CC-BY-NC-4.0",
        tier: "T2" as const,
        status: "ACTIVE" as const,
        accessType: "WEB" as const,
        updateFrequency: "WEEKLY" as const,
        regimeApplicability: "BOTH" as const,
        description: "Humanitarian analysis",
        notes: "Humanitarian analysis",
      },
    ];

    // Look up or insert each seed source, collecting their IDs
    const sourceIdMap: Record<string, number> = {};

    for (const src of seedSources) {
      try {
        // Check if already exists by sourceId
        const existing = await db
          .select({ id: sourceRegistry.id })
          .from(sourceRegistry)
          .where(eq(sourceRegistry.sourceId, src.sourceId))
          .limit(1);

        if (existing.length > 0) {
          sourceIdMap[src.sourceId] = existing[0].id;
        } else {
          const result = await db.insert(sourceRegistry).values(src);
          sourceIdMap[src.sourceId] = Number(result[0].insertId);
        }
      } catch (e) {
        // Skip on error (e.g., duplicate name)
        console.warn(`  Warning: Could not seed ${src.sourceId}:`, e);
      }
    }
    console.log(`  Seeded ${Object.keys(sourceIdMap).length} sources into source_registry\n`);

    // Map old sourceId numbers (1-7) to new sourceRegistry IDs
    const cbyAdenId = sourceIdMap["SEED-CBY-ADEN"];
    const cbySanaaId = sourceIdMap["SEED-CBY-SANAA"];
    const worldBankId = sourceIdMap["SEED-WORLD-BANK"];
    const wfpId = sourceIdMap["SEED-WFP"];
    const sanaaCenterId = sourceIdMap["SEED-SANAA-CENTER"];

    // ============================================================================
    // SEED TIME SERIES DATA
    // ============================================================================
    console.log("Seeding time series data...");

    const fxData = [];
    let adenRate = 1850;
    let sanaaRate = 535;

    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 28; day += 7) {
        const date = new Date(2024, month - 1, day);

        adenRate = adenRate + (Math.random() * 30 - 10);
        fxData.push({
          indicatorCode: "FX_RATE_PARALLEL",
          regimeTag: "aden_irg" as const,
          date,
          value: String(Math.round(adenRate * 100) / 100),
          unit: "YER/USD",
          confidenceRating: "A" as const,
          sourceId: cbyAdenId,
        });

        sanaaRate = sanaaRate + (Math.random() * 5 - 2.5);
        fxData.push({
          indicatorCode: "FX_RATE_PARALLEL",
          regimeTag: "sanaa_defacto" as const,
          date,
          value: String(Math.round(sanaaRate * 100) / 100),
          unit: "YER/USD",
          confidenceRating: "B" as const,
          sourceId: cbySanaaId,
        });
      }
    }

    let insertedCount = 0;
    for (const data of fxData) {
      try {
        await db.insert(timeSeries).values(data);
        insertedCount++;
      } catch (e) {
        // Skip duplicates
      }
    }
    console.log(`  Seeded ${insertedCount} FX rate data points\n`);

    // ============================================================================
    // SEED ECONOMIC EVENTS
    // ============================================================================
    console.log("Seeding economic events...");

    const eventsData = [
      {
        title: "CBY-Aden announces new monetary policy measures",
        titleAr: "البنك المركزي-عدن يعلن إجراءات نقدية جديدة",
        description: "Central Bank of Yemen in Aden announces new measures to stabilize the exchange rate including interest rate adjustments and foreign reserve management.",
        descriptionAr: "البنك المركزي اليمني في عدن يعلن إجراءات جديدة لتحقيق استقرار سعر الصرف تشمل تعديلات أسعار الفائدة وإدارة الاحتياطيات الأجنبية.",
        eventDate: new Date("2024-12-15"),
        regimeTag: "aden_irg" as const,
        category: "monetary_policy",
        impactLevel: "high" as const,
        sourceId: cbyAdenId,
      },
      {
        title: "WFP warns of funding shortfall for 2025",
        titleAr: "برنامج الأغذية العالمي يحذر من نقص التمويل لعام 2025",
        description: "World Food Programme warns that funding shortfall may force reduction in food assistance to millions of Yemenis.",
        descriptionAr: "برنامج الأغذية العالمي يحذر من أن نقص التمويل قد يجبر على تقليص المساعدات الغذائية لملايين اليمنيين.",
        eventDate: new Date("2024-11-20"),
        regimeTag: "mixed" as const,
        category: "humanitarian",
        impactLevel: "high" as const,
        sourceId: wfpId,
      },
      {
        title: "Fuel prices increase in IRG-controlled areas",
        titleAr: "ارتفاع أسعار الوقود في مناطق الشرعية",
        description: "Fuel prices increase by 15% in areas controlled by the internationally recognized government due to currency depreciation.",
        descriptionAr: "ارتفاع أسعار الوقود بنسبة 15% في المناطق الخاضعة لسيطرة الحكومة المعترف بها دولياً بسبب انخفاض قيمة العملة.",
        eventDate: new Date("2024-10-01"),
        regimeTag: "aden_irg" as const,
        category: "energy",
        impactLevel: "medium" as const,
        sourceId: sanaaCenterId,
      },
      {
        title: "Saudi deposit supports CBY-Aden reserves",
        titleAr: "وديعة سعودية تدعم احتياطيات البنك المركزي-عدن",
        description: "Saudi Arabia deposits $250 million to support Central Bank of Yemen reserves and stabilize the currency.",
        descriptionAr: "المملكة العربية السعودية تودع 250 مليون دولار لدعم احتياطيات البنك المركزي اليمني وتحقيق استقرار العملة.",
        eventDate: new Date("2024-09-15"),
        regimeTag: "aden_irg" as const,
        category: "banking",
        impactLevel: "high" as const,
        sourceId: worldBankId,
      },
      {
        title: "DFA reinforces ban on new banknotes",
        titleAr: "سلطات الأمر الواقع تعزز حظر الأوراق النقدية الجديدة",
        description: "De facto authorities reinforce ban on post-2016 banknotes in areas under their control, deepening monetary split.",
        descriptionAr: "سلطات الأمر الواقع تعزز حظر الأوراق النقدية المطبوعة بعد 2016 في المناطق الخاضعة لسيطرتها، مما يعمق الانقسام النقدي.",
        eventDate: new Date("2024-08-01"),
        regimeTag: "sanaa_defacto" as const,
        category: "monetary_policy",
        impactLevel: "high" as const,
        sourceId: sanaaCenterId,
      },
    ];

    for (const event of eventsData) {
      try {
        await db.insert(economicEvents).values(event);
      } catch (e) {
        // Skip duplicates
      }
    }
    console.log(`  Seeded ${eventsData.length} economic events\n`);

    // ============================================================================
    // SEED GLOSSARY TERMS
    // ============================================================================
    console.log("Seeding glossary terms...");

    const glossaryData = [
      {
        termEn: "IRG",
        termAr: "الحكومة المعترف بها دولياً",
        definitionEn: "Internationally Recognized Government of Yemen, based in Aden. The government recognized by the United Nations and international community.",
        definitionAr: "الحكومة اليمنية المعترف بها دولياً، ومقرها عدن. الحكومة المعترف بها من قبل الأمم المتحدة والمجتمع الدولي.",
        category: "political",
      },
      {
        termEn: "DFA",
        termAr: "سلطات الأمر الواقع",
        definitionEn: "De Facto Authorities controlling northern Yemen including Sana'a. Also referred to as Ansar Allah or Houthis.",
        definitionAr: "السلطات التي تسيطر فعلياً على شمال اليمن بما في ذلك صنعاء. يشار إليها أيضاً بأنصار الله أو الحوثيين.",
        category: "political",
      },
      {
        termEn: "Parallel Market Rate",
        termAr: "سعر السوق الموازي",
        definitionEn: "Exchange rate determined by market forces outside official banking channels. Often differs significantly from official rates.",
        definitionAr: "سعر الصرف المحدد بقوى السوق خارج القنوات المصرفية الرسمية. غالباً ما يختلف بشكل كبير عن الأسعار الرسمية.",
        category: "economic",
      },
      {
        termEn: "IPC",
        termAr: "التصنيف المرحلي المتكامل",
        definitionEn: "Integrated Food Security Phase Classification - global standard for food security analysis. Phase 3+ indicates acute food insecurity.",
        definitionAr: "التصنيف المرحلي المتكامل للأمن الغذائي - المعيار العالمي لتحليل الأمن الغذائي. المرحلة 3+ تشير إلى انعدام الأمن الغذائي الحاد.",
        category: "humanitarian",
      },
      {
        termEn: "CBY",
        termAr: "البنك المركزي اليمني",
        definitionEn: "Central Bank of Yemen - split between Aden (IRG) and Sana'a (DFA) since 2016, creating a dual monetary system.",
        definitionAr: "البنك المركزي اليمني - منقسم بين عدن (الشرعية) وصنعاء (الأمر الواقع) منذ 2016، مما أنشأ نظاماً نقدياً مزدوجاً.",
        category: "economic",
      },
      {
        termEn: "Remittances",
        termAr: "التحويلات المالية",
        definitionEn: "Money sent by Yemeni diaspora workers to family members in Yemen. A critical source of foreign currency and household income.",
        definitionAr: "الأموال المرسلة من العمال اليمنيين في المهجر إلى أسرهم في اليمن. مصدر حيوي للعملات الأجنبية ودخل الأسر.",
        category: "economic",
      },
      {
        termEn: "YHRP",
        termAr: "خطة الاستجابة الإنسانية لليمن",
        definitionEn: "Yemen Humanitarian Response Plan - annual UN-coordinated humanitarian funding appeal for Yemen operations.",
        definitionAr: "خطة الاستجابة الإنسانية لليمن - نداء التمويل الإنساني السنوي المنسق من الأمم المتحدة لعمليات اليمن.",
        category: "humanitarian",
      },
      {
        termEn: "HSA Group",
        termAr: "مجموعة هائل سعيد أنعم",
        definitionEn: "Hayel Saeed Anam Group - Yemen's largest conglomerate with interests in food, manufacturing, banking, and logistics.",
        definitionAr: "مجموعة هائل سعيد أنعم - أكبر تكتل تجاري في اليمن مع مصالح في الغذاء والتصنيع والمصارف والخدمات اللوجستية.",
        category: "economic",
      },
    ];

    for (const term of glossaryData) {
      try {
        await db.insert(glossaryTerms).values(term);
      } catch (e) {
        // Skip duplicates
      }
    }
    console.log(`  Seeded ${glossaryData.length} glossary terms\n`);

    // ============================================================================
    // SEED STAKEHOLDERS
    // ============================================================================
    console.log("Seeding stakeholders...");

    const stakeholdersData = [
      {
        name: "Hayel Saeed Anam Group (HSA)",
        nameAr: "مجموعة هائل سعيد أنعم",
        type: "private_sector" as const,
        country: "Yemen",
        website: "https://www.hsa.com.ye",
        notes: "Yemen's largest conglomerate with interests in food, manufacturing, and banking",
      },
      {
        name: "Central Bank of Yemen - Aden",
        nameAr: "البنك المركزي اليمني - عدن",
        type: "government" as const,
        country: "Yemen",
        website: "https://cby-ye.com",
        notes: "Central bank branch recognized by international community",
      },
      {
        name: "Central Bank of Yemen - Sana'a",
        nameAr: "البنك المركزي اليمني - صنعاء",
        type: "government" as const,
        country: "Yemen",
        notes: "Central bank branch under de facto authority control",
      },
      {
        name: "World Bank Yemen Office",
        nameAr: "مكتب البنك الدولي في اليمن",
        type: "international_org" as const,
        country: "International",
        website: "https://www.worldbank.org/en/country/yemen",
        notes: "International development finance institution",
      },
      {
        name: "UN OCHA Yemen",
        nameAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية - اليمن",
        type: "international_org" as const,
        country: "International",
        website: "https://www.unocha.org/yemen",
        notes: "Humanitarian coordination office",
      },
      {
        name: "Sana'a Center for Strategic Studies",
        nameAr: "مركز صنعاء للدراسات الاستراتيجية",
        type: "research_institution" as const,
        country: "Yemen",
        website: "https://sanaacenter.org",
        notes: "Independent think tank focused on Yemen",
      },
    ];

    for (const stakeholder of stakeholdersData) {
      try {
        await db.insert(stakeholders).values(stakeholder);
      } catch (e) {
        // Skip duplicates
      }
    }
    console.log(`  Seeded ${stakeholdersData.length} stakeholders\n`);

    console.log("Database seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\nSeed script finished!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nSeed script failed:", error);
    process.exit(1);
  });
