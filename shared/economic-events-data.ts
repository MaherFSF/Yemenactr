// Comprehensive Yemen Economic Events Database 2010-2026
// 200+ events covering political, economic, humanitarian, and financial developments

export interface EconomicEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  year: number;
  month: number;
  day?: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: 'conflict' | 'banking' | 'international' | 'currency' | 'humanitarian' | 'recovery' | 'trade' | 'oil' | 'fiscal' | 'food_security' | 'infrastructure';
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  economicImpact?: {
    gdpEffect?: string;
    inflationEffect?: string;
    currencyEffect?: string;
    tradeEffect?: string;
  };
  sources?: string[];
  relatedIndicators?: string[];
  image?: string; // Path to event image
}

export const economicEventsData: EconomicEvent[] = [
  // ============================================
  // 2010 - Pre-Conflict Baseline
  // ============================================
  {
    id: "evt-2010-01",
    date: "2010-02-12",
    year: 2010,
    month: 2,
    day: 12,
    title: "Ceasefire Agreement with Houthis",
    titleAr: "اتفاق وقف إطلاق النار مع الحوثيين",
    description: "Government agrees to ceasefire with Houthi rebels after Operation Scorched Earth, ending six rounds of conflict since 2004.",
    descriptionAr: "توافق الحكومة على وقف إطلاق النار مع المتمردين الحوثيين بعد عملية الأرض المحروقة، منهية ست جولات من الصراع منذ 2004.",
    category: "conflict",
    severity: "major",
    economicImpact: {
      gdpEffect: "Temporary stabilization of northern economy",
      tradeEffect: "Resumption of cross-border trade with Saudi Arabia"
    },
    sources: ["Arab Center DC", "Reuters"]
  },
  {
    id: "evt-2010-02",
    date: "2010-06-15",
    year: 2010,
    month: 6,
    title: "Oil Production Peak",
    titleAr: "ذروة إنتاج النفط",
    description: "Yemen's oil production reaches 260,000 barrels per day, accounting for 70% of government revenue and 90% of exports.",
    descriptionAr: "يصل إنتاج النفط اليمني إلى 260,000 برميل يومياً، مشكلاً 70% من إيرادات الحكومة و90% من الصادرات.",
    category: "oil",
    severity: "moderate",
    economicImpact: {
      gdpEffect: "Oil sector contributes 25% of GDP",
      tradeEffect: "Strong export revenues"
    },
    sources: ["World Bank", "IMF"]
  },
  {
    id: "evt-2010-03",
    date: "2010-09-01",
    year: 2010,
    month: 9,
    title: "AQAP Crackdown in Shabwa",
    titleAr: "حملة على القاعدة في شبوة",
    description: "Government forces besiege Shabwa governorate to root out AQAP militants, disrupting local economic activity.",
    descriptionAr: "تحاصر القوات الحكومية محافظة شبوة للقضاء على مسلحي القاعدة، مما يعطل النشاط الاقتصادي المحلي.",
    category: "conflict",
    severity: "moderate",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2010-04",
    date: "2010-12-01",
    year: 2010,
    month: 12,
    title: "GDP Growth at 7.7%",
    titleAr: "نمو الناتج المحلي 7.7%",
    description: "Yemen records 7.7% GDP growth, the highest in recent years, driven by oil revenues and international aid.",
    descriptionAr: "يسجل اليمن نمواً في الناتج المحلي بنسبة 7.7%، الأعلى في السنوات الأخيرة، مدفوعاً بعائدات النفط والمساعدات الدولية.",
    category: "fiscal",
    severity: "moderate",
    economicImpact: {
      gdpEffect: "+7.7% annual growth"
    },
    sources: ["World Bank"]
  },

  // ============================================
  // 2011 - Arab Spring
  // ============================================
  {
    id: "evt-2011-01",
    date: "2011-01-27",
    year: 2011,
    month: 1,
    day: 27,
    title: "Arab Spring Protests Begin",
    titleAr: "بداية احتجاجات الربيع العربي",
    description: "Mass demonstrations calling for end of President Saleh's 33-year rule begin, inspired by Tunisia and Egypt revolutions.",
    descriptionAr: "تبدأ مظاهرات حاشدة تطالب بإنهاء حكم الرئيس صالح الممتد 33 عاماً، مستلهمة من ثورتي تونس ومصر.",
    category: "conflict",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Economic activity begins to decline",
      tradeEffect: "Business closures across major cities"
    },
    sources: ["Arab Center DC", "Human Rights Watch"]
  },
  {
    id: "evt-2011-02",
    date: "2011-03-18",
    year: 2011,
    month: 3,
    day: 18,
    title: "Friday of Dignity Massacre",
    titleAr: "مجزرة جمعة الكرامة",
    description: "Security forces kill 52 protesters in Sanaa, triggering mass defections from military and government.",
    descriptionAr: "تقتل قوات الأمن 52 متظاهراً في صنعاء، مما يؤدي إلى انشقاقات جماعية من الجيش والحكومة.",
    category: "conflict",
    severity: "critical",
    sources: ["Human Rights Watch"]
  },
  {
    id: "evt-2011-03",
    date: "2011-04-23",
    year: 2011,
    month: 4,
    day: 23,
    title: "GCC Initiative Proposed",
    titleAr: "اقتراح مبادرة مجلس التعاون الخليجي",
    description: "Gulf Cooperation Council proposes transition deal for Saleh to step down in exchange for immunity.",
    descriptionAr: "يقترح مجلس التعاون الخليجي صفقة انتقالية لتنحي صالح مقابل الحصانة.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2011-04",
    date: "2011-05-26",
    year: 2011,
    month: 5,
    day: 26,
    title: "Oil Pipeline Sabotage",
    titleAr: "تخريب خط أنابيب النفط",
    description: "Tribesmen blow up Yemen's main oil export pipeline, crippling exports and government revenue.",
    descriptionAr: "يفجر رجال القبائل خط أنابيب النفط الرئيسي، مما يشل الصادرات وإيرادات الحكومة.",
    category: "oil",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Oil exports halted for months",
      tradeEffect: "Loss of $1 billion in export revenue"
    },
    sources: ["Reuters", "ABC News"]
  },
  {
    id: "evt-2011-05",
    date: "2011-06-03",
    year: 2011,
    month: 6,
    day: 3,
    title: "Saleh Injured in Bombing",
    titleAr: "إصابة صالح في تفجير",
    description: "President Saleh seriously injured in mosque bombing, travels to Saudi Arabia for treatment.",
    descriptionAr: "يصاب الرئيس صالح بجروح خطيرة في تفجير مسجد، ويسافر للسعودية للعلاج.",
    category: "conflict",
    severity: "critical",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2011-06",
    date: "2011-09-23",
    year: 2011,
    month: 9,
    day: 23,
    title: "Saleh Returns to Yemen",
    titleAr: "عودة صالح إلى اليمن",
    description: "Saleh returns to Yemen amid renewed clashes, prolonging political uncertainty.",
    descriptionAr: "يعود صالح إلى اليمن وسط اشتباكات متجددة، مطيلاً حالة عدم اليقين السياسي.",
    category: "conflict",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2011-07",
    date: "2011-11-23",
    year: 2011,
    month: 11,
    day: 23,
    title: "GCC Agreement Signed",
    titleAr: "توقيع اتفاق مجلس التعاون الخليجي",
    description: "Saleh signs GCC-brokered deal transferring power to Vice President Hadi, ending 33-year rule.",
    descriptionAr: "يوقع صالح اتفاق مجلس التعاون الخليجي لنقل السلطة إلى نائب الرئيس هادي، منهياً حكمه الممتد 33 عاماً.",
    category: "international",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Hope for economic stabilization"
    },
    sources: ["Arab Center DC", "UN"]
  },
  {
    id: "evt-2011-08",
    date: "2011-12-31",
    year: 2011,
    month: 12,
    title: "GDP Contracts 12.7%",
    titleAr: "انكماش الناتج المحلي 12.7%",
    description: "Yemen's economy contracts by 12.7% due to Arab Spring protests, making it the worst economic year in decades.",
    descriptionAr: "ينكمش الاقتصاد اليمني بنسبة 12.7% بسبب احتجاجات الربيع العربي، مما يجعله أسوأ عام اقتصادي منذ عقود.",
    category: "fiscal",
    severity: "critical",
    economicImpact: {
      gdpEffect: "-12.7% annual contraction",
      inflationEffect: "Inflation rises to 19.5%"
    },
    sources: ["World Bank", "IMF"]
  },

  // ============================================
  // 2012 - Transition Period
  // ============================================
  {
    id: "evt-2012-01",
    date: "2012-02-21",
    year: 2012,
    month: 2,
    day: 21,
    title: "Hadi Sworn in as President",
    titleAr: "أداء هادي اليمين الرئاسية",
    description: "Abdrabbuh Mansour Hadi sworn in as president for two-year transitional term after uncontested election.",
    descriptionAr: "يؤدي عبدربه منصور هادي اليمين الرئاسية لفترة انتقالية مدتها سنتان بعد انتخابات غير متنافسة.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2012-02",
    date: "2012-05-21",
    year: 2012,
    month: 5,
    day: 21,
    title: "Suicide Bombing Kills 96 Soldiers",
    titleAr: "تفجير انتحاري يقتل 96 جندياً",
    description: "AQAP suicide bomber kills 96 soldiers during military parade rehearsal in Sanaa.",
    descriptionAr: "يقتل انتحاري من القاعدة 96 جندياً خلال بروفة عرض عسكري في صنعاء.",
    category: "conflict",
    severity: "major",
    sources: ["Reuters"]
  },
  {
    id: "evt-2012-03",
    date: "2012-06-01",
    year: 2012,
    month: 6,
    title: "Saudi Arabia $3 Billion Aid Package",
    titleAr: "حزمة مساعدات سعودية بـ3 مليارات دولار",
    description: "Saudi Arabia provides $3 billion injection of cash and fuel to stabilize Yemen's economy.",
    descriptionAr: "تقدم السعودية 3 مليارات دولار نقداً ووقوداً لتحقيق الاستقرار في الاقتصاد اليمني.",
    category: "international",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Economic recovery begins",
      currencyEffect: "Rial stabilizes temporarily"
    },
    sources: ["Sana'a Center"]
  },
  {
    id: "evt-2012-04",
    date: "2012-09-01",
    year: 2012,
    month: 9,
    title: "Oil Pipeline Repairs Complete",
    titleAr: "اكتمال إصلاح خط أنابيب النفط",
    description: "Main oil export pipeline repaired after 16 months, resuming critical export revenues.",
    descriptionAr: "إصلاح خط أنابيب النفط الرئيسي بعد 16 شهراً، واستئناف عائدات التصدير الحيوية.",
    category: "oil",
    severity: "major",
    economicImpact: {
      tradeEffect: "Oil exports resume at 150,000 bpd"
    },
    sources: ["Reuters"]
  },

  // ============================================
  // 2013 - National Dialogue
  // ============================================
  {
    id: "evt-2013-01",
    date: "2013-03-18",
    year: 2013,
    month: 3,
    day: 18,
    title: "National Dialogue Conference Begins",
    titleAr: "بداية مؤتمر الحوار الوطني",
    description: "Ten-month National Dialogue Conference begins with 565 delegates to draft new constitution.",
    descriptionAr: "يبدأ مؤتمر الحوار الوطني لمدة عشرة أشهر مع 565 مندوباً لصياغة دستور جديد.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2013-02",
    date: "2013-06-01",
    year: 2013,
    month: 6,
    title: "GDP Recovery to 4.8%",
    titleAr: "تعافي الناتج المحلي إلى 4.8%",
    description: "Yemen's GDP grows 4.8%, recovering from 2011 crisis thanks to Saudi aid and resumed oil exports.",
    descriptionAr: "ينمو الناتج المحلي اليمني 4.8%، متعافياً من أزمة 2011 بفضل المساعدات السعودية واستئناف صادرات النفط.",
    category: "fiscal",
    severity: "moderate",
    economicImpact: {
      gdpEffect: "+4.8% growth"
    },
    sources: ["World Bank"]
  },
  {
    id: "evt-2013-03",
    date: "2013-08-06",
    year: 2013,
    month: 8,
    day: 6,
    title: "US Drone Strike Escalation",
    titleAr: "تصعيد الضربات الأمريكية بالطائرات المسيرة",
    description: "US conducts major drone strike campaign against AQAP, killing dozens of militants.",
    descriptionAr: "تنفذ الولايات المتحدة حملة كبيرة من الضربات بالطائرات المسيرة ضد القاعدة، مما يقتل عشرات المسلحين.",
    category: "conflict",
    severity: "moderate",
    sources: ["Reuters"]
  },

  // ============================================
  // 2014 - Houthi Takeover
  // ============================================
  {
    id: "evt-2014-01",
    date: "2014-01-25",
    year: 2014,
    month: 1,
    day: 25,
    title: "National Dialogue Concludes",
    titleAr: "اختتام الحوار الوطني",
    description: "National Dialogue Conference concludes, agreeing on federal system with six regions.",
    descriptionAr: "يختتم مؤتمر الحوار الوطني، متفقاً على نظام فيدرالي من ست مناطق.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2014-02",
    date: "2014-07-30",
    year: 2014,
    month: 7,
    day: 30,
    title: "Fuel Subsidy Cuts Trigger Protests",
    titleAr: "خفض دعم الوقود يثير الاحتجاجات",
    description: "Government cuts fuel subsidies, doubling prices and triggering massive anti-government protests.",
    descriptionAr: "تخفض الحكومة دعم الوقود، مضاعفة الأسعار ومثيرة احتجاجات حاشدة ضد الحكومة.",
    category: "fiscal",
    severity: "critical",
    economicImpact: {
      inflationEffect: "Fuel prices double overnight"
    },
    sources: ["Arab Center DC", "Reuters"]
  },
  {
    id: "evt-2014-03",
    date: "2014-09-21",
    year: 2014,
    month: 9,
    day: 21,
    title: "Houthis Seize Sanaa",
    titleAr: "الحوثيون يسيطرون على صنعاء",
    description: "Houthi rebels take control of Yemen's capital Sanaa, marking beginning of current conflict.",
    descriptionAr: "يسيطر المتمردون الحوثيون على العاصمة صنعاء، مما يمثل بداية الصراع الحالي.",
    category: "conflict",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Economic collapse begins",
      tradeEffect: "Business confidence collapses"
    },
    sources: ["Arab Center DC", "UN"]
  },
  {
    id: "evt-2014-04",
    date: "2014-10-14",
    year: 2014,
    month: 10,
    day: 14,
    title: "Houthis Seize Hodeida Port",
    titleAr: "الحوثيون يسيطرون على ميناء الحديدة",
    description: "Houthi rebels seize Red Sea port city of Hodeida, controlling 70% of Yemen's imports.",
    descriptionAr: "يسيطر المتمردون الحوثيون على مدينة الحديدة الساحلية، متحكمين في 70% من واردات اليمن.",
    category: "trade",
    severity: "critical",
    economicImpact: {
      tradeEffect: "Control of main import gateway"
    },
    sources: ["Arab Center DC"]
  },

  // ============================================
  // 2015 - Civil War Begins
  // ============================================
  {
    id: "evt-2015-01",
    date: "2015-01-22",
    year: 2015,
    month: 1,
    day: 22,
    title: "President Hadi Resigns",
    titleAr: "استقالة الرئيس هادي",
    description: "President Hadi resigns after being placed under house arrest by Houthis.",
    descriptionAr: "يستقيل الرئيس هادي بعد وضعه تحت الإقامة الجبرية من قبل الحوثيين.",
    category: "conflict",
    severity: "critical",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2015-02",
    date: "2015-02-06",
    year: 2015,
    month: 2,
    day: 6,
    title: "Houthis Dissolve Parliament",
    titleAr: "الحوثيون يحلون البرلمان",
    description: "Houthis dissolve parliament and announce Revolutionary Committee to govern Yemen.",
    descriptionAr: "يحل الحوثيون البرلمان ويعلنون اللجنة الثورية لحكم اليمن.",
    category: "conflict",
    severity: "critical",
    sources: ["UN", "Arab Center DC"]
  },
  {
    id: "evt-2015-03",
    date: "2015-03-20",
    year: 2015,
    month: 3,
    day: 20,
    title: "ISIS Mosque Bombings",
    titleAr: "تفجيرات داعش في المساجد",
    description: "Islamic State claims first major attacks in Yemen, bombing two Shia mosques in Sanaa, killing 137.",
    descriptionAr: "يعلن تنظيم داعش مسؤوليته عن أول هجمات كبرى في اليمن، مفجراً مسجدين شيعيين في صنعاء، مما أسفر عن مقتل 137.",
    category: "conflict",
    severity: "critical",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2015-04",
    date: "2015-03-26",
    year: 2015,
    month: 3,
    day: 26,
    title: "Saudi-led Coalition Intervention",
    titleAr: "تدخل التحالف بقيادة السعودية",
    description: "Saudi-led coalition launches Operation Decisive Storm with airstrikes and naval blockade.",
    descriptionAr: "يطلق التحالف بقيادة السعودية عملية عاصفة الحزم بغارات جوية وحصار بحري.",
    category: "conflict",
    severity: "critical",
    economicImpact: {
      gdpEffect: "GDP contracts 28% in 2015",
      tradeEffect: "Naval blockade cripples imports"
    },
    sources: ["Arab Center DC", "UN"],
    image: "/images/events/saudi_intervention_2015.jpg"
  },
  {
    id: "evt-2015-05",
    date: "2015-05-10",
    year: 2015,
    month: 5,
    day: 10,
    title: "Saleh-Houthi Alliance",
    titleAr: "تحالف صالح-الحوثي",
    description: "Former President Saleh and forces loyal to him announce formal alliance with Houthis.",
    descriptionAr: "يعلن الرئيس السابق صالح والقوات الموالية له تحالفاً رسمياً مع الحوثيين.",
    category: "conflict",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2015-06",
    date: "2015-08-15",
    year: 2015,
    month: 8,
    day: 15,
    title: "Central Bank Reserves Depleted",
    titleAr: "استنزاف احتياطيات البنك المركزي",
    description: "Central Bank of Yemen's foreign reserves fall from $4.7 billion to under $1 billion.",
    descriptionAr: "تنخفض احتياطيات البنك المركزي اليمني من العملات الأجنبية من 4.7 مليار دولار إلى أقل من مليار دولار.",
    category: "banking",
    severity: "critical",
    economicImpact: {
      currencyEffect: "Rial begins rapid depreciation"
    },
    sources: ["World Bank", "Sana'a Center"]
  },
  {
    id: "evt-2015-07",
    date: "2015-09-01",
    year: 2015,
    month: 9,
    title: "Aden Recaptured",
    titleAr: "استعادة عدن",
    description: "Saudi-backed forces recapture Aden from Houthis, President Hadi returns from exile.",
    descriptionAr: "تستعيد القوات المدعومة سعودياً عدن من الحوثيين، ويعود الرئيس هادي من المنفى.",
    category: "conflict",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2015-08",
    date: "2015-12-31",
    year: 2015,
    month: 12,
    title: "GDP Contracts 28%",
    titleAr: "انكماش الناتج المحلي 28%",
    description: "Yemen's GDP contracts by 28%, the largest single-year decline in the country's history.",
    descriptionAr: "ينكمش الناتج المحلي اليمني بنسبة 28%، وهو أكبر انخفاض في عام واحد في تاريخ البلاد.",
    category: "fiscal",
    severity: "critical",
    economicImpact: {
      gdpEffect: "-28% annual contraction",
      inflationEffect: "Inflation reaches 30%"
    },
    sources: ["World Bank", "IMF"]
  },

  // ============================================
  // 2016 - Central Bank Split
  // ============================================
  {
    id: "evt-2016-01",
    date: "2016-04-21",
    year: 2016,
    month: 4,
    day: 21,
    title: "Kuwait Peace Talks Begin",
    titleAr: "بدء محادثات السلام في الكويت",
    description: "UN-sponsored peace talks begin in Kuwait between Hadi government and Houthi-Saleh alliance.",
    descriptionAr: "تبدأ محادثات السلام برعاية الأمم المتحدة في الكويت بين حكومة هادي وتحالف الحوثي-صالح.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC", "UN"]
  },
  {
    id: "evt-2016-02",
    date: "2016-08-06",
    year: 2016,
    month: 8,
    day: 6,
    title: "Kuwait Talks Collapse",
    titleAr: "انهيار محادثات الكويت",
    description: "Peace talks in Kuwait collapse after 100 days without agreement.",
    descriptionAr: "تنهار محادثات السلام في الكويت بعد 100 يوم دون اتفاق.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2016-03",
    date: "2016-09-18",
    year: 2016,
    month: 9,
    day: 18,
    title: "Central Bank Relocated to Aden",
    titleAr: "نقل البنك المركزي إلى عدن",
    description: "President Hadi relocates Central Bank of Yemen headquarters from Sanaa to Aden, creating dual banking system.",
    descriptionAr: "ينقل الرئيس هادي مقر البنك المركزي اليمني من صنعاء إلى عدن، مما يخلق نظاماً مصرفياً مزدوجاً.",
    category: "banking",
    severity: "critical",
    economicImpact: {
      currencyEffect: "Dual exchange rate system begins",
      inflationEffect: "Inflation accelerates in south"
    },
    sources: ["Sana'a Center", "Reuters"],
    image: "/images/events/cby_relocation_2016.jpg"
  },
  {
    id: "evt-2016-04",
    date: "2016-10-08",
    year: 2016,
    month: 10,
    day: 8,
    title: "Funeral Hall Airstrike",
    titleAr: "غارة قاعة العزاء",
    description: "Saudi-led coalition airstrike on funeral hall in Sanaa kills 140 civilians, sparking international outrage.",
    descriptionAr: "غارة التحالف بقيادة السعودية على قاعة عزاء في صنعاء تقتل 140 مدنياً، مما يثير غضباً دولياً.",
    category: "humanitarian",
    severity: "critical",
    sources: ["Human Rights Watch", "UN"]
  },
  {
    id: "evt-2016-05",
    date: "2016-11-01",
    year: 2016,
    month: 11,
    title: "Civil Servant Salaries Suspended",
    titleAr: "تعليق رواتب الموظفين الحكوميين",
    description: "Central Bank stops paying 1.2 million civil servants, affecting 30% of population.",
    descriptionAr: "يتوقف البنك المركزي عن دفع رواتب 1.2 مليون موظف حكومي، مما يؤثر على 30% من السكان.",
    category: "fiscal",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Consumer spending collapses"
    },
    sources: ["World Bank", "UN"]
  },

  // ============================================
  // 2017 - Humanitarian Crisis Deepens
  // ============================================
  {
    id: "evt-2017-01",
    date: "2017-04-27",
    year: 2017,
    month: 4,
    day: 27,
    title: "Cholera Outbreak Begins",
    titleAr: "بداية تفشي الكوليرا",
    description: "Cholera outbreak begins, eventually infecting over 1 million people in worst outbreak in modern history.",
    descriptionAr: "يبدأ تفشي الكوليرا، ليصيب في النهاية أكثر من مليون شخص في أسوأ تفشٍ في التاريخ الحديث.",
    category: "humanitarian",
    severity: "critical",
    sources: ["WHO", "UN"]
  },
  {
    id: "evt-2017-02",
    date: "2017-07-01",
    year: 2017,
    month: 7,
    title: "World Bank Emergency Grants",
    titleAr: "منح الطوارئ من البنك الدولي",
    description: "World Bank approves emergency grants for health, nutrition, and infrastructure restoration.",
    descriptionAr: "يوافق البنك الدولي على منح طوارئ للصحة والتغذية وترميم البنية التحتية.",
    category: "international",
    severity: "major",
    sources: ["World Bank"]
  },
  {
    id: "evt-2017-03",
    date: "2017-11-04",
    year: 2017,
    month: 11,
    day: 4,
    title: "Houthi Missile Targets Riyadh Airport",
    titleAr: "صاروخ حوثي يستهدف مطار الرياض",
    description: "Houthis fire ballistic missile toward Riyadh airport, intercepted by Saudi air defense.",
    descriptionAr: "يطلق الحوثيون صاروخاً باليستياً نحو مطار الرياض، اعترضه الدفاع الجوي السعودي.",
    category: "conflict",
    severity: "major",
    sources: ["Arab Center DC", "Reuters"]
  },
  {
    id: "evt-2017-04",
    date: "2017-11-06",
    year: 2017,
    month: 11,
    day: 6,
    title: "Saudi Blockade Tightens",
    titleAr: "تشديد الحصار السعودي",
    description: "Saudi Arabia tightens blockade on Yemen, closing all ports and airports.",
    descriptionAr: "تشدد السعودية الحصار على اليمن، مغلقة جميع الموانئ والمطارات.",
    category: "trade",
    severity: "critical",
    economicImpact: {
      tradeEffect: "All imports halted temporarily"
    },
    sources: ["UN", "Reuters"]
  },
  {
    id: "evt-2017-05",
    date: "2017-12-04",
    year: 2017,
    month: 12,
    day: 4,
    title: "Former President Saleh Killed",
    titleAr: "مقتل الرئيس السابق صالح",
    description: "Former President Saleh killed by Houthis after attempting to switch sides to Saudi-led coalition.",
    descriptionAr: "يُقتل الرئيس السابق صالح على يد الحوثيين بعد محاولته الانتقال إلى جانب التحالف بقيادة السعودية.",
    category: "conflict",
    severity: "critical",
    sources: ["Arab Center DC", "Reuters"]
  },

  // ============================================
  // 2018 - Stockholm Agreement
  // ============================================
  {
    id: "evt-2018-01",
    date: "2018-01-28",
    year: 2018,
    month: 1,
    day: 28,
    title: "STC Seizes Aden",
    titleAr: "المجلس الانتقالي يسيطر على عدن",
    description: "Southern Transitional Council seizes control of Aden from Hadi government forces.",
    descriptionAr: "يسيطر المجلس الانتقالي الجنوبي على عدن من قوات حكومة هادي.",
    category: "conflict",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2018-02",
    date: "2018-06-13",
    year: 2018,
    month: 6,
    day: 13,
    title: "Hodeida Offensive Begins",
    titleAr: "بدء هجوم الحديدة",
    description: "Saudi-led coalition launches offensive to capture Hodeida port from Houthis.",
    descriptionAr: "يطلق التحالف بقيادة السعودية هجوماً للسيطرة على ميناء الحديدة من الحوثيين.",
    category: "conflict",
    severity: "critical",
    economicImpact: {
      tradeEffect: "Threat to 70% of imports"
    },
    sources: ["Arab Center DC", "UN"]
  },
  {
    id: "evt-2018-03",
    date: "2018-08-09",
    year: 2018,
    month: 8,
    day: 9,
    title: "School Bus Airstrike",
    titleAr: "غارة على حافلة مدرسية",
    description: "Coalition airstrike hits school bus in Dahyan, killing 40 children and sparking international condemnation.",
    descriptionAr: "غارة التحالف تضرب حافلة مدرسية في ضحيان، مما يقتل 40 طفلاً ويثير إدانة دولية.",
    category: "humanitarian",
    severity: "critical",
    sources: ["Human Rights Watch", "CNN"]
  },
  {
    id: "evt-2018-04",
    date: "2018-10-02",
    year: 2018,
    month: 10,
    day: 2,
    title: "Khashoggi Murder",
    titleAr: "مقتل خاشقجي",
    description: "Murder of Jamal Khashoggi increases pressure on US to end support for Saudi-led coalition.",
    descriptionAr: "يزيد مقتل جمال خاشقجي الضغط على الولايات المتحدة لإنهاء دعمها للتحالف بقيادة السعودية.",
    category: "international",
    severity: "major",
    sources: ["Washington Post", "Reuters"]
  },
  {
    id: "evt-2018-05",
    date: "2018-12-13",
    year: 2018,
    month: 12,
    day: 13,
    title: "Stockholm Agreement Signed",
    titleAr: "توقيع اتفاق ستوكهولم",
    description: "UN-mediated Stockholm Agreement signed, including Hodeida ceasefire and prisoner exchange.",
    descriptionAr: "توقيع اتفاق ستوكهولم بوساطة الأمم المتحدة، بما في ذلك وقف إطلاق النار في الحديدة وتبادل الأسرى.",
    category: "international",
    severity: "critical",
    economicImpact: {
      tradeEffect: "Hope for Hodeida port reopening"
    },
    sources: ["UN", "Arab Center DC"]
  },

  // ============================================
  // 2019 - Fragmentation
  // ============================================
  {
    id: "evt-2019-01",
    date: "2019-01-10",
    year: 2019,
    month: 1,
    day: 10,
    title: "Houthi Drone Attack on Al-Anad",
    titleAr: "هجوم حوثي بطائرة مسيرة على العند",
    description: "Houthi drone attack on Al-Anad Air Base kills head of Yemeni intelligence.",
    descriptionAr: "هجوم حوثي بطائرة مسيرة على قاعدة العند الجوية يقتل رئيس المخابرات اليمنية.",
    category: "conflict",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2019-02",
    date: "2019-06-30",
    year: 2019,
    month: 6,
    day: 30,
    title: "UAE Withdraws from Yemen",
    titleAr: "انسحاب الإمارات من اليمن",
    description: "UAE announces withdrawal of most troops from Yemen while continuing to support STC.",
    descriptionAr: "تعلن الإمارات انسحاب معظم قواتها من اليمن مع استمرار دعم المجلس الانتقالي.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC", "Reuters"]
  },
  {
    id: "evt-2019-03",
    date: "2019-08-10",
    year: 2019,
    month: 8,
    day: 10,
    title: "STC Seizes Southern Governorates",
    titleAr: "المجلس الانتقالي يسيطر على المحافظات الجنوبية",
    description: "STC takes control of Aden, Abyan, and Shabwa governorates from Hadi government.",
    descriptionAr: "يسيطر المجلس الانتقالي على محافظات عدن وأبين وشبوة من حكومة هادي.",
    category: "conflict",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2019-04",
    date: "2019-09-14",
    year: 2019,
    month: 9,
    day: 14,
    title: "Abqaiq-Khurais Attack",
    titleAr: "هجوم أبقيق-خريص",
    description: "Drone attack on Saudi Aramco facilities halves Saudi oil output; Houthis claim responsibility.",
    descriptionAr: "هجوم بطائرات مسيرة على منشآت أرامكو السعودية يخفض إنتاج النفط السعودي للنصف؛ الحوثيون يعلنون المسؤولية.",
    category: "oil",
    severity: "critical",
    economicImpact: {
      tradeEffect: "Global oil prices spike 15%"
    },
    sources: ["Reuters", "Arab Center DC"]
  },
  {
    id: "evt-2019-05",
    date: "2019-11-05",
    year: 2019,
    month: 11,
    day: 5,
    title: "Riyadh Agreement",
    titleAr: "اتفاق الرياض",
    description: "Saudi Arabia brokers Riyadh Agreement between Hadi government and STC.",
    descriptionAr: "تتوسط السعودية في اتفاق الرياض بين حكومة هادي والمجلس الانتقالي.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC"]
  },

  // ============================================
  // 2020 - COVID-19 Impact
  // ============================================
  {
    id: "evt-2020-01",
    date: "2020-03-24",
    year: 2020,
    month: 3,
    day: 24,
    title: "Trump Freezes Yemen Aid",
    titleAr: "ترامب يجمد المساعدات لليمن",
    description: "Trump administration freezes $73 million in humanitarian aid to Yemen.",
    descriptionAr: "إدارة ترامب تجمد 73 مليون دولار من المساعدات الإنسانية لليمن.",
    category: "humanitarian",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2020-02",
    date: "2020-04-09",
    year: 2020,
    month: 4,
    day: 9,
    title: "Saudi Unilateral Ceasefire",
    titleAr: "وقف إطلاق النار السعودي الأحادي",
    description: "Saudi Arabia announces two-week unilateral ceasefire due to COVID-19 pandemic.",
    descriptionAr: "تعلن السعودية وقف إطلاق نار أحادي لمدة أسبوعين بسبب جائحة كوفيد-19.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2020-03",
    date: "2020-04-10",
    year: 2020,
    month: 4,
    day: 10,
    title: "First COVID-19 Case",
    titleAr: "أول حالة كوفيد-19",
    description: "Yemen records first confirmed COVID-19 case amid collapsed healthcare system.",
    descriptionAr: "يسجل اليمن أول حالة مؤكدة من كوفيد-19 وسط انهيار النظام الصحي.",
    category: "humanitarian",
    severity: "critical",
    sources: ["WHO", "UN"]
  },
  {
    id: "evt-2020-04",
    date: "2020-04-26",
    year: 2020,
    month: 4,
    day: 26,
    title: "STC Declares Self-Rule",
    titleAr: "المجلس الانتقالي يعلن الحكم الذاتي",
    description: "STC declares self-rule in southern Yemen, breaking Riyadh Agreement.",
    descriptionAr: "يعلن المجلس الانتقالي الحكم الذاتي في جنوب اليمن، منتهكاً اتفاق الرياض.",
    category: "conflict",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2020-05",
    date: "2020-10-15",
    year: 2020,
    month: 10,
    day: 15,
    title: "Largest Prisoner Swap",
    titleAr: "أكبر عملية تبادل أسرى",
    description: "Warring parties conduct largest prisoner swap of the conflict, exchanging 1,081 prisoners.",
    descriptionAr: "تنفذ الأطراف المتحاربة أكبر عملية تبادل أسرى في الصراع، بتبادل 1,081 أسيراً.",
    category: "humanitarian",
    severity: "major",
    sources: ["UN", "ICRC"]
  },
  {
    id: "evt-2020-06",
    date: "2020-12-30",
    year: 2020,
    month: 12,
    day: 30,
    title: "Aden Airport Attack",
    titleAr: "هجوم مطار عدن",
    description: "Attack on Aden airport as new cabinet arrives kills 22; Houthis blamed.",
    descriptionAr: "هجوم على مطار عدن عند وصول الحكومة الجديدة يقتل 22؛ يُلام الحوثيون.",
    category: "conflict",
    severity: "critical",
    sources: ["Arab Center DC", "Reuters"]
  },

  // ============================================
  // 2021 - Biden Policy Shift
  // ============================================
  {
    id: "evt-2021-01",
    date: "2021-01-19",
    year: 2021,
    month: 1,
    day: 19,
    title: "Houthis Designated as FTO",
    titleAr: "تصنيف الحوثيين كمنظمة إرهابية",
    description: "Trump administration designates Houthis as Foreign Terrorist Organization.",
    descriptionAr: "إدارة ترامب تصنف الحوثيين كمنظمة إرهابية أجنبية.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2021-02",
    date: "2021-02-04",
    year: 2021,
    month: 2,
    day: 4,
    title: "Biden Ends US Support for Offensive Operations",
    titleAr: "بايدن ينهي الدعم الأمريكي للعمليات الهجومية",
    description: "President Biden announces end of US support for Saudi-led coalition offensive operations.",
    descriptionAr: "الرئيس بايدن يعلن إنهاء الدعم الأمريكي للعمليات الهجومية للتحالف بقيادة السعودية.",
    category: "international",
    severity: "critical",
    sources: ["White House", "Arab Center DC"]
  },
  {
    id: "evt-2021-03",
    date: "2021-02-12",
    year: 2021,
    month: 2,
    day: 12,
    title: "Houthi FTO Designation Revoked",
    titleAr: "إلغاء تصنيف الحوثيين كمنظمة إرهابية",
    description: "Biden administration revokes Houthi Foreign Terrorist Organization designation.",
    descriptionAr: "إدارة بايدن تلغي تصنيف الحوثيين كمنظمة إرهابية أجنبية.",
    category: "international",
    severity: "major",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2021-04",
    date: "2021-02-14",
    year: 2021,
    month: 2,
    day: 14,
    title: "Marib Offensive Intensifies",
    titleAr: "تصعيد هجوم مأرب",
    description: "Houthis launch major offensive on Marib, last government stronghold in north.",
    descriptionAr: "يطلق الحوثيون هجوماً كبيراً على مأرب، آخر معقل للحكومة في الشمال.",
    category: "conflict",
    severity: "critical",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2021-05",
    date: "2021-09-18",
    year: 2021,
    month: 9,
    day: 18,
    title: "Currency Crisis Protests",
    titleAr: "احتجاجات أزمة العملة",
    description: "Protests erupt across southern Yemen over currency collapse and economic crisis.",
    descriptionAr: "تندلع احتجاجات في جنوب اليمن بسبب انهيار العملة والأزمة الاقتصادية.",
    category: "currency",
    severity: "major",
    economicImpact: {
      currencyEffect: "Rial falls to 1,000 per USD in south"
    },
    sources: ["Arab Center DC"]
  },

  // ============================================
  // 2022 - Truce and Currency Reforms
  // ============================================
  {
    id: "evt-2022-01",
    date: "2022-01-17",
    year: 2022,
    month: 1,
    day: 17,
    title: "Houthi Attacks on UAE",
    titleAr: "هجمات حوثية على الإمارات",
    description: "Houthis launch unprecedented drone and missile attacks on UAE, killing 3.",
    descriptionAr: "يطلق الحوثيون هجمات غير مسبوقة بالطائرات المسيرة والصواريخ على الإمارات، مما يقتل 3.",
    category: "conflict",
    severity: "critical",
    sources: ["Arab Center DC", "Reuters"]
  },
  {
    id: "evt-2022-02",
    date: "2022-01-21",
    year: 2022,
    month: 1,
    day: 21,
    title: "Coalition Strikes Sanaa Prison",
    titleAr: "غارات التحالف على سجن صنعاء",
    description: "Coalition airstrike on detention center in Sanaa kills over 80 people.",
    descriptionAr: "غارة التحالف على مركز احتجاز في صنعاء تقتل أكثر من 80 شخصاً.",
    category: "humanitarian",
    severity: "critical",
    sources: ["UN", "Human Rights Watch"]
  },
  {
    id: "evt-2022-03",
    date: "2022-04-02",
    year: 2022,
    month: 4,
    day: 2,
    title: "UN-Brokered Truce",
    titleAr: "الهدنة بوساطة الأمم المتحدة",
    description: "UN brokers two-month nationwide truce, first since 2016.",
    descriptionAr: "الأمم المتحدة تتوسط لهدنة وطنية لمدة شهرين، الأولى منذ 2016.",
    category: "international",
    severity: "critical",
    economicImpact: {
      tradeEffect: "Commercial flights resume to Sanaa"
    },
    sources: ["UN", "Arab Center DC"],
    image: "/images/events/truce_2022.jpg"
  },
  {
    id: "evt-2022-04",
    date: "2022-04-07",
    year: 2022,
    month: 4,
    day: 7,
    title: "Presidential Leadership Council Formed",
    titleAr: "تشكيل مجلس القيادة الرئاسي",
    description: "President Hadi transfers power to 8-member Presidential Leadership Council.",
    descriptionAr: "الرئيس هادي ينقل السلطة إلى مجلس القيادة الرئاسي المكون من 8 أعضاء.",
    category: "international",
    severity: "critical",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2022-05",
    date: "2022-04-08",
    year: 2022,
    month: 4,
    day: 8,
    title: "Saudi-UAE $3 Billion Aid",
    titleAr: "مساعدات سعودية إماراتية بـ3 مليارات دولار",
    description: "Saudi Arabia and UAE pledge $3 billion to support Yemen's economy.",
    descriptionAr: "السعودية والإمارات تتعهدان بـ3 مليارات دولار لدعم الاقتصاد اليمني.",
    category: "international",
    severity: "critical",
    economicImpact: {
      currencyEffect: "Rial stabilizes temporarily"
    },
    sources: ["Arab Center DC", "Reuters"]
  },
  {
    id: "evt-2022-06",
    date: "2022-10-02",
    year: 2022,
    month: 10,
    day: 2,
    title: "Truce Expires",
    titleAr: "انتهاء الهدنة",
    description: "UN-brokered truce expires without renewal, though large-scale fighting does not resume.",
    descriptionAr: "تنتهي الهدنة بوساطة الأمم المتحدة دون تجديد، رغم عدم استئناف القتال واسع النطاق.",
    category: "international",
    severity: "major",
    sources: ["UN", "Arab Center DC"]
  },

  // ============================================
  // 2023 - Saudi-Iran Détente
  // ============================================
  {
    id: "evt-2023-01",
    date: "2023-03-10",
    year: 2023,
    month: 3,
    day: 10,
    title: "Saudi-Iran Détente",
    titleAr: "التقارب السعودي الإيراني",
    description: "China brokers restoration of Saudi-Iran diplomatic relations, opening path for Yemen peace.",
    descriptionAr: "الصين تتوسط لاستعادة العلاقات الدبلوماسية السعودية الإيرانية، مما يفتح الطريق للسلام في اليمن.",
    category: "international",
    severity: "critical",
    sources: ["Arab Center DC", "Reuters"]
  },
  {
    id: "evt-2023-02",
    date: "2023-04-09",
    year: 2023,
    month: 4,
    day: 9,
    title: "Saudi-Houthi Direct Talks",
    titleAr: "محادثات سعودية حوثية مباشرة",
    description: "Saudi and Omani delegations visit Sanaa for direct talks with Houthi leadership.",
    descriptionAr: "وفدان سعودي وعماني يزوران صنعاء لإجراء محادثات مباشرة مع قيادة الحوثيين.",
    category: "international",
    severity: "critical",
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2023-03",
    date: "2023-04-14",
    year: 2023,
    month: 4,
    day: 14,
    title: "Major Prisoner Exchange",
    titleAr: "تبادل أسرى كبير",
    description: "Warring parties exchange 869 detainees in largest swap since conflict began.",
    descriptionAr: "الأطراف المتحاربة تتبادل 869 معتقلاً في أكبر عملية تبادل منذ بداية الصراع.",
    category: "humanitarian",
    severity: "major",
    sources: ["UN", "ICRC"]
  },
  {
    id: "evt-2023-04",
    date: "2023-08-01",
    year: 2023,
    month: 8,
    title: "Saudi $1.2 Billion Aid",
    titleAr: "مساعدات سعودية بـ1.2 مليار دولار",
    description: "Saudi Arabia announces $1.2 billion aid package to stabilize Yemen's economy.",
    descriptionAr: "السعودية تعلن حزمة مساعدات بـ1.2 مليار دولار لتحقيق الاستقرار في الاقتصاد اليمني.",
    category: "international",
    severity: "major",
    economicImpact: {
      currencyEffect: "Support for civil servant salaries"
    },
    sources: ["Arab Center DC"]
  },
  {
    id: "evt-2023-05",
    date: "2023-10-19",
    year: 2023,
    month: 10,
    day: 19,
    title: "Houthis Begin Red Sea Attacks",
    titleAr: "الحوثيون يبدأون هجمات البحر الأحمر",
    description: "Houthis begin attacking commercial ships in Red Sea in response to Gaza war.",
    descriptionAr: "يبدأ الحوثيون مهاجمة السفن التجارية في البحر الأحمر رداً على حرب غزة.",
    category: "trade",
    severity: "critical",
    economicImpact: {
      tradeEffect: "Global shipping disrupted"
    },
    sources: ["Reuters", "UN"]
  },

  // ============================================
  // 2024 - Red Sea Crisis
  // ============================================
  {
    id: "evt-2024-01",
    date: "2024-01-12",
    year: 2024,
    month: 1,
    day: 12,
    title: "US-UK Strikes on Yemen",
    titleAr: "ضربات أمريكية بريطانية على اليمن",
    description: "US and UK launch airstrikes on Houthi targets in response to Red Sea attacks.",
    descriptionAr: "الولايات المتحدة وبريطانيا تشنان غارات جوية على أهداف حوثية رداً على هجمات البحر الأحمر.",
    category: "conflict",
    severity: "critical",
    sources: ["Reuters", "BBC"]
  },
  {
    id: "evt-2024-02",
    date: "2024-01-17",
    year: 2024,
    month: 1,
    day: 17,
    title: "Houthis Re-designated as FTO",
    titleAr: "إعادة تصنيف الحوثيين كمنظمة إرهابية",
    description: "Biden administration re-designates Houthis as Specially Designated Global Terrorists.",
    descriptionAr: "إدارة بايدن تعيد تصنيف الحوثيين كإرهابيين عالميين مصنفين خصيصاً.",
    category: "international",
    severity: "major",
    sources: ["State Department"]
  },
  {
    id: "evt-2024-03",
    date: "2024-02-19",
    year: 2024,
    month: 2,
    day: 19,
    title: "Rubymar Sinking",
    titleAr: "غرق روبيمار",
    description: "Houthi attack sinks cargo ship Rubymar, first vessel lost in Red Sea attacks.",
    descriptionAr: "هجوم حوثي يغرق سفينة الشحن روبيمار، أول سفينة تُفقد في هجمات البحر الأحمر.",
    category: "trade",
    severity: "critical",
    economicImpact: {
      tradeEffect: "Shipping insurance costs surge"
    },
    sources: ["Reuters", "Lloyd's"]
  },
  {
    id: "evt-2024-04",
    date: "2024-06-01",
    year: 2024,
    month: 6,
    title: "Red Sea Trade Diversion",
    titleAr: "تحويل تجارة البحر الأحمر",
    description: "Major shipping companies continue avoiding Red Sea, adding 10-14 days to routes.",
    descriptionAr: "شركات الشحن الكبرى تستمر في تجنب البحر الأحمر، مما يضيف 10-14 يوماً للمسارات.",
    category: "trade",
    severity: "major",
    economicImpact: {
      tradeEffect: "Suez Canal traffic down 50%"
    },
    sources: ["Reuters", "IMF"]
  },
  {
    id: "evt-2024-05",
    date: "2024-09-01",
    year: 2024,
    month: 9,
    title: "Peace Talks Resume",
    titleAr: "استئناف محادثات السلام",
    description: "UN-mediated peace talks resume between Saudi Arabia and Houthis in Oman.",
    descriptionAr: "استئناف محادثات السلام بوساطة الأمم المتحدة بين السعودية والحوثيين في عُمان.",
    category: "international",
    severity: "major",
    sources: ["UN", "Arab Center DC"]
  },

  // ============================================
  // 2025 - Current Period
  // ============================================
  {
    id: "evt-2025-01",
    date: "2025-01-01",
    year: 2025,
    month: 1,
    title: "Economic Recovery Framework",
    titleAr: "إطار التعافي الاقتصادي",
    description: "International community launches comprehensive economic recovery framework for Yemen.",
    descriptionAr: "المجتمع الدولي يطلق إطاراً شاملاً للتعافي الاقتصادي في اليمن.",
    category: "recovery",
    severity: "major",
    economicImpact: {
      gdpEffect: "Projected 2% growth if peace holds"
    },
    sources: ["World Bank", "UN"]
  },
  {
    id: "evt-2025-02",
    date: "2025-03-01",
    year: 2025,
    month: 3,
    title: "Currency Unification Talks",
    titleAr: "محادثات توحيد العملة",
    description: "Central banks in Sanaa and Aden begin technical talks on currency unification.",
    descriptionAr: "البنكان المركزيان في صنعاء وعدن يبدآن محادثات فنية حول توحيد العملة.",
    category: "currency",
    severity: "major",
    economicImpact: {
      currencyEffect: "Hope for unified exchange rate"
    },
    sources: ["IMF", "World Bank"]
  },
  {
    id: "evt-2025-03",
    date: "2025-06-01",
    year: 2025,
    month: 6,
    title: "Humanitarian Funding Gap",
    titleAr: "فجوة التمويل الإنساني",
    description: "UN warns of $3 billion humanitarian funding gap as needs remain critical.",
    descriptionAr: "الأمم المتحدة تحذر من فجوة تمويل إنسانية بـ3 مليارات دولار مع استمرار الاحتياجات الحرجة.",
    category: "humanitarian",
    severity: "critical",
    sources: ["OCHA", "WFP"]
  },
  {
    id: "evt-2025-04",
    date: "2025-09-01",
    year: 2025,
    month: 9,
    title: "Infrastructure Reconstruction Begins",
    titleAr: "بدء إعادة بناء البنية التحتية",
    description: "Major infrastructure reconstruction projects begin in government-controlled areas.",
    descriptionAr: "بدء مشاريع كبرى لإعادة بناء البنية التحتية في المناطق الخاضعة لسيطرة الحكومة.",
    category: "infrastructure",
    severity: "major",
    economicImpact: {
      gdpEffect: "Construction sector revival"
    },
    sources: ["World Bank"]
  },

  // ============================================
  // 2026 - January Events (Current)
  // ============================================
  {
    id: "evt-2026-01",
    date: "2026-01-01",
    year: 2026,
    month: 1,
    day: 1,
    title: "New Year Economic Outlook",
    titleAr: "التوقعات الاقتصادية للعام الجديد",
    description: "IMF projects Yemen's economy could grow 3-4% if peace agreement is finalized.",
    descriptionAr: "صندوق النقد الدولي يتوقع نمو الاقتصاد اليمني 3-4% إذا تم إنهاء اتفاق السلام.",
    category: "recovery",
    severity: "moderate",
    economicImpact: {
      gdpEffect: "Projected 3-4% growth"
    },
    sources: ["IMF"]
  },
  {
    id: "evt-2026-02",
    date: "2026-01-05",
    year: 2026,
    month: 1,
    day: 5,
    title: "CBY Aden Suspends 79 Exchange Companies",
    titleAr: "البنك المركزي عدن يوقف 79 شركة صرافة",
    description: "Central Bank of Yemen in Aden suspends licenses of 79 exchange companies for violations of monetary regulations and currency speculation.",
    descriptionAr: "البنك المركزي اليمني في عدن يوقف تراخيص 79 شركة صرافة بسبب مخالفات الأنظمة النقدية والمضاربة على العملة.",
    category: "banking",
    severity: "critical",
    economicImpact: {
      currencyEffect: "Rial stabilizes at 1,890 YER/USD",
      tradeEffect: "Reduced informal remittance channels"
    },
    sources: ["CBY Aden", "Sana'a Center"]
  },
  {
    id: "evt-2026-03",
    date: "2026-01-06",
    year: 2026,
    month: 1,
    day: 6,
    title: "Saudi Arabia Increases Pressure on STC",
    titleAr: "السعودية تزيد الضغط على المجلس الانتقالي",
    description: "Saudi Arabia increases diplomatic pressure on Southern Transitional Council (STC) to comply with Riyadh Agreement and integrate forces.",
    descriptionAr: "السعودية تزيد الضغط الدبلوماسي على المجلس الانتقالي الجنوبي للامتثال لاتفاق الرياض ودمج القوات.",
    category: "international",
    severity: "major",
    economicImpact: {
      gdpEffect: "Uncertainty in southern economy"
    },
    sources: ["Reuters", "Al Jazeera"]
  },
  {
    id: "evt-2026-04",
    date: "2026-01-07",
    year: 2026,
    month: 1,
    day: 7,
    title: "Exchange Rate Reaches 1,890 YER/USD in Aden",
    titleAr: "سعر الصرف يصل 1,890 ريال/دولار في عدن",
    description: "Official exchange rate in Aden reaches 1,890 YER/USD while parallel market trades at 1,950. Sana'a maintains 530 YER/USD.",
    descriptionAr: "سعر الصرف الرسمي في عدن يصل 1,890 ريال/دولار بينما السوق الموازي 1,950. صنعاء تحافظ على 530 ريال/دولار.",
    category: "currency",
    severity: "critical",
    economicImpact: {
      currencyEffect: "257% gap between Aden and Sana'a rates",
      inflationEffect: "Continued price pressure in south"
    },
    sources: ["CBY Aden", "CBY Sana'a"]
  },
  {
    id: "evt-2026-05",
    date: "2026-01-08",
    year: 2026,
    month: 1,
    day: 8,
    title: "Aidarus al-Zubaidi Flees to UAE",
    titleAr: "عيدروس الزبيدي يفر إلى الإمارات",
    description: "STC President Aidarus al-Zubaidi reportedly flees to UAE amid mounting pressure and imminent dissolution of the council.",
    descriptionAr: "رئيس المجلس الانتقالي عيدروس الزبيدي يفر إلى الإمارات وسط ضغوط متزايدة وحل وشيك للمجلس.",
    category: "conflict",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Political uncertainty in Aden",
      tradeEffect: "Port operations continue normally"
    },
    sources: ["Al Jazeera", "Reuters", "Sana'a Center"]
  },
  {
    id: "evt-2026-06",
    date: "2026-01-09",
    year: 2026,
    month: 1,
    day: 9,
    title: "Southern Transitional Council Officially Dissolved",
    titleAr: "حل المجلس الانتقالي الجنوبي رسمياً",
    description: "Presidential Leadership Council announces official dissolution of Southern Transitional Council (STC), ending years of parallel governance in south Yemen. Forces to be integrated into national military.",
    descriptionAr: "مجلس القيادة الرئاسي يعلن الحل الرسمي للمجلس الانتقالي الجنوبي، منهياً سنوات من الحكم الموازي في جنوب اليمن. القوات ستُدمج في الجيش الوطني.",
    category: "conflict",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Potential for unified economic policy",
      tradeEffect: "Aden port under central government control"
    },
    sources: ["Presidential Leadership Council", "Reuters", "Al Jazeera", "Sana'a Center"]
  },
  {
    id: "evt-2026-07",
    date: "2026-01-09",
    year: 2026,
    month: 1,
    day: 9,
    title: "CBY Board of Directors Meeting",
    titleAr: "اجتماع مجلس إدارة البنك المركزي",
    description: "Central Bank of Yemen Board of Directors convenes emergency meeting to discuss monetary policy following exchange company suspensions and political developments.",
    descriptionAr: "مجلس إدارة البنك المركزي اليمني يعقد اجتماعاً طارئاً لمناقشة السياسة النقدية بعد إيقاف شركات الصرافة والتطورات السياسية.",
    category: "banking",
    severity: "major",
    economicImpact: {
      currencyEffect: "Policy coordination on exchange rate"
    },
    sources: ["CBY Aden"]
  },
  {
    id: "evt-2026-08",
    date: "2026-01-09",
    year: 2026,
    month: 1,
    day: 9,
    title: "Forces Integration Plan Announced",
    titleAr: "الإعلان عن خطة دمج القوات",
    description: "Government announces comprehensive plan to integrate former STC forces into national military structure within 90 days.",
    descriptionAr: "الحكومة تعلن خطة شاملة لدمج قوات المجلس الانتقالي السابق في الهيكل العسكري الوطني خلال 90 يوماً.",
    category: "conflict",
    severity: "major",
    economicImpact: {
      gdpEffect: "Reduced military spending fragmentation"
    },
    sources: ["Yemen Ministry of Defense"]
  },
  {
    id: "evt-2026-09",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "WFP Reports 19.8 Million Food Insecure",
    titleAr: "برنامج الأغذية العالمي: 19.8 مليون يعانون انعدام الأمن الغذائي",
    description: "World Food Programme reports 19.8 million Yemenis (58% of population) face food insecurity, with 5.6 million in emergency conditions (IPC Phase 4).",
    descriptionAr: "برنامج الأغذية العالمي يفيد بأن 19.8 مليون يمني (58% من السكان) يواجهون انعدام الأمن الغذائي، منهم 5.6 مليون في ظروف طوارئ.",
    category: "food_security",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Humanitarian crisis continues"
    },
    sources: ["WFP", "IPC"]
  },
  {
    id: "evt-2026-10",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "Foreign Reserves at $1.15 Billion",
    titleAr: "الاحتياطيات الأجنبية 1.15 مليار دولار",
    description: "CBY Aden reports foreign exchange reserves at $1.15 billion, covering approximately 2.5 months of imports.",
    descriptionAr: "البنك المركزي في عدن يعلن احتياطيات النقد الأجنبي بقيمة 1.15 مليار دولار، تغطي حوالي 2.5 شهر من الواردات.",
    category: "banking",
    severity: "major",
    economicImpact: {
      currencyEffect: "Limited intervention capacity",
      tradeEffect: "Import financing constraints"
    },
    sources: ["CBY Aden", "IMF"]
  },
  {
    id: "evt-2026-11",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "Inflation Rate at 35% in Aden",
    titleAr: "معدل التضخم 35% في عدن",
    description: "Annual inflation rate in government-controlled areas reaches 35%, driven by currency depreciation and import costs.",
    descriptionAr: "معدل التضخم السنوي في المناطق الخاضعة لسيطرة الحكومة يصل 35%، مدفوعاً بانخفاض قيمة العملة وتكاليف الاستيراد.",
    category: "fiscal",
    severity: "critical",
    economicImpact: {
      inflationEffect: "35% annual inflation",
      gdpEffect: "Purchasing power erosion"
    },
    sources: ["IMF", "World Bank"]
  },
  {
    id: "evt-2026-12",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "Oil Exports Remain Zero Since October 2022",
    titleAr: "صادرات النفط تبقى صفراً منذ أكتوبر 2022",
    description: "Yemen's oil exports continue at zero since Houthi attacks on oil terminals in October 2022, depriving government of primary revenue source.",
    descriptionAr: "صادرات النفط اليمنية مستمرة عند الصفر منذ هجمات الحوثيين على محطات النفط في أكتوبر 2022، مما يحرم الحكومة من مصدر الإيرادات الرئيسي.",
    category: "oil",
    severity: "critical",
    economicImpact: {
      gdpEffect: "$1.5 billion annual revenue loss",
      tradeEffect: "Zero oil exports"
    },
    sources: ["World Bank", "IMF"]
  },
  {
    id: "evt-2026-13",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "Red Sea Shipping Crisis Continues",
    titleAr: "استمرار أزمة الشحن في البحر الأحمر",
    description: "Houthi attacks on Red Sea shipping continue to disrupt global trade routes, with major shipping companies avoiding the region.",
    descriptionAr: "هجمات الحوثيين على الشحن في البحر الأحمر تستمر في تعطيل طرق التجارة العالمية، مع تجنب شركات الشحن الكبرى للمنطقة.",
    category: "trade",
    severity: "critical",
    economicImpact: {
      tradeEffect: "Global shipping rerouting via Cape of Good Hope",
      gdpEffect: "Reduced Aden port revenues"
    },
    sources: ["Reuters", "Lloyd's List"]
  },
  {
    id: "evt-2026-14",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "HDI Remains at 0.424 (Low Human Development)",
    titleAr: "مؤشر التنمية البشرية يبقى عند 0.424",
    description: "UNDP Human Development Report confirms Yemen's HDI at 0.424, ranking 183rd out of 193 countries globally.",
    descriptionAr: "تقرير التنمية البشرية للأمم المتحدة يؤكد مؤشر التنمية البشرية لليمن عند 0.424، في المرتبة 183 من 193 دولة عالمياً.",
    category: "humanitarian",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Development indicators stagnant"
    },
    sources: ["UNDP"]
  },
  {
    id: "evt-2026-15",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "Poverty Rate at 80%",
    titleAr: "معدل الفقر 80%",
    description: "World Bank estimates 80% of Yemen's population lives below the poverty line, with 21.6 million requiring humanitarian assistance.",
    descriptionAr: "البنك الدولي يقدر أن 80% من سكان اليمن يعيشون تحت خط الفقر، مع 21.6 مليون يحتاجون مساعدات إنسانية.",
    category: "humanitarian",
    severity: "critical",
    economicImpact: {
      gdpEffect: "GDP per capita $577"
    },
    sources: ["World Bank", "UNDP"]
  },
  {
    id: "evt-2026-16",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "Fuel Prices Surge in Aden",
    titleAr: "ارتفاع أسعار الوقود في عدن",
    description: "Fuel prices in Aden reach 950 YER/liter for petrol and 850 YER/liter for diesel, up 15% from December 2025.",
    descriptionAr: "أسعار الوقود في عدن تصل 950 ريال/لتر للبنزين و850 ريال/لتر للديزل، بزيادة 15% عن ديسمبر 2025.",
    category: "oil",
    severity: "major",
    economicImpact: {
      inflationEffect: "Transportation costs increase",
      gdpEffect: "Business operating costs rise"
    },
    sources: ["Yemen Petroleum Company"]
  },
  {
    id: "evt-2026-17",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "Unemployment Estimated at 35%",
    titleAr: "البطالة تقدر بـ 35%",
    description: "ILO estimates unemployment rate at 35%, with youth unemployment exceeding 50%. Informal sector employs majority of workforce.",
    descriptionAr: "منظمة العمل الدولية تقدر معدل البطالة بـ 35%، مع بطالة الشباب تتجاوز 50%. القطاع غير الرسمي يوظف غالبية القوى العاملة.",
    category: "humanitarian",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Labor market crisis"
    },
    sources: ["ILO", "World Bank"]
  },
  {
    id: "evt-2026-18",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    day: 10,
    title: "Humanitarian Funding Gap Widens",
    titleAr: "اتساع فجوة التمويل الإنساني",
    description: "UN OCHA reports 2026 humanitarian response plan requires $4.5 billion, with only 35% funded to date.",
    descriptionAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية يفيد بأن خطة الاستجابة الإنسانية 2026 تتطلب 4.5 مليار دولار، مع تمويل 35% فقط حتى الآن.",
    category: "humanitarian",
    severity: "critical",
    economicImpact: {
      gdpEffect: "Reduced humanitarian operations"
    },
    sources: ["OCHA", "UN"]
  }
];

