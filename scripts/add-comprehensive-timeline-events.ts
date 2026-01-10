import { getDb } from '../server/db';
import { economicEvents } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface TimelineEvent {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  date: string;
  category: string;
  impact: string;
  source: string;
  sectors: string[];
}

const comprehensiveEvents: TimelineEvent[] = [
  // 2010 Events
  {
    title: "Yemen joins Gulf Cooperation Council free trade area",
    titleAr: "اليمن ينضم إلى منطقة التجارة الحرة لدول مجلس التعاون الخليجي",
    description: "Yemen becomes part of the GCC free trade zone, reducing tariffs on goods from member states",
    descriptionAr: "اليمن يصبح جزءاً من منطقة التجارة الحرة لدول مجلس التعاون، مما يخفض الرسوم الجمركية على السلع",
    date: "2010-01-01",
    category: "trade",
    impact: "positive",
    source: "GCC Secretariat",
    sectors: ["trade", "economy"]
  },
  {
    title: "IMF approves $370M Extended Credit Facility for Yemen",
    titleAr: "صندوق النقد الدولي يوافق على تسهيل ائتماني ممدد بقيمة 370 مليون دولار لليمن",
    description: "IMF provides financial support to help Yemen address balance of payments needs and implement economic reforms",
    descriptionAr: "صندوق النقد الدولي يقدم دعماً مالياً لمساعدة اليمن في معالجة احتياجات ميزان المدفوعات وتنفيذ الإصلاحات الاقتصادية",
    date: "2010-04-15",
    category: "fiscal",
    impact: "positive",
    source: "IMF",
    sectors: ["fiscal", "economy"]
  },
  {
    title: "Oil production reaches 260,000 bpd",
    titleAr: "إنتاج النفط يصل إلى 260,000 برميل يومياً",
    description: "Yemen's oil production peaks at 260,000 barrels per day before beginning long-term decline",
    descriptionAr: "إنتاج النفط اليمني يصل إلى ذروته عند 260,000 برميل يومياً قبل بدء الانخفاض طويل الأمد",
    date: "2010-06-01",
    category: "energy",
    impact: "neutral",
    source: "Ministry of Oil and Minerals",
    sectors: ["energy", "fiscal"]
  },
  
  // 2011 Events - Arab Spring
  {
    title: "Mass protests begin in Sana'a demanding political reform",
    titleAr: "بدء الاحتجاجات الجماهيرية في صنعاء للمطالبة بالإصلاح السياسي",
    description: "Inspired by Arab Spring, Yemenis begin protests calling for President Saleh's resignation",
    descriptionAr: "مستلهمين من الربيع العربي، اليمنيون يبدأون احتجاجات تطالب باستقالة الرئيس صالح",
    date: "2011-01-27",
    category: "political",
    impact: "negative",
    source: "Reuters",
    sectors: ["economy", "banking"]
  },
  {
    title: "CBY foreign reserves drop to $4.5 billion amid unrest",
    titleAr: "احتياطيات البنك المركزي الأجنبية تنخفض إلى 4.5 مليار دولار وسط الاضطرابات",
    description: "Political instability causes capital flight and depletes foreign currency reserves",
    descriptionAr: "عدم الاستقرار السياسي يسبب هروب رؤوس الأموال واستنزاف احتياطيات العملة الأجنبية",
    date: "2011-06-01",
    category: "banking",
    impact: "negative",
    source: "Central Bank of Yemen",
    sectors: ["banking", "currency"]
  },
  {
    title: "GCC Initiative signed - Saleh agrees to transfer power",
    titleAr: "توقيع المبادرة الخليجية - صالح يوافق على نقل السلطة",
    description: "President Saleh signs GCC-brokered deal to transfer power to Vice President Hadi",
    descriptionAr: "الرئيس صالح يوقع اتفاقاً برعاية خليجية لنقل السلطة إلى نائب الرئيس هادي",
    date: "2011-11-23",
    category: "political",
    impact: "positive",
    source: "GCC Secretariat",
    sectors: ["economy", "fiscal"]
  },
  {
    title: "GDP contracts by 12.7% - worst economic decline",
    titleAr: "الناتج المحلي الإجمالي ينكمش بنسبة 12.7% - أسوأ تراجع اقتصادي",
    description: "Political crisis causes severe economic contraction, the worst in Yemen's modern history",
    descriptionAr: "الأزمة السياسية تسبب انكماشاً اقتصادياً حاداً، الأسوأ في تاريخ اليمن الحديث",
    date: "2011-12-31",
    category: "economy",
    impact: "negative",
    source: "World Bank",
    sectors: ["economy", "trade", "employment"]
  },
  
  // 2012 Events - Transition
  {
    title: "Hadi inaugurated as President",
    titleAr: "تنصيب هادي رئيساً للجمهورية",
    description: "Abd Rabbuh Mansur Hadi sworn in as President following single-candidate election",
    descriptionAr: "عبد ربه منصور هادي يؤدي اليمين الدستورية رئيساً للجمهورية بعد انتخابات المرشح الواحد",
    date: "2012-02-25",
    category: "political",
    impact: "positive",
    source: "Yemen Government",
    sectors: ["economy", "fiscal"]
  },
  {
    title: "Friends of Yemen pledge $7.9 billion in aid",
    titleAr: "أصدقاء اليمن يتعهدون بـ 7.9 مليار دولار كمساعدات",
    description: "International donors pledge significant aid to support Yemen's political transition",
    descriptionAr: "المانحون الدوليون يتعهدون بمساعدات كبيرة لدعم المرحلة الانتقالية السياسية في اليمن",
    date: "2012-09-27",
    category: "aid",
    impact: "positive",
    source: "UN",
    sectors: ["aid", "fiscal", "economy"]
  },
  {
    title: "National Dialogue Conference begins",
    titleAr: "بدء مؤتمر الحوار الوطني",
    description: "Comprehensive national dialogue begins to address political, economic and social issues",
    descriptionAr: "بدء حوار وطني شامل لمعالجة القضايا السياسية والاقتصادية والاجتماعية",
    date: "2012-03-18",
    category: "political",
    impact: "positive",
    source: "Yemen Government",
    sectors: ["economy", "governance"]
  },
  
  // 2013 Events
  {
    title: "Oil pipeline attacks reduce exports by 50%",
    titleAr: "هجمات على خطوط أنابيب النفط تخفض الصادرات بنسبة 50%",
    description: "Repeated sabotage of Marib-Ras Isa pipeline severely impacts oil export revenues",
    descriptionAr: "التخريب المتكرر لخط أنابيب مأرب-رأس عيسى يؤثر بشدة على عائدات صادرات النفط",
    date: "2013-03-01",
    category: "energy",
    impact: "negative",
    source: "Ministry of Oil",
    sectors: ["energy", "fiscal", "trade"]
  },
  {
    title: "Fuel subsidy reform begins - prices increase 60%",
    titleAr: "بدء إصلاح دعم الوقود - الأسعار ترتفع 60%",
    description: "Government begins phasing out fuel subsidies as part of IMF-backed reforms",
    descriptionAr: "الحكومة تبدأ الإلغاء التدريجي لدعم الوقود كجزء من إصلاحات مدعومة من صندوق النقد الدولي",
    date: "2013-07-30",
    category: "fiscal",
    impact: "negative",
    source: "IMF",
    sectors: ["energy", "prices", "fiscal"]
  },
  {
    title: "Remittances reach $3.4 billion - 10% of GDP",
    titleAr: "التحويلات تصل إلى 3.4 مليار دولار - 10% من الناتج المحلي الإجمالي",
    description: "Diaspora remittances become increasingly important source of foreign exchange",
    descriptionAr: "تحويلات المغتربين تصبح مصدراً متزايد الأهمية للعملة الأجنبية",
    date: "2013-12-31",
    category: "banking",
    impact: "positive",
    source: "World Bank",
    sectors: ["banking", "economy"]
  },
  
  // 2014 Events - Houthi Advance
  {
    title: "National Dialogue Conference concludes with outcomes document",
    titleAr: "مؤتمر الحوار الوطني يختتم بوثيقة مخرجات",
    description: "NDC produces comprehensive document outlining future federal structure and reforms",
    descriptionAr: "مؤتمر الحوار الوطني ينتج وثيقة شاملة تحدد الهيكل الفيدرالي المستقبلي والإصلاحات",
    date: "2014-01-25",
    category: "political",
    impact: "positive",
    source: "Yemen Government",
    sectors: ["governance", "economy"]
  },
  {
    title: "Houthis capture Amran province",
    titleAr: "الحوثيون يسيطرون على محافظة عمران",
    description: "Armed Houthi movement expands control northward, defeating government forces",
    descriptionAr: "الحركة الحوثية المسلحة توسع سيطرتها شمالاً، وتهزم القوات الحكومية",
    date: "2014-07-08",
    category: "conflict",
    impact: "negative",
    source: "UN",
    sectors: ["security", "economy"]
  },
  {
    title: "Houthis seize Sana'a - government collapses",
    titleAr: "الحوثيون يسيطرون على صنعاء - الحكومة تنهار",
    description: "Houthi forces take control of the capital, forcing government resignation",
    descriptionAr: "القوات الحوثية تسيطر على العاصمة، مما يجبر الحكومة على الاستقالة",
    date: "2014-09-21",
    category: "conflict",
    impact: "negative",
    source: "UN Security Council",
    sectors: ["economy", "banking", "governance"]
  },
  {
    title: "OFAC designates Houthi leaders under sanctions",
    titleAr: "مكتب مراقبة الأصول الأجنبية يدرج قادة الحوثيين في قوائم العقوبات",
    description: "US Treasury sanctions Abdul-Malik al-Houthi and other Houthi leaders",
    descriptionAr: "وزارة الخزانة الأمريكية تفرض عقوبات على عبدالملك الحوثي وقادة حوثيين آخرين",
    date: "2014-11-07",
    category: "sanctions",
    impact: "negative",
    source: "OFAC",
    sectors: ["banking", "trade"]
  },
  
  // 2015 Events - War Begins
  {
    title: "Houthis dissolve parliament, announce constitutional declaration",
    titleAr: "الحوثيون يحلون البرلمان ويعلنون إعلاناً دستورياً",
    description: "Revolutionary Committee announces takeover of government institutions",
    descriptionAr: "اللجنة الثورية تعلن السيطرة على المؤسسات الحكومية",
    date: "2015-02-06",
    category: "political",
    impact: "negative",
    source: "UN",
    sectors: ["governance", "economy"]
  },
  {
    title: "President Hadi escapes to Aden, declares it temporary capital",
    titleAr: "الرئيس هادي يهرب إلى عدن ويعلنها عاصمة مؤقتة",
    description: "Hadi flees house arrest and establishes government in Aden",
    descriptionAr: "هادي يهرب من الإقامة الجبرية ويؤسس حكومة في عدن",
    date: "2015-02-21",
    category: "political",
    impact: "neutral",
    source: "Reuters",
    sectors: ["governance", "economy"]
  },
  {
    title: "Saudi-led coalition launches Operation Decisive Storm",
    titleAr: "التحالف بقيادة السعودية يطلق عملية عاصفة الحزم",
    description: "Military intervention begins with airstrikes targeting Houthi positions",
    descriptionAr: "التدخل العسكري يبدأ بغارات جوية تستهدف مواقع الحوثيين",
    date: "2015-03-26",
    category: "conflict",
    impact: "negative",
    source: "Saudi Press Agency",
    sectors: ["economy", "infrastructure", "trade"]
  },
  {
    title: "UN Security Council Resolution 2216 imposes arms embargo",
    titleAr: "قرار مجلس الأمن الدولي 2216 يفرض حظراً على الأسلحة",
    description: "UNSC imposes arms embargo on Houthi leaders and demands withdrawal from seized areas",
    descriptionAr: "مجلس الأمن يفرض حظراً على الأسلحة لقادة الحوثيين ويطالب بالانسحاب من المناطق المحتلة",
    date: "2015-04-14",
    category: "sanctions",
    impact: "negative",
    source: "UN Security Council",
    sectors: ["trade", "banking"]
  },
  {
    title: "Aden port severely damaged, trade disrupted",
    titleAr: "ميناء عدن يتضرر بشدة، التجارة تتعطل",
    description: "Fighting damages critical port infrastructure, disrupting imports",
    descriptionAr: "القتال يدمر البنية التحتية الحيوية للميناء، مما يعطل الواردات",
    date: "2015-05-01",
    category: "infrastructure",
    impact: "negative",
    source: "UN OCHA",
    sectors: ["trade", "infrastructure"]
  },
  {
    title: "CBY Sana'a stops paying government salaries",
    titleAr: "البنك المركزي في صنعاء يتوقف عن دفع رواتب الموظفين الحكوميين",
    description: "Central bank in Houthi-controlled Sana'a suspends salary payments to civil servants",
    descriptionAr: "البنك المركزي في صنعاء الخاضعة للحوثيين يعلق دفع رواتب موظفي الخدمة المدنية",
    date: "2015-08-01",
    category: "banking",
    impact: "negative",
    source: "UN OCHA",
    sectors: ["banking", "employment", "poverty"]
  },
  {
    title: "GDP contracts by 28.1% - economy collapses",
    titleAr: "الناتج المحلي الإجمالي ينكمش بنسبة 28.1% - الاقتصاد ينهار",
    description: "War causes catastrophic economic contraction, the worst in Yemen's history",
    descriptionAr: "الحرب تسبب انكماشاً اقتصادياً كارثياً، الأسوأ في تاريخ اليمن",
    date: "2015-12-31",
    category: "economy",
    impact: "negative",
    source: "World Bank",
    sectors: ["economy", "trade", "employment"]
  },
  
  // 2016 Events
  {
    title: "UN-brokered peace talks begin in Kuwait",
    titleAr: "بدء محادثات السلام برعاية الأمم المتحدة في الكويت",
    description: "First major peace negotiations between warring parties",
    descriptionAr: "أول مفاوضات سلام رئيسية بين الأطراف المتحاربة",
    date: "2016-04-21",
    category: "political",
    impact: "positive",
    source: "UN",
    sectors: ["economy", "governance"]
  },
  {
    title: "CBY headquarters relocated to Aden",
    titleAr: "نقل مقر البنك المركزي إلى عدن",
    description: "President Hadi orders Central Bank relocation from Sana'a to Aden",
    descriptionAr: "الرئيس هادي يأمر بنقل البنك المركزي من صنعاء إلى عدن",
    date: "2016-09-18",
    category: "banking",
    impact: "negative",
    source: "Presidential Decree",
    sectors: ["banking", "currency"]
  },
  {
    title: "Currency bifurcation begins - two exchange rates emerge",
    titleAr: "بدء انقسام العملة - ظهور سعرين للصرف",
    description: "CBY split leads to divergent monetary policies and exchange rates",
    descriptionAr: "انقسام البنك المركزي يؤدي إلى سياسات نقدية وأسعار صرف متباينة",
    date: "2016-10-01",
    category: "currency",
    impact: "negative",
    source: "IMF",
    sectors: ["currency", "banking", "trade"]
  },
  {
    title: "Saudi Arabia deposits $2 billion in CBY Aden",
    titleAr: "السعودية تودع 2 مليار دولار في البنك المركزي في عدن",
    description: "Emergency deposit to stabilize Yemeni Rial and support government",
    descriptionAr: "وديعة طارئة لتحقيق استقرار الريال اليمني ودعم الحكومة",
    date: "2016-11-01",
    category: "banking",
    impact: "positive",
    source: "Saudi Press Agency",
    sectors: ["banking", "currency"]
  },
  {
    title: "Cholera outbreak begins amid infrastructure collapse",
    titleAr: "بدء تفشي الكوليرا وسط انهيار البنية التحتية",
    description: "First major cholera outbreak due to water and sanitation system failures",
    descriptionAr: "أول تفشٍ كبير للكوليرا بسبب فشل أنظمة المياه والصرف الصحي",
    date: "2016-10-06",
    category: "humanitarian",
    impact: "negative",
    source: "WHO",
    sectors: ["health", "infrastructure"]
  },
  
  // 2017 Events
  {
    title: "Cholera epidemic becomes world's largest - 500,000 cases",
    titleAr: "وباء الكوليرا يصبح الأكبر في العالم - 500,000 حالة",
    description: "Yemen records the largest cholera outbreak in modern history",
    descriptionAr: "اليمن يسجل أكبر تفشٍ للكوليرا في التاريخ الحديث",
    date: "2017-08-14",
    category: "humanitarian",
    impact: "negative",
    source: "WHO",
    sectors: ["health", "infrastructure"]
  },
  {
    title: "Former President Saleh killed by Houthis",
    titleAr: "مقتل الرئيس السابق صالح على يد الحوثيين",
    description: "Ali Abdullah Saleh killed after announcing split from Houthi alliance",
    descriptionAr: "علي عبدالله صالح يُقتل بعد إعلان انفصاله عن تحالف الحوثيين",
    date: "2017-12-04",
    category: "political",
    impact: "negative",
    source: "Reuters",
    sectors: ["economy", "security"]
  },
  {
    title: "Hodeidah port operations severely restricted",
    titleAr: "عمليات ميناء الحديدة مقيدة بشدة",
    description: "Coalition restrictions on Hodeidah port limit food and fuel imports",
    descriptionAr: "قيود التحالف على ميناء الحديدة تحد من واردات الغذاء والوقود",
    date: "2017-11-06",
    category: "trade",
    impact: "negative",
    source: "UN OCHA",
    sectors: ["trade", "food", "energy"]
  },
  {
    title: "Exchange rate reaches 400 YER/USD in Aden",
    titleAr: "سعر الصرف يصل إلى 400 ريال/دولار في عدن",
    description: "Rial depreciation accelerates as foreign reserves deplete",
    descriptionAr: "انخفاض قيمة الريال يتسارع مع استنزاف الاحتياطيات الأجنبية",
    date: "2017-12-01",
    category: "currency",
    impact: "negative",
    source: "CBY",
    sectors: ["currency", "prices"]
  },
  
  // 2018 Events
  {
    title: "Stockholm Agreement signed - Hodeidah ceasefire",
    titleAr: "توقيع اتفاق ستوكهولم - وقف إطلاق النار في الحديدة",
    description: "UN-brokered agreement includes Hodeidah ceasefire and prisoner exchange",
    descriptionAr: "اتفاق برعاية الأمم المتحدة يشمل وقف إطلاق النار في الحديدة وتبادل الأسرى",
    date: "2018-12-13",
    category: "political",
    impact: "positive",
    source: "UN",
    sectors: ["trade", "economy"]
  },
  {
    title: "Saudi Arabia provides $200M for wheat imports",
    titleAr: "السعودية تقدم 200 مليون دولار لواردات القمح",
    description: "Emergency food assistance to address famine risk",
    descriptionAr: "مساعدات غذائية طارئة لمعالجة خطر المجاعة",
    date: "2018-05-01",
    category: "aid",
    impact: "positive",
    source: "Saudi Press Agency",
    sectors: ["food", "aid"]
  },
  {
    title: "Exchange rate reaches 700 YER/USD - record depreciation",
    titleAr: "سعر الصرف يصل إلى 700 ريال/دولار - انخفاض قياسي",
    description: "Rial hits record low as economic crisis deepens",
    descriptionAr: "الريال يصل إلى أدنى مستوى قياسي مع تعمق الأزمة الاقتصادية",
    date: "2018-10-01",
    category: "currency",
    impact: "negative",
    source: "CBY",
    sectors: ["currency", "prices", "poverty"]
  },
  {
    title: "UN warns 14 million at risk of famine",
    titleAr: "الأمم المتحدة تحذر من خطر المجاعة على 14 مليون شخص",
    description: "World's worst humanitarian crisis threatens mass starvation",
    descriptionAr: "أسوأ أزمة إنسانية في العالم تهدد بمجاعة جماعية",
    date: "2018-10-23",
    category: "humanitarian",
    impact: "negative",
    source: "UN OCHA",
    sectors: ["food", "poverty", "health"]
  },
  
  // 2019 Events
  {
    title: "STC seizes Aden - government forces expelled",
    titleAr: "المجلس الانتقالي الجنوبي يسيطر على عدن - طرد القوات الحكومية",
    description: "Southern Transitional Council takes control of Aden from government",
    descriptionAr: "المجلس الانتقالي الجنوبي يسيطر على عدن من الحكومة",
    date: "2019-08-10",
    category: "conflict",
    impact: "negative",
    source: "Reuters",
    sectors: ["economy", "governance"]
  },
  {
    title: "Riyadh Agreement signed between government and STC",
    titleAr: "توقيع اتفاق الرياض بين الحكومة والمجلس الانتقالي",
    description: "Saudi-brokered power-sharing deal to end south Yemen conflict",
    descriptionAr: "اتفاق تقاسم السلطة برعاية سعودية لإنهاء صراع جنوب اليمن",
    date: "2019-11-05",
    category: "political",
    impact: "positive",
    source: "Saudi Press Agency",
    sectors: ["governance", "economy"]
  },
  {
    title: "Houthi drone attacks on Saudi Aramco facilities",
    titleAr: "هجمات الحوثيين بالطائرات المسيرة على منشآت أرامكو السعودية",
    description: "Major attack on Saudi oil infrastructure temporarily halves production",
    descriptionAr: "هجوم كبير على البنية التحتية النفطية السعودية يخفض الإنتاج مؤقتاً إلى النصف",
    date: "2019-09-14",
    category: "conflict",
    impact: "negative",
    source: "Reuters",
    sectors: ["energy", "economy"]
  },
  {
    title: "WFP begins biometric registration for food aid",
    titleAr: "برنامج الأغذية العالمي يبدأ التسجيل البيومتري للمساعدات الغذائية",
    description: "New system to reduce aid diversion and improve targeting",
    descriptionAr: "نظام جديد للحد من تحويل المساعدات وتحسين الاستهداف",
    date: "2019-06-01",
    category: "aid",
    impact: "positive",
    source: "WFP",
    sectors: ["aid", "food"]
  },
  
  // 2020 Events
  {
    title: "COVID-19 pandemic reaches Yemen",
    titleAr: "جائحة كوفيد-19 تصل إلى اليمن",
    description: "First confirmed COVID-19 case amid collapsed health system",
    descriptionAr: "أول حالة مؤكدة لكوفيد-19 وسط انهيار النظام الصحي",
    date: "2020-04-10",
    category: "humanitarian",
    impact: "negative",
    source: "WHO",
    sectors: ["health", "economy"]
  },
  {
    title: "STC declares self-administration in south",
    titleAr: "المجلس الانتقالي يعلن الإدارة الذاتية في الجنوب",
    description: "STC announces emergency self-rule, breaking Riyadh Agreement",
    descriptionAr: "المجلس الانتقالي يعلن الحكم الذاتي الطارئ، منتهكاً اتفاق الرياض",
    date: "2020-04-26",
    category: "political",
    impact: "negative",
    source: "STC",
    sectors: ["governance", "economy"]
  },
  {
    title: "UN humanitarian appeal only 24% funded",
    titleAr: "نداء الأمم المتحدة الإنساني ممول بنسبة 24% فقط",
    description: "Record funding shortfall forces aid agencies to cut programs",
    descriptionAr: "عجز تمويلي قياسي يجبر وكالات الإغاثة على تقليص البرامج",
    date: "2020-06-02",
    category: "aid",
    impact: "negative",
    source: "UN OCHA",
    sectors: ["aid", "food", "health"]
  },
  {
    title: "Exchange rate reaches 800 YER/USD in Aden",
    titleAr: "سعر الصرف يصل إلى 800 ريال/دولار في عدن",
    description: "Continued depreciation despite Saudi support",
    descriptionAr: "استمرار الانخفاض رغم الدعم السعودي",
    date: "2020-06-01",
    category: "currency",
    impact: "negative",
    source: "CBY",
    sectors: ["currency", "prices"]
  },
  {
    title: "FSO Safer oil tanker threatens environmental catastrophe",
    titleAr: "ناقلة النفط صافر تهدد بكارثة بيئية",
    description: "Decaying oil tanker with 1.1M barrels risks massive spill",
    descriptionAr: "ناقلة نفط متهالكة تحمل 1.1 مليون برميل تهدد بتسرب ضخم",
    date: "2020-07-15",
    category: "energy",
    impact: "negative",
    source: "UN",
    sectors: ["energy", "environment"]
  },
  
  // 2021 Events
  {
    title: "Marib offensive intensifies - IDPs surge",
    titleAr: "تصعيد هجوم مأرب - تزايد النازحين",
    description: "Houthi offensive on Marib displaces hundreds of thousands",
    descriptionAr: "هجوم الحوثيين على مأرب يشرد مئات الآلاف",
    date: "2021-02-01",
    category: "conflict",
    impact: "negative",
    source: "UN OCHA",
    sectors: ["humanitarian", "economy"]
  },
  {
    title: "Biden administration removes Houthis from FTO list",
    titleAr: "إدارة بايدن تزيل الحوثيين من قائمة المنظمات الإرهابية الأجنبية",
    description: "US reverses Trump-era terrorist designation to facilitate aid",
    descriptionAr: "الولايات المتحدة تلغي تصنيف حقبة ترامب الإرهابي لتسهيل المساعدات",
    date: "2021-02-16",
    category: "sanctions",
    impact: "positive",
    source: "US State Department",
    sectors: ["aid", "trade"]
  },
  {
    title: "Exchange rate reaches 1,000 YER/USD in Aden",
    titleAr: "سعر الصرف يصل إلى 1,000 ريال/دولار في عدن",
    description: "Psychological barrier breached as currency crisis deepens",
    descriptionAr: "كسر الحاجز النفسي مع تعمق أزمة العملة",
    date: "2021-06-01",
    category: "currency",
    impact: "negative",
    source: "CBY",
    sectors: ["currency", "prices", "poverty"]
  },
  {
    title: "New government formed including STC members",
    titleAr: "تشكيل حكومة جديدة تضم أعضاء المجلس الانتقالي",
    description: "Power-sharing cabinet formed under Riyadh Agreement",
    descriptionAr: "تشكيل حكومة تقاسم السلطة بموجب اتفاق الرياض",
    date: "2021-12-18",
    category: "political",
    impact: "positive",
    source: "Yemen Government",
    sectors: ["governance", "economy"]
  },
  
  // 2022 Events
  {
    title: "Presidential Leadership Council formed - Hadi transfers power",
    titleAr: "تشكيل مجلس القيادة الرئاسي - هادي ينقل السلطة",
    description: "8-member council replaces President Hadi to lead government",
    descriptionAr: "مجلس من 8 أعضاء يحل محل الرئيس هادي لقيادة الحكومة",
    date: "2022-04-07",
    category: "political",
    impact: "positive",
    source: "Saudi Press Agency",
    sectors: ["governance", "economy"]
  },
  {
    title: "UN-brokered truce begins",
    titleAr: "بدء الهدنة برعاية الأمم المتحدة",
    description: "First nationwide ceasefire since 2016, includes fuel and flight access",
    descriptionAr: "أول وقف شامل لإطلاق النار منذ 2016، يشمل الوصول للوقود والرحلات الجوية",
    date: "2022-04-02",
    category: "political",
    impact: "positive",
    source: "UN",
    sectors: ["economy", "trade", "energy"]
  },
  {
    title: "Sana'a airport reopens for commercial flights",
    titleAr: "إعادة فتح مطار صنعاء للرحلات التجارية",
    description: "First commercial flights since 2016 under truce agreement",
    descriptionAr: "أول رحلات تجارية منذ 2016 بموجب اتفاق الهدنة",
    date: "2022-05-16",
    category: "infrastructure",
    impact: "positive",
    source: "UN",
    sectors: ["infrastructure", "trade"]
  },
  {
    title: "Houthis halt oil exports from Aden-controlled areas",
    titleAr: "الحوثيون يوقفون صادرات النفط من المناطق الخاضعة لعدن",
    description: "Drone attacks on oil terminals halt exports, devastating government revenue",
    descriptionAr: "هجمات الطائرات المسيرة على محطات النفط توقف الصادرات، مما يدمر إيرادات الحكومة",
    date: "2022-10-21",
    category: "energy",
    impact: "negative",
    source: "Reuters",
    sectors: ["energy", "fiscal", "trade"]
  },
  {
    title: "Truce expires without renewal",
    titleAr: "انتهاء الهدنة دون تجديد",
    description: "Six-month truce ends as parties fail to agree on extension terms",
    descriptionAr: "انتهاء الهدنة التي استمرت ستة أشهر مع فشل الأطراف في الاتفاق على شروط التمديد",
    date: "2022-10-02",
    category: "political",
    impact: "negative",
    source: "UN",
    sectors: ["economy", "trade"]
  },
  {
    title: "Exchange rate reaches 1,200 YER/USD in Aden",
    titleAr: "سعر الصرف يصل إلى 1,200 ريال/دولار في عدن",
    description: "Currency crisis accelerates after oil export halt",
    descriptionAr: "أزمة العملة تتسارع بعد وقف صادرات النفط",
    date: "2022-12-01",
    category: "currency",
    impact: "negative",
    source: "CBY",
    sectors: ["currency", "prices"]
  },
  
  // 2023 Events
  {
    title: "Saudi-Iran diplomatic agreement in Beijing",
    titleAr: "الاتفاق الدبلوماسي السعودي الإيراني في بكين",
    description: "Historic rapprochement raises hopes for Yemen peace",
    descriptionAr: "التقارب التاريخي يرفع الآمال بالسلام في اليمن",
    date: "2023-03-10",
    category: "political",
    impact: "positive",
    source: "Reuters",
    sectors: ["economy", "trade"]
  },
  {
    title: "Saudi delegation visits Sana'a for peace talks",
    titleAr: "وفد سعودي يزور صنعاء لمحادثات السلام",
    description: "First official Saudi visit to Houthi-controlled Sana'a",
    descriptionAr: "أول زيارة سعودية رسمية إلى صنعاء الخاضعة للحوثيين",
    date: "2023-04-08",
    category: "political",
    impact: "positive",
    source: "Saudi Press Agency",
    sectors: ["economy", "governance"]
  },
  {
    title: "FSO Safer oil transfer completed successfully",
    titleAr: "إتمام نقل النفط من صافر بنجاح",
    description: "UN-led operation transfers 1.1M barrels, averting environmental disaster",
    descriptionAr: "عملية بقيادة الأمم المتحدة تنقل 1.1 مليون برميل، متجنبة كارثة بيئية",
    date: "2023-08-11",
    category: "energy",
    impact: "positive",
    source: "UN",
    sectors: ["energy", "environment"]
  },
  {
    title: "Exchange rate stabilizes around 1,500 YER/USD",
    titleAr: "سعر الصرف يستقر حول 1,500 ريال/دولار",
    description: "Relative stability as peace prospects improve",
    descriptionAr: "استقرار نسبي مع تحسن آفاق السلام",
    date: "2023-06-01",
    category: "currency",
    impact: "neutral",
    source: "CBY",
    sectors: ["currency", "prices"]
  },
  {
    title: "UN reports 21.6 million in need of humanitarian assistance",
    titleAr: "الأمم المتحدة تفيد بحاجة 21.6 مليون شخص للمساعدات الإنسانية",
    description: "Two-thirds of population requires aid as crisis persists",
    descriptionAr: "ثلثا السكان يحتاجون للمساعدات مع استمرار الأزمة",
    date: "2023-02-27",
    category: "humanitarian",
    impact: "negative",
    source: "UN OCHA",
    sectors: ["aid", "food", "health"]
  },
  
  // 2024 Events
  {
    title: "Houthis begin Red Sea shipping attacks",
    titleAr: "الحوثيون يبدأون هجمات على الملاحة في البحر الأحمر",
    description: "Attacks on commercial vessels in solidarity with Gaza disrupt global trade",
    descriptionAr: "هجمات على السفن التجارية تضامناً مع غزة تعطل التجارة العالمية",
    date: "2024-01-10",
    category: "conflict",
    impact: "negative",
    source: "Reuters",
    sectors: ["trade", "economy"]
  },
  {
    title: "US and UK launch airstrikes on Houthi positions",
    titleAr: "الولايات المتحدة وبريطانيا تشنان غارات جوية على مواقع الحوثيين",
    description: "Military response to Red Sea attacks targets Houthi military infrastructure",
    descriptionAr: "رد عسكري على هجمات البحر الأحمر يستهدف البنية التحتية العسكرية للحوثيين",
    date: "2024-01-12",
    category: "conflict",
    impact: "negative",
    source: "US DoD",
    sectors: ["economy", "infrastructure"]
  },
  {
    title: "Houthis re-designated as Specially Designated Global Terrorist",
    titleAr: "إعادة تصنيف الحوثيين كإرهابيين عالميين معينين خصيصاً",
    description: "US re-imposes terrorist designation with humanitarian carve-outs",
    descriptionAr: "الولايات المتحدة تعيد فرض التصنيف الإرهابي مع استثناءات إنسانية",
    date: "2024-01-17",
    category: "sanctions",
    impact: "negative",
    source: "US Treasury",
    sectors: ["banking", "trade", "aid"]
  },
  {
    title: "Shipping costs surge 300% due to Red Sea crisis",
    titleAr: "تكاليف الشحن ترتفع 300% بسبب أزمة البحر الأحمر",
    description: "Container shipping rates spike as vessels reroute around Africa",
    descriptionAr: "أسعار شحن الحاويات ترتفع مع تحويل السفن مسارها حول أفريقيا",
    date: "2024-02-01",
    category: "trade",
    impact: "negative",
    source: "Drewry",
    sectors: ["trade", "prices", "food"]
  },
  {
    title: "Exchange rate reaches 1,700 YER/USD in Aden",
    titleAr: "سعر الصرف يصل إلى 1,700 ريال/دولار في عدن",
    description: "Currency depreciates amid Red Sea crisis and reduced aid",
    descriptionAr: "العملة تنخفض وسط أزمة البحر الأحمر وتراجع المساعدات",
    date: "2024-06-01",
    category: "currency",
    impact: "negative",
    source: "CBY",
    sectors: ["currency", "prices"]
  },
  {
    title: "UN humanitarian appeal only 19% funded - lowest ever",
    titleAr: "نداء الأمم المتحدة الإنساني ممول بنسبة 19% فقط - الأدنى على الإطلاق",
    description: "Record funding gap as donor fatigue and competing crises reduce support",
    descriptionAr: "فجوة تمويلية قياسية مع إرهاق المانحين والأزمات المتنافسة تقلل الدعم",
    date: "2024-12-01",
    category: "aid",
    impact: "negative",
    source: "UN OCHA",
    sectors: ["aid", "food", "health"]
  },
  
  // 2025 Events
  {
    title: "CBY Aden launches major exchange market regulation campaign",
    titleAr: "البنك المركزي في عدن يطلق حملة كبرى لتنظيم سوق الصرافة",
    description: "Comprehensive crackdown on unlicensed money exchangers begins",
    descriptionAr: "بدء حملة شاملة على الصرافين غير المرخصين",
    date: "2025-07-01",
    category: "banking",
    impact: "positive",
    source: "CBY Aden",
    sectors: ["banking", "currency"]
  },
  {
    title: "Exchange rate peaks at 2,050 YER/USD - record depreciation",
    titleAr: "سعر الصرف يصل إلى ذروته عند 2,050 ريال/دولار - انخفاض قياسي",
    description: "Rial hits all-time low amid economic crisis",
    descriptionAr: "الريال يصل إلى أدنى مستوى تاريخي وسط الأزمة الاقتصادية",
    date: "2025-07-15",
    category: "currency",
    impact: "negative",
    source: "CBY Aden",
    sectors: ["currency", "prices", "poverty"]
  },
  {
    title: "79 exchange companies have licenses suspended or revoked",
    titleAr: "79 شركة صرافة تم تعليق أو إلغاء تراخيصها",
    description: "CBY Aden completes major regulatory enforcement action",
    descriptionAr: "البنك المركزي في عدن يكمل إجراء تنظيمي كبير",
    date: "2025-12-31",
    category: "banking",
    impact: "positive",
    source: "CBY Aden",
    sectors: ["banking", "currency"]
  },
  {
    title: "IMF Article IV consultation concludes - GDP $19.1 billion",
    titleAr: "اختتام مشاورات المادة الرابعة لصندوق النقد الدولي - الناتج المحلي 19.1 مليار دولار",
    description: "IMF staff visit provides comprehensive economic assessment",
    descriptionAr: "زيارة موظفي صندوق النقد الدولي تقدم تقييماً اقتصادياً شاملاً",
    date: "2025-10-09",
    category: "economy",
    impact: "neutral",
    source: "IMF",
    sectors: ["economy", "fiscal"]
  },
  {
    title: "World Bank Yemen Economic Monitor - Fall 2025",
    titleAr: "مرصد الاقتصاد اليمني للبنك الدولي - خريف 2025",
    description: "Report documents 54% GDP per capita decline since 2015",
    descriptionAr: "التقرير يوثق انخفاض نصيب الفرد من الناتج المحلي بنسبة 54% منذ 2015",
    date: "2025-11-17",
    category: "economy",
    impact: "negative",
    source: "World Bank",
    sectors: ["economy", "poverty"]
  },
  
  // 2026 Events (January)
  {
    title: "STC dissolved - al-Zubaidi flees to UAE",
    titleAr: "حل المجلس الانتقالي الجنوبي - الزبيدي يفر إلى الإمارات",
    description: "Southern Transitional Council dissolved amid political crisis, leader flees",
    descriptionAr: "حل المجلس الانتقالي الجنوبي وسط أزمة سياسية، القائد يفر",
    date: "2026-01-09",
    category: "political",
    impact: "negative",
    source: "Yemen Monitor",
    sectors: ["governance", "economy", "banking"]
  },
  {
    title: "Nation's Shield forces take control of Aden facilities",
    titleAr: "قوات درع الوطن تسيطر على منشآت عدن",
    description: "Military forces loyal to PLC take over key infrastructure",
    descriptionAr: "قوات عسكرية موالية لمجلس القيادة تسيطر على البنية التحتية الرئيسية",
    date: "2026-01-09",
    category: "political",
    impact: "neutral",
    source: "Yemen Monitor",
    sectors: ["governance", "infrastructure"]
  },
  {
    title: "CBY Aden instructed to freeze al-Zubaidi accounts",
    titleAr: "توجيه البنك المركزي في عدن بتجميد حسابات الزبيدي",
    description: "Central bank ordered to freeze accounts of former STC leader",
    descriptionAr: "البنك المركزي يُؤمر بتجميد حسابات رئيس المجلس الانتقالي السابق",
    date: "2026-01-10",
    category: "banking",
    impact: "neutral",
    source: "Yemen Monitor",
    sectors: ["banking", "governance"]
  },
  {
    title: "CBY Aden holds first 2026 board meeting",
    titleAr: "البنك المركزي في عدن يعقد أول اجتماع لمجلس إدارته في 2026",
    description: "Board approves 2025 audit contract and reviews precautionary measures",
    descriptionAr: "المجلس يوافق على عقد تدقيق 2025 ويراجع التدابير الاحترازية",
    date: "2026-01-09",
    category: "banking",
    impact: "positive",
    source: "CBY Aden",
    sectors: ["banking", "governance"]
  },
  {
    title: "Exchange rate stabilizes at 1,890-1,950 YER/USD",
    titleAr: "سعر الصرف يستقر عند 1,890-1,950 ريال/دولار",
    description: "Currency shows relative stability after 2025 volatility",
    descriptionAr: "العملة تظهر استقراراً نسبياً بعد تقلبات 2025",
    date: "2026-01-10",
    category: "currency",
    impact: "neutral",
    source: "CBY Aden",
    sectors: ["currency", "prices"]
  }
];

