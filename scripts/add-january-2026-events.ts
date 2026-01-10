/**
 * Add January 2026 Economic Events to Database
 * Critical updates for STC dissolution, CBY decisions, and political changes
 */

import { getDb } from "../server/db";
import { economicEvents } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Map regime values to schema enum
function mapRegime(regime: string): "aden_irg" | "sanaa_defacto" | "mixed" | "unknown" {
  if (regime === "aden") return "aden_irg";
  if (regime === "sanaa") return "sanaa_defacto";
  if (regime === "both") return "mixed";
  return "unknown";
}

const JANUARY_2026_EVENTS = [
  // December 2025 events leading up to January 2026
  {
    title: "STC Expands Control Over Non-Houthi Areas",
    titleAr: "المجلس الانتقالي يوسع سيطرته على المناطق غير الخاضعة للحوثيين",
    description: "The Southern Transitional Council (STC) expanded its control over non-Houthi controlled areas in Yemen, leading to increased tensions with the internationally recognized government and Saudi-led coalition.",
    descriptionAr: "وسّع المجلس الانتقالي الجنوبي سيطرته على المناطق غير الخاضعة لسيطرة الحوثيين في اليمن، مما أدى إلى تصاعد التوترات مع الحكومة المعترف بها دولياً والتحالف بقيادة السعودية.",
    eventDate: new Date("2025-12-15"),
    category: "political",
    impactLevel: "high" as const,
    regimeTag: "mixed" as const,
  },
  {
    title: "CBY Aden Reaches 79 Exchange License Suspensions",
    titleAr: "البنك المركزي عدن يصل إلى 79 تعليق ترخيص صرافة",
    description: "The Central Bank of Yemen in Aden completed its exchange market regulation campaign with 79 exchange companies and institutions having their licenses suspended or revoked by the end of December 2025.",
    descriptionAr: "أكمل البنك المركزي اليمني في عدن حملته لتنظيم سوق الصرافة مع تعليق أو إلغاء تراخيص 79 شركة ومؤسسة صرافة بنهاية ديسمبر 2025.",
    eventDate: new Date("2025-12-31"),
    category: "monetary",
    impactLevel: "high" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "CBY Aden Suspends Al-Balasi, Al-Khader, Suhail Exchange Licenses",
    titleAr: "البنك المركزي عدن يعلق تراخيص شركات البلعسي والخضر وسهيل للصرافة",
    description: "Governor Ahmed Ghaleb issued decisions to suspend licenses for Al-Balasi Exchange Company, Al-Khader Exchange Company, and Suhail Exchange Establishment, and revoke the license for Al-Shamil Exchange Company Mansoura branch.",
    descriptionAr: "أصدر المحافظ أحمد غالب قرارات بتعليق تراخيص شركة البلعسي للصرافة وشركة الخضر للصرافة ومؤسسة سهيل للصرافة، وإلغاء ترخيص فرع شركة الشامل للصرافة في المنصورة.",
    eventDate: new Date("2026-01-02"),
    category: "monetary",
    impactLevel: "medium" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "UN Reports Yemen Aid Response Buckling Under Funding Cuts",
    titleAr: "الأمم المتحدة تفيد بأن الاستجابة الإنسانية في اليمن تنهار تحت وطأة خفض التمويل",
    description: "UN OCHA reported that Yemen already fragile humanitarian response is buckling under funding cuts as needs continue to rise, with a 71% funding gap in 2024.",
    descriptionAr: "أفاد مكتب تنسيق الشؤون الإنسانية التابع للأمم المتحدة بأن الاستجابة الإنسانية الهشة أصلاً في اليمن تنهار تحت وطأة خفض التمويل مع استمرار ارتفاع الاحتياجات، مع فجوة تمويل بنسبة 71% في 2024.",
    eventDate: new Date("2026-01-04"),
    category: "humanitarian",
    impactLevel: "high" as const,
    regimeTag: "mixed" as const,
  },
  {
    title: "Al Jazeera Analysis: Yemen Crisis Growing More Complex",
    titleAr: "تحليل الجزيرة: الأزمة اليمنية تزداد تعقيداً",
    description: "Al Jazeera published analysis noting events in Yemen are escalating quickly and dramatically, with armed clashes erupting between Arab coalition forces.",
    descriptionAr: "نشرت الجزيرة تحليلاً يشير إلى أن الأحداث في اليمن تتصاعد بسرعة وبشكل دراماتيكي، مع اندلاع اشتباكات مسلحة بين قوات التحالف العربي.",
    eventDate: new Date("2026-01-05"),
    category: "political",
    impactLevel: "high" as const,
    regimeTag: "mixed" as const,
  },
  {
    title: "IMF Publishes Yemen Customs Reform Report",
    titleAr: "صندوق النقد الدولي ينشر تقرير إصلاح الجمارك اليمنية",
    description: "The IMF published a technical assistance report on Customs Reform and Emergency Revenue Mobilization for Yemen, outlining steps to improve operational efficiency, transparency, and fiscal stability.",
    descriptionAr: "نشر صندوق النقد الدولي تقرير مساعدة فنية حول إصلاح الجمارك وتعبئة الإيرادات الطارئة لليمن، يحدد خطوات لتحسين الكفاءة التشغيلية والشفافية والاستقرار المالي.",
    eventDate: new Date("2026-01-06"),
    category: "fiscal",
    impactLevel: "medium" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "Saudi Coalition Bombs Shabwa After Al-Zubaidi Skips Talks",
    titleAr: "التحالف السعودي يقصف شبوة بعد تغيب الزبيدي عن المحادثات",
    description: "The Saudi-led coalition bombed Shabwa, the home province of STC leader Aidarus al-Zubaidi, after he failed to attend scheduled talks in Riyadh.",
    descriptionAr: "قصف التحالف بقيادة السعودية محافظة شبوة، موطن زعيم المجلس الانتقالي عيدروس الزبيدي، بعد تغيبه عن المحادثات المقررة في الرياض.",
    eventDate: new Date("2026-01-07"),
    category: "political",
    impactLevel: "critical" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "STC Leader Aidarus Al-Zubaidi Flees to UAE",
    titleAr: "زعيم المجلس الانتقالي عيدروس الزبيدي يفر إلى الإمارات",
    description: "Following coalition airstrikes and escalating pressure, STC leader Aidarus al-Zubaidi fled Yemen to the United Arab Emirates, marking a dramatic turn in southern Yemen politics.",
    descriptionAr: "في أعقاب الغارات الجوية للتحالف والضغوط المتصاعدة، فرّ زعيم المجلس الانتقالي عيدروس الزبيدي من اليمن إلى الإمارات العربية المتحدة، مما يمثل تحولاً دراماتيكياً في سياسة جنوب اليمن.",
    eventDate: new Date("2026-01-08"),
    category: "political",
    impactLevel: "critical" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "Southern Transitional Council Announces Dissolution",
    titleAr: "المجلس الانتقالي الجنوبي يعلن حله",
    description: "The STC Secretary-General announced the dissolution of all political, executive and organizational bodies of the Southern Transitional Council, following talks in Saudi Arabia and a day after its leader fled to the UAE.",
    descriptionAr: "أعلن الأمين العام للمجلس الانتقالي الجنوبي حل جميع الهيئات السياسية والتنفيذية والتنظيمية للمجلس، في أعقاب محادثات في السعودية وبعد يوم من فرار زعيمه إلى الإمارات.",
    eventDate: new Date("2026-01-09"),
    category: "political",
    impactLevel: "critical" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "CBY Aden Holds First 2026 Board Meeting",
    titleAr: "البنك المركزي عدن يعقد أول اجتماع لمجلس إدارته في 2026",
    description: "The Central Bank of Yemen Board of Directors held its first session for 2026 in Aden, chaired by Governor Ahmed Ghaleb. The Board approved the 2025 audit contract and reviewed precautionary measures taken during recent security developments.",
    descriptionAr: "عقد مجلس إدارة البنك المركزي اليمني أول جلسة له لعام 2026 في عدن برئاسة المحافظ أحمد غالب. وافق المجلس على عقد تدقيق 2025 واستعرض الإجراءات الاحترازية المتخذة خلال التطورات الأمنية الأخيرة.",
    eventDate: new Date("2026-01-09"),
    category: "monetary",
    impactLevel: "high" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "Nations Shield Forces Take Control of Aden Facilities",
    titleAr: "قوات درع الوطن تسيطر على منشآت عدن",
    description: "Government-aligned Nations Shield forces took control of vital facilities in Aden following the STC dissolution, as part of efforts to consolidate government authority in the south.",
    descriptionAr: "سيطرت قوات درع الوطن الموالية للحكومة على منشآت حيوية في عدن بعد حل المجلس الانتقالي، كجزء من جهود توطيد سلطة الحكومة في الجنوب.",
    eventDate: new Date("2026-01-10"),
    category: "political",
    impactLevel: "high" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "CBY Aden Instructed to Freeze Al-Zubaidi Bank Accounts",
    titleAr: "توجيه البنك المركزي عدن بتجميد حسابات الزبيدي المصرفية",
    description: "The Central Bank of Yemen in Aden was instructed to freeze all bank accounts linked to Aidarus al-Zubaidi and senior STC figures who left the country.",
    descriptionAr: "تم توجيه البنك المركزي اليمني في عدن بتجميد جميع الحسابات المصرفية المرتبطة بعيدروس الزبيدي وكبار قيادات المجلس الانتقالي الذين غادروا البلاد.",
    eventDate: new Date("2026-01-10"),
    category: "monetary",
    impactLevel: "high" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "Thousands Rally in Aden in Support of STC",
    titleAr: "الآلاف يتظاهرون في عدن دعماً للمجلس الانتقالي",
    description: "Thousands of Yemenis gathered in Aden in a show of support for the STC, with some factions disputing the dissolution announcement. The situation remains fluid with competing claims about the STC status.",
    descriptionAr: "تجمع الآلاف من اليمنيين في عدن في مظاهرة دعم للمجلس الانتقالي، حيث تعترض بعض الفصائل على إعلان الحل. يبقى الوضع متقلباً مع ادعاءات متنافسة حول وضع المجلس.",
    eventDate: new Date("2026-01-10"),
    category: "political",
    impactLevel: "high" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "Minister of Defense Dismissed Following Security Events",
    titleAr: "إقالة وزير الدفاع بعد الأحداث الأمنية",
    description: "Yemen Minister of Defense was dismissed following security events in Hadramawt and Al-Mahra governorates, as part of government restructuring amid the political transition.",
    descriptionAr: "تم إقالة وزير الدفاع اليمني بعد الأحداث الأمنية في محافظتي حضرموت والمهرة، كجزء من إعادة هيكلة الحكومة في ظل التحول السياسي.",
    eventDate: new Date("2026-01-10"),
    category: "political",
    impactLevel: "medium" as const,
    regimeTag: "aden_irg" as const,
  },
  {
    title: "Arrangements to Hand Over Al-Mahra Ports to Nations Shield",
    titleAr: "ترتيبات لتسليم موانئ المهرة لقوات درع الوطن",
    description: "Arrangements were made to hand over security tasks of Al-Mahra ports and government facilities to Nations Shield forces as part of the government consolidation effort.",
    descriptionAr: "تم إجراء ترتيبات لتسليم المهام الأمنية لموانئ المهرة والمنشآت الحكومية لقوات درع الوطن كجزء من جهود توطيد الحكومة.",
    eventDate: new Date("2026-01-10"),
    category: "political",
    impactLevel: "medium" as const,
    regimeTag: "aden_irg" as const,
  }
];

async function addJanuary2026Events() {
  console.log("Adding January 2026 economic events to database...\n");
  
  const db = await getDb();
  
  let added = 0;
  let skipped = 0;
  
  for (const event of JANUARY_2026_EVENTS) {
    try {
      // Check if event already exists (by title)
      const [existing] = await db.select().from(economicEvents)
        .where(eq(economicEvents.title, event.title))
        .limit(1);
      
      if (existing) {
        console.log(`⏭️  Skipped (exists): ${event.title}`);
        skipped++;
        continue;
      }
      
      await db.insert(economicEvents).values(event);
      console.log(`✅ Added: ${event.title}`);
      added++;
    } catch (error) {
      console.error(`❌ Error adding event: ${event.title}`, error);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Total events processed: ${JANUARY_2026_EVENTS.length}`);
  console.log(`Added: ${added}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`========================================\n`);
}

addJanuary2026Events()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