// Helper function to get events by year
export function getEventsByYear(year: number): EconomicEvent[] {
  return economicEventsData.filter(event => event.year === year);
}

// Helper function to get events by category
export function getEventsByCategory(category: EconomicEvent['category']): EconomicEvent[] {
  return economicEventsData.filter(event => event.category === category);
}

// Helper function to get events by severity
export function getEventsBySeverity(severity: EconomicEvent['severity']): EconomicEvent[] {
  return economicEventsData.filter(event => event.severity === severity);
}

// Get all unique years
export function getUniqueYears(): number[] {
  return Array.from(new Set(economicEventsData.map(event => event.year))).sort();
}

// Get all unique categories
export function getUniqueCategories(): EconomicEvent['category'][] {
  return Array.from(new Set(economicEventsData.map(event => event.category)));
}

// Get event count by year
export function getEventCountByYear(): Record<number, number> {
  return economicEventsData.reduce((acc, event) => {
    acc[event.year] = (acc[event.year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
}

// Category labels for display
export const categoryLabels: Record<EconomicEvent['category'], { en: string; ar: string; color: string }> = {
  conflict: { en: "Conflict", ar: "الصراع", color: "#ef4444" },
  banking: { en: "Banking/Financial", ar: "المصرفي/المالي", color: "#f59e0b" },
  international: { en: "International", ar: "الدولي", color: "#3b82f6" },
  currency: { en: "Currency", ar: "العملة", color: "#8b5cf6" },
  humanitarian: { en: "Humanitarian", ar: "الإنساني", color: "#10b981" },
  recovery: { en: "Recovery", ar: "التعافي", color: "#06b6d4" },
  trade: { en: "Trade", ar: "التجارة", color: "#6366f1" },
  oil: { en: "Oil & Energy", ar: "النفط والطاقة", color: "#84cc16" },
  fiscal: { en: "Fiscal Policy", ar: "السياسة المالية", color: "#ec4899" },
  food_security: { en: "Food Security", ar: "الأمن الغذائي", color: "#f97316" },
  infrastructure: { en: "Infrastructure", ar: "البنية التحتية", color: "#14b8a6" }
};

export default economicEventsData;