async function addComprehensiveTimelineEvents() {
  console.log('Adding comprehensive timeline events (2010-2026)...');
  
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    return;
  }
  let added = 0;
  let skipped = 0;
  
  for (const event of comprehensiveEvents) {
    try {
      // Check if event already exists by title and date
      const existing = await db.select()
        .from(economicEvents)
        .where(eq(economicEvents.title, event.title))
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`Skipping existing event: ${event.title}`);
        skipped++;
        continue;
      }
      
      await db.insert(economicEvents).values({
        title: event.title,
        titleAr: event.titleAr,
        description: event.description,
        descriptionAr: event.descriptionAr,
        eventDate: new Date(event.date),
        regimeTag: 'mixed' as const,
        category: event.category,
        impactLevel: event.impact === 'negative' ? 'high' : event.impact === 'positive' ? 'medium' : 'low' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Added: ${event.title} (${event.date})`);
      added++;
    } catch (error) {
      console.error(`Error adding event "${event.title}":`, error);
    }
  }
  
  console.log(`\nCompleted: ${added} events added, ${skipped} skipped`);
  console.log(`Total comprehensive events: ${comprehensiveEvents.length}`);
}

addComprehensiveTimelineEvents()
  .then(() => {
    console.log('Timeline events update complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to add timeline events:', error);
    process.exit(1);
  });
