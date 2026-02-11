/**
 * YETO Database Seed Script (Legacy MJS version)
 *
 * @deprecated Use `npx tsx server/seed.ts` instead.
 * This legacy .mjs seed uses schema.sourceRegistry (unified source table).
 * Run with: node server/seed.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Starting database seed...\n");

  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // ============================================================================
    // SEED SOURCES
    // ============================================================================
    console.log("📚 Seeding sources...");
    
    // Sources are now seeded into the canonical sourceRegistry table
    const sourcesData = [
      { sourceId: "SEED-CBY-ADEN", name: "Central Bank of Yemen - Aden", publisher: "Central Bank of Yemen - Aden", webUrl: "https://cby-ye.com", tier: "T0", status: "ACTIVE", accessType: "WEB", updateFrequency: "MONTHLY" },
      { sourceId: "SEED-CBY-SANAA", name: "Central Bank of Yemen - Sana'a", publisher: "Central Bank of Yemen - Sana'a", tier: "T0", status: "ACTIVE", accessType: "WEB", updateFrequency: "MONTHLY" },
      { sourceId: "SEED-WORLD-BANK", name: "World Bank", publisher: "World Bank", webUrl: "https://www.worldbank.org/en/country/yemen", tier: "T1", status: "ACTIVE", accessType: "API", updateFrequency: "QUARTERLY" },
      { sourceId: "SEED-WFP", name: "World Food Programme", publisher: "WFP", webUrl: "https://www.wfp.org/countries/yemen", tier: "T1", status: "ACTIVE", accessType: "API", updateFrequency: "MONTHLY" },
      { sourceId: "SEED-IMF", name: "IMF", publisher: "IMF", webUrl: "https://www.imf.org/en/Countries/YEM", tier: "T1", status: "ACTIVE", accessType: "API", updateFrequency: "QUARTERLY" },
      { sourceId: "SEED-OCHA", name: "OCHA Yemen", publisher: "UN OCHA", webUrl: "https://www.unocha.org/yemen", tier: "T1", status: "ACTIVE", accessType: "API", updateFrequency: "WEEKLY" },
      { sourceId: "SEED-SANAA-CENTER", name: "Sana'a Center for Strategic Studies", publisher: "Sana'a Center", webUrl: "https://sanaacenter.org", tier: "T2", status: "ACTIVE", accessType: "WEB", updateFrequency: "IRREGULAR" },
      { sourceId: "SEED-IPC", name: "IPC Global Platform", publisher: "IPC", webUrl: "https://www.ipcinfo.org", tier: "T1", status: "ACTIVE", accessType: "API", updateFrequency: "QUARTERLY" },
    ];

    for (const source of sourcesData) {
      await db.insert(schema.sourceRegistry).values(source).onDuplicateKeyUpdate({
        set: { name: source.name },
      });
    }
    console.log(`  ✓ Seeded ${sourcesData.length} sources into source_registry`);

    // Look up actual numeric IDs for the seeded sources
    const sourceIdMap = {};
    for (const source of sourcesData) {
      const [rows] = await connection.execute(
        'SELECT id FROM source_registry WHERE sourceId = ?',
        [source.sourceId]
      );
      if (rows.length > 0) {
        sourceIdMap[source.sourceId] = rows[0].id;
      }
    }
    console.log(`  ✓ Resolved ${Object.keys(sourceIdMap).length} source IDs`);

    // ============================================================================
    // SEED INDICATORS
    // ============================================================================
    console.log("📊 Seeding indicators...");

    const indicatorsData = [
      {
        code: "fx_rate_usd",
        nameEn: "USD Exchange Rate",
        nameAr: "سعر صرف الدولار",
        descriptionEn: "Yemeni Rial to US Dollar exchange rate",
        descriptionAr: "سعر صرف الريال اليمني مقابل الدولار الأمريكي",
        unit: "YER/USD",
        sector: "currency",
        frequency: "daily",
        methodology: "Market rate from licensed exchange bureaus",
      },
      {
        code: "inflation_cpi",
        nameEn: "Consumer Price Index",
        nameAr: "مؤشر أسعار المستهلك",
        descriptionEn: "Year-over-year change in consumer prices",
        descriptionAr: "التغير السنوي في أسعار المستهلك",
        unit: "%",
        sector: "prices",
        frequency: "monthly",
        methodology: "Based on basket of goods and services",
      },
      {
        code: "food_basket_cost",
        nameEn: "Minimum Food Basket Cost",
        nameAr: "تكلفة الحد الأدنى لسلة الغذاء",
        descriptionEn: "Cost of minimum food basket for a family of 7",
        descriptionAr: "تكلفة الحد الأدنى لسلة الغذاء لأسرة من 7 أفراد",
        unit: "YER",
        sector: "food_security",
        frequency: "monthly",
        methodology: "WFP market monitoring",
      },
      {
        code: "fuel_price_petrol",
        nameEn: "Petrol Price",
        nameAr: "سعر البنزين",
        descriptionEn: "Price per liter of petrol",
        descriptionAr: "سعر لتر البنزين",
        unit: "YER/L",
        sector: "energy",
        frequency: "weekly",
        methodology: "Market survey",
      },
      {
        code: "fuel_price_diesel",
        nameEn: "Diesel Price",
        nameAr: "سعر الديزل",
        descriptionEn: "Price per liter of diesel",
        descriptionAr: "سعر لتر الديزل",
        unit: "YER/L",
        sector: "energy",
        frequency: "weekly",
        methodology: "Market survey",
      },
      {
        code: "poverty_rate",
        nameEn: "Poverty Rate",
        nameAr: "معدل الفقر",
        descriptionEn: "Percentage of population below poverty line",
        descriptionAr: "نسبة السكان تحت خط الفقر",
        unit: "%",
        sector: "poverty",
        frequency: "annual",
        methodology: "World Bank estimates",
      },
      {
        code: "food_insecurity_rate",
        nameEn: "Food Insecurity Rate",
        nameAr: "معدل انعدام الأمن الغذائي",
        descriptionEn: "Percentage of population facing food insecurity (IPC 3+)",
        descriptionAr: "نسبة السكان الذين يواجهون انعدام الأمن الغذائي",
        unit: "%",
        sector: "food_security",
        frequency: "biannual",
        methodology: "IPC analysis",
      },
      {
        code: "remittances_inflow",
        nameEn: "Remittance Inflows",
        nameAr: "تدفقات التحويلات",
        descriptionEn: "Total remittance inflows",
        descriptionAr: "إجمالي تدفقات التحويلات",
        unit: "USD millions",
        sector: "banking",
        frequency: "quarterly",
        methodology: "Central bank data and estimates",
      },
      {
        code: "gdp_nominal",
        nameEn: "Nominal GDP",
        nameAr: "الناتج المحلي الإجمالي الاسمي",
        descriptionEn: "Gross Domestic Product at current prices",
        descriptionAr: "الناتج المحلي الإجمالي بالأسعار الجارية",
        unit: "USD billions",
        sector: "macroeconomy",
        frequency: "annual",
        methodology: "World Bank/IMF estimates",
      },
      {
        code: "imports_total",
        nameEn: "Total Imports",
        nameAr: "إجمالي الواردات",
        descriptionEn: "Total value of imports",
        descriptionAr: "إجمالي قيمة الواردات",
        unit: "USD millions",
        sector: "trade",
        frequency: "monthly",
        methodology: "Port data and estimates",
      },
    ];

    for (const indicator of indicatorsData) {
      await db.insert(schema.indicators).values(indicator).onDuplicateKeyUpdate({
        set: { nameEn: indicator.nameEn },
      });
    }
    console.log(`  ✓ Seeded ${indicatorsData.length} indicators`);

    // ============================================================================
    // SEED TIME SERIES DATA
    // ============================================================================
    console.log("📈 Seeding time series data...");

    // Exchange rate data - Aden
    const fxRateAdenData = [
      { date: "2024-01-01", value: 1550 },
      { date: "2024-02-01", value: 1580 },
      { date: "2024-03-01", value: 1620 },
      { date: "2024-04-01", value: 1680 },
      { date: "2024-05-01", value: 1720 },
      { date: "2024-06-01", value: 1780 },
      { date: "2024-07-01", value: 1850 },
      { date: "2024-08-01", value: 1920 },
      { date: "2024-09-01", value: 1980 },
      { date: "2024-10-01", value: 2050 },
      { date: "2024-11-01", value: 2100 },
      { date: "2024-12-01", value: 2150 },
    ];

    for (const data of fxRateAdenData) {
      await db.insert(schema.timeSeriesData).values({
        indicatorCode: "fx_rate_usd",
        regimeTag: "aden_irg",
        date: new Date(data.date),
        value: data.value.toString(),
        confidenceRating: "A",
        sourceId: sourceIdMap["SEED-CBY-ADEN"],
      }).onDuplicateKeyUpdate({
        set: { value: data.value.toString() },
      });
    }

    // Exchange rate data - Sana'a (more stable)
    const fxRateSanaaData = [
      { date: "2024-01-01", value: 535 },
      { date: "2024-02-01", value: 538 },
      { date: "2024-03-01", value: 540 },
      { date: "2024-04-01", value: 542 },
      { date: "2024-05-01", value: 545 },
      { date: "2024-06-01", value: 548 },
      { date: "2024-07-01", value: 550 },
      { date: "2024-08-01", value: 552 },
      { date: "2024-09-01", value: 555 },
      { date: "2024-10-01", value: 558 },
      { date: "2024-11-01", value: 560 },
      { date: "2024-12-01", value: 562 },
    ];

    for (const data of fxRateSanaaData) {
      await db.insert(schema.timeSeriesData).values({
        indicatorCode: "fx_rate_usd",
        regimeTag: "sanaa_defacto",
        date: new Date(data.date),
        value: data.value.toString(),
        confidenceRating: "B",
        sourceId: sourceIdMap["SEED-CBY-SANAA"],
      }).onDuplicateKeyUpdate({
        set: { value: data.value.toString() },
      });
    }

    // Food basket cost - Aden
    const foodBasketAdenData = [
      { date: "2024-01-01", value: 185000 },
      { date: "2024-02-01", value: 188000 },
      { date: "2024-03-01", value: 192000 },
      { date: "2024-04-01", value: 198000 },
      { date: "2024-05-01", value: 205000 },
      { date: "2024-06-01", value: 212000 },
      { date: "2024-07-01", value: 218000 },
      { date: "2024-08-01", value: 225000 },
      { date: "2024-09-01", value: 232000 },
      { date: "2024-10-01", value: 238000 },
      { date: "2024-11-01", value: 245000 },
      { date: "2024-12-01", value: 252000 },
    ];

    for (const data of foodBasketAdenData) {
      await db.insert(schema.timeSeriesData).values({
        indicatorCode: "food_basket_cost",
        regimeTag: "aden_irg",
        date: new Date(data.date),
        value: data.value.toString(),
        confidenceRating: "A",
        sourceId: sourceIdMap["SEED-WFP"],
      }).onDuplicateKeyUpdate({
        set: { value: data.value.toString() },
      });
    }

    // Food basket cost - Sana'a
    const foodBasketSanaaData = [
      { date: "2024-01-01", value: 95000 },
      { date: "2024-02-01", value: 96500 },
      { date: "2024-03-01", value: 98000 },
      { date: "2024-04-01", value: 99500 },
      { date: "2024-05-01", value: 101000 },
      { date: "2024-06-01", value: 102500 },
      { date: "2024-07-01", value: 104000 },
      { date: "2024-08-01", value: 105500 },
      { date: "2024-09-01", value: 107000 },
      { date: "2024-10-01", value: 108500 },
      { date: "2024-11-01", value: 110000 },
      { date: "2024-12-01", value: 112000 },
    ];

    for (const data of foodBasketSanaaData) {
      await db.insert(schema.timeSeriesData).values({
        indicatorCode: "food_basket_cost",
        regimeTag: "sanaa_defacto",
        date: new Date(data.date),
        value: data.value.toString(),
        confidenceRating: "A",
        sourceId: sourceIdMap["SEED-WFP"],
      }).onDuplicateKeyUpdate({
        set: { value: data.value.toString() },
      });
    }

    console.log(`  ✓ Seeded time series data for multiple indicators`);

    // ============================================================================
    // SEED ECONOMIC EVENTS
    // ============================================================================
    console.log("📅 Seeding economic events...");

    const eventsData = [
      {
        titleEn: "CBY-Aden issues new banknotes",
        titleAr: "البنك المركزي في عدن يصدر أوراق نقدية جديدة",
        descriptionEn: "The Central Bank of Yemen in Aden issued new 1000 YER banknotes, further deepening the currency bifurcation.",
        descriptionAr: "أصدر البنك المركزي اليمني في عدن أوراق نقدية جديدة من فئة 1000 ريال، مما يعمق انقسام العملة.",
        eventDate: new Date("2024-06-15"),
        category: "monetary_policy",
        regimeTag: "aden_irg",
        impactLevel: "high",
        linkedIndicators: JSON.stringify(["fx_rate_usd", "inflation_cpi"]),
      },
      {
        titleEn: "DFA bans new banknotes in northern areas",
        titleAr: "السلطة الفعلية تحظر الأوراق النقدية الجديدة في المناطق الشمالية",
        descriptionEn: "The De Facto Authority announced a ban on the circulation of new banknotes issued by CBY-Aden.",
        descriptionAr: "أعلنت السلطة الفعلية حظر تداول الأوراق النقدية الجديدة الصادرة عن البنك المركزي في عدن.",
        eventDate: new Date("2024-06-20"),
        category: "monetary_policy",
        regimeTag: "sanaa_defacto",
        impactLevel: "high",
        linkedIndicators: JSON.stringify(["fx_rate_usd"]),
      },
      {
        titleEn: "Saudi fuel grant arrives in Aden",
        titleAr: "وصول منحة الوقود السعودية إلى عدن",
        descriptionEn: "Saudi Arabia delivered a fuel grant to support power generation in government-controlled areas.",
        descriptionAr: "قدمت المملكة العربية السعودية منحة وقود لدعم توليد الكهرباء في المناطق الخاضعة لسيطرة الحكومة.",
        eventDate: new Date("2024-08-10"),
        category: "energy",
        regimeTag: "aden_irg",
        impactLevel: "medium",
        linkedIndicators: JSON.stringify(["fuel_price_diesel"]),
      },
      {
        titleEn: "WFP scales up food assistance",
        titleAr: "برنامج الغذاء العالمي يوسع المساعدات الغذائية",
        descriptionEn: "WFP announced expansion of food assistance to reach 13 million people across Yemen.",
        descriptionAr: "أعلن برنامج الغذاء العالمي توسيع المساعدات الغذائية للوصول إلى 13 مليون شخص في جميع أنحاء اليمن.",
        eventDate: new Date("2024-09-05"),
        category: "humanitarian",
        regimeTag: "mixed",
        impactLevel: "high",
        linkedIndicators: JSON.stringify(["food_insecurity_rate"]),
      },
      {
        titleEn: "Red Sea shipping disruptions impact imports",
        titleAr: "اضطرابات الشحن في البحر الأحمر تؤثر على الواردات",
        descriptionEn: "Houthi attacks on Red Sea shipping led to increased freight costs and delays in imports.",
        descriptionAr: "أدت هجمات الحوثيين على الشحن في البحر الأحمر إلى زيادة تكاليف الشحن وتأخير الواردات.",
        eventDate: new Date("2024-01-15"),
        category: "trade",
        regimeTag: "mixed",
        impactLevel: "high",
        linkedIndicators: JSON.stringify(["imports_total", "food_basket_cost"]),
      },
      {
        titleEn: "IPC releases acute food insecurity analysis",
        titleAr: "التصنيف المرحلي المتكامل يصدر تحليل انعدام الأمن الغذائي الحاد",
        descriptionEn: "IPC analysis shows 17.4 million Yemenis facing high levels of acute food insecurity.",
        descriptionAr: "يُظهر تحليل التصنيف المرحلي المتكامل أن 17.4 مليون يمني يواجهون مستويات عالية من انعدام الأمن الغذائي الحاد.",
        eventDate: new Date("2024-10-20"),
        category: "humanitarian",
        regimeTag: "mixed",
        impactLevel: "high",
        linkedIndicators: JSON.stringify(["food_insecurity_rate", "poverty_rate"]),
      },
    ];

    for (const event of eventsData) {
      await db.insert(schema.economicEvents).values(event).onDuplicateKeyUpdate({
        set: { titleEn: event.titleEn },
      });
    }
    console.log(`  ✓ Seeded ${eventsData.length} economic events`);

    // ============================================================================
    // SEED GLOSSARY TERMS
    // ============================================================================
    console.log("📖 Seeding glossary terms...");

    const glossaryData = [
      {
        termEn: "Currency Bifurcation",
        termAr: "انقسام العملة",
        definitionEn: "The situation where two versions of the Yemeni Rial circulate in different regions - old notes in DFA areas and new notes in IRG areas - with different exchange rates.",
        definitionAr: "الوضع الذي يتداول فيه نسختان من الريال اليمني في مناطق مختلفة - الأوراق القديمة في مناطق السلطة الفعلية والأوراق الجديدة في مناطق الحكومة - بأسعار صرف مختلفة.",
        category: "monetary",
        relatedTerms: JSON.stringify(["Exchange Rate", "Central Bank"]),
      },
      {
        termEn: "IRG (Internationally Recognized Government)",
        termAr: "الحكومة المعترف بها دولياً",
        definitionEn: "The government based in Aden, recognized by the UN and international community as the legitimate government of Yemen.",
        definitionAr: "الحكومة المتمركزة في عدن، المعترف بها من قبل الأمم المتحدة والمجتمع الدولي كحكومة شرعية لليمن.",
        category: "governance",
        relatedTerms: JSON.stringify(["DFA", "Dual Authority"]),
      },
      {
        termEn: "DFA (De Facto Authority)",
        termAr: "السلطة الفعلية",
        definitionEn: "The Ansar Allah (Houthi) administration controlling northern Yemen including Sana'a, operating as a parallel government.",
        definitionAr: "إدارة أنصار الله (الحوثيين) التي تسيطر على شمال اليمن بما في ذلك صنعاء، وتعمل كحكومة موازية.",
        category: "governance",
        relatedTerms: JSON.stringify(["IRG", "Dual Authority"]),
      },
      {
        termEn: "IPC (Integrated Food Security Phase Classification)",
        termAr: "التصنيف المرحلي المتكامل للأمن الغذائي",
        definitionEn: "A standardized scale for classifying food insecurity severity, from Phase 1 (Minimal) to Phase 5 (Famine).",
        definitionAr: "مقياس موحد لتصنيف شدة انعدام الأمن الغذائي، من المرحلة 1 (الحد الأدنى) إلى المرحلة 5 (المجاعة).",
        category: "food_security",
        relatedTerms: JSON.stringify(["Food Security", "Humanitarian Crisis"]),
      },
      {
        termEn: "Minimum Food Basket",
        termAr: "الحد الأدنى لسلة الغذاء",
        definitionEn: "A standardized basket of essential food items sufficient to meet the basic nutritional needs of a family, used to track food affordability.",
        definitionAr: "سلة موحدة من المواد الغذائية الأساسية الكافية لتلبية الاحتياجات الغذائية الأساسية للأسرة، تُستخدم لتتبع القدرة على تحمل تكاليف الغذاء.",
        category: "food_security",
        relatedTerms: JSON.stringify(["Food Prices", "Food Security"]),
      },
      {
        termEn: "Correspondent Banking",
        termAr: "المراسلة المصرفية",
        definitionEn: "Relationships between banks that allow them to conduct transactions internationally. Yemen has lost most correspondent banking relationships due to de-risking.",
        definitionAr: "العلاقات بين البنوك التي تسمح لها بإجراء المعاملات دولياً. فقد اليمن معظم علاقات المراسلة المصرفية بسبب تقليل المخاطر.",
        category: "banking",
        relatedTerms: JSON.stringify(["Banking Sector", "Remittances"]),
      },
      {
        termEn: "Remittances",
        termAr: "التحويلات المالية",
        definitionEn: "Money sent by Yemenis working abroad to their families in Yemen. A critical source of foreign exchange and household income.",
        definitionAr: "الأموال التي يرسلها اليمنيون العاملون في الخارج إلى عائلاتهم في اليمن. مصدر حيوي للعملات الأجنبية ودخل الأسر.",
        category: "banking",
        relatedTerms: JSON.stringify(["Foreign Exchange", "Correspondent Banking"]),
      },
    ];

    for (const term of glossaryData) {
      await db.insert(schema.glossaryTerms).values(term).onDuplicateKeyUpdate({
        set: { termEn: term.termEn },
      });
    }
    console.log(`  ✓ Seeded ${glossaryData.length} glossary terms`);

    // ============================================================================
    // SEED STAKEHOLDERS
    // ============================================================================
    console.log("🏛️ Seeding stakeholders...");

    const stakeholdersData = [
      {
        nameEn: "Central Bank of Yemen - Aden",
        nameAr: "البنك المركزي اليمني - عدن",
        type: "government",
        descriptionEn: "The internationally recognized central bank, responsible for monetary policy in IRG-controlled areas.",
        descriptionAr: "البنك المركزي المعترف به دولياً، المسؤول عن السياسة النقدية في المناطق الخاضعة لسيطرة الحكومة.",
        website: "https://cby-ye.com",
        regimeAffiliation: "aden_irg",
      },
      {
        nameEn: "World Bank Yemen",
        nameAr: "البنك الدولي - اليمن",
        type: "international_org",
        descriptionEn: "Provides economic analysis, technical assistance, and project financing for Yemen.",
        descriptionAr: "يقدم التحليل الاقتصادي والمساعدة الفنية وتمويل المشاريع لليمن.",
        website: "https://www.worldbank.org/en/country/yemen",
        regimeAffiliation: null,
      },
      {
        nameEn: "World Food Programme Yemen",
        nameAr: "برنامج الغذاء العالمي - اليمن",
        type: "international_org",
        descriptionEn: "Leads food assistance operations and market monitoring in Yemen.",
        descriptionAr: "يقود عمليات المساعدات الغذائية ومراقبة السوق في اليمن.",
        website: "https://www.wfp.org/countries/yemen",
        regimeAffiliation: null,
      },
      {
        nameEn: "Sana'a Center for Strategic Studies",
        nameAr: "مركز صنعاء للدراسات الاستراتيجية",
        type: "research_institution",
        descriptionEn: "Independent think tank providing research and analysis on Yemen.",
        descriptionAr: "مركز أبحاث مستقل يقدم البحوث والتحليلات حول اليمن.",
        website: "https://sanaacenter.org",
        regimeAffiliation: null,
      },
      {
        nameEn: "UNDP Yemen",
        nameAr: "برنامج الأمم المتحدة الإنمائي - اليمن",
        type: "international_org",
        descriptionEn: "Supports development initiatives and economic recovery programs in Yemen.",
        descriptionAr: "يدعم مبادرات التنمية وبرامج التعافي الاقتصادي في اليمن.",
        website: "https://www.undp.org/yemen",
        regimeAffiliation: null,
      },
    ];

    for (const stakeholder of stakeholdersData) {
      await db.insert(schema.stakeholders).values(stakeholder).onDuplicateKeyUpdate({
        set: { nameEn: stakeholder.nameEn },
      });
    }
    console.log(`  ✓ Seeded ${stakeholdersData.length} stakeholders`);

    console.log("\n✅ Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch(console.error);
