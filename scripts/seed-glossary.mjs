/**
 * YETO Platform - Comprehensive Economic Glossary Seed Script
 * 
 * This script populates the glossary_terms table with comprehensive
 * economic, financial, and humanitarian terminology relevant to Yemen.
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

const glossaryTerms = [
  // ============================================================================
  // MONETARY POLICY & BANKING
  // ============================================================================
  {
    termEn: "Central Bank of Yemen",
    termAr: "البنك المركزي اليمني",
    definitionEn: "Yemen's central monetary authority, split between Aden (IRG-controlled) and Sana'a (DFA-controlled) since 2016, creating a dual monetary system with different exchange rates and policies.",
    definitionAr: "السلطة النقدية المركزية في اليمن، منقسمة بين عدن (تحت سيطرة الحكومة الشرعية) وصنعاء (تحت سيطرة سلطات الأمر الواقع) منذ 2016، مما أنشأ نظاماً نقدياً مزدوجاً بأسعار صرف وسياسات مختلفة.",
    category: "monetary_policy"
  },
  {
    termEn: "Monetary Policy",
    termAr: "السياسة النقدية",
    definitionEn: "Actions undertaken by a central bank to control money supply and interest rates to achieve macroeconomic objectives like price stability and economic growth.",
    definitionAr: "الإجراءات التي يتخذها البنك المركزي للتحكم في عرض النقود وأسعار الفائدة لتحقيق أهداف اقتصادية كلية مثل استقرار الأسعار والنمو الاقتصادي.",
    category: "monetary_policy"
  },
  {
    termEn: "Money Supply (M2)",
    termAr: "عرض النقود (م2)",
    definitionEn: "A measure of money supply including cash, checking deposits, and easily convertible near-money. In Yemen, M2 growth has been constrained by conflict and banking system fragmentation.",
    definitionAr: "مقياس لعرض النقود يشمل النقد والودائع الجارية والأموال شبه النقدية القابلة للتحويل بسهولة. في اليمن، تقيد نمو م2 بسبب الصراع وتجزئة النظام المصرفي.",
    category: "monetary_policy"
  },
  {
    termEn: "Exchange Rate",
    termAr: "سعر الصرف",
    definitionEn: "The value of one currency expressed in terms of another. Yemen has multiple exchange rates: official CBY rates in Aden and Sana'a, and parallel market rates.",
    definitionAr: "قيمة عملة معبراً عنها بعملة أخرى. لليمن أسعار صرف متعددة: أسعار رسمية للبنك المركزي في عدن وصنعاء، وأسعار السوق الموازي.",
    category: "monetary_policy"
  },
  {
    termEn: "Parallel Market Rate",
    termAr: "سعر السوق الموازي",
    definitionEn: "The exchange rate determined by market forces outside official banking channels. Often differs significantly from official rates, reflecting true supply and demand dynamics.",
    definitionAr: "سعر الصرف المحدد بقوى السوق خارج القنوات المصرفية الرسمية. غالباً ما يختلف بشكل كبير عن الأسعار الرسمية، معكساً ديناميكيات العرض والطلب الحقيقية.",
    category: "monetary_policy"
  },
  {
    termEn: "Currency Depreciation",
    termAr: "انخفاض قيمة العملة",
    definitionEn: "A decline in the value of a currency relative to other currencies. The Yemeni Rial has depreciated significantly since 2015, particularly in IRG-controlled areas.",
    definitionAr: "انخفاض في قيمة العملة مقارنة بالعملات الأخرى. انخفضت قيمة الريال اليمني بشكل كبير منذ 2015، خاصة في المناطق الخاضعة لسيطرة الحكومة الشرعية.",
    category: "monetary_policy"
  },
  {
    termEn: "Foreign Exchange Reserves",
    termAr: "احتياطيات النقد الأجنبي",
    definitionEn: "Foreign currency holdings by a central bank used to back liabilities and influence monetary policy. Yemen's reserves have been severely depleted by the conflict.",
    definitionAr: "حيازات العملات الأجنبية لدى البنك المركزي المستخدمة لدعم الالتزامات والتأثير على السياسة النقدية. استُنزفت احتياطيات اليمن بشدة بسبب الصراع.",
    category: "monetary_policy"
  },
  {
    termEn: "Remittances",
    termAr: "التحويلات المالية",
    definitionEn: "Money sent by Yemeni workers abroad to their families in Yemen. A vital source of foreign currency and household income, estimated at $3-4 billion annually.",
    definitionAr: "الأموال المرسلة من العمال اليمنيين في المهجر إلى أسرهم في اليمن. مصدر حيوي للعملات الأجنبية ودخل الأسر، تقدر بـ 3-4 مليار دولار سنوياً.",
    category: "monetary_policy"
  },
  {
    termEn: "Dollarization",
    termAr: "الدولرة",
    definitionEn: "The adoption of a foreign currency (typically USD) alongside or instead of the domestic currency. Partial dollarization has increased in Yemen due to Rial instability.",
    definitionAr: "اعتماد عملة أجنبية (عادة الدولار الأمريكي) إلى جانب العملة المحلية أو بدلاً منها. ازدادت الدولرة الجزئية في اليمن بسبب عدم استقرار الريال.",
    category: "monetary_policy"
  },

  // ============================================================================
  // FISCAL POLICY & PUBLIC FINANCE
  // ============================================================================
  {
    termEn: "Fiscal Policy",
    termAr: "السياسة المالية",
    definitionEn: "Government decisions on taxation and spending to influence the economy. Yemen's fiscal capacity has been severely constrained by conflict and revenue collapse.",
    definitionAr: "قرارات الحكومة بشأن الضرائب والإنفاق للتأثير على الاقتصاد. تقلصت القدرة المالية لليمن بشدة بسبب الصراع وانهيار الإيرادات.",
    category: "fiscal_policy"
  },
  {
    termEn: "Budget Deficit",
    termAr: "عجز الموازنة",
    definitionEn: "When government expenditures exceed revenues. Both Yemeni authorities face chronic deficits due to collapsed tax collection and ongoing conflict costs.",
    definitionAr: "عندما تتجاوز نفقات الحكومة إيراداتها. تواجه كلتا السلطتين اليمنيتين عجزاً مزمناً بسبب انهيار تحصيل الضرائب وتكاليف الصراع المستمر.",
    category: "fiscal_policy"
  },
  {
    termEn: "Public Debt",
    termAr: "الدين العام",
    definitionEn: "Total amount owed by the government to creditors. Yemen's public debt has increased significantly, with much owed to the central bank (monetary financing).",
    definitionAr: "إجمالي المبالغ المستحقة على الحكومة للدائنين. ارتفع الدين العام لليمن بشكل كبير، مع استحقاق الكثير للبنك المركزي (التمويل النقدي).",
    category: "fiscal_policy"
  },
  {
    termEn: "Revenue Collection",
    termAr: "تحصيل الإيرادات",
    definitionEn: "The process of gathering government income from taxes, customs, and other sources. Yemen's revenue collection has collapsed due to conflict and institutional fragmentation.",
    definitionAr: "عملية جمع دخل الحكومة من الضرائب والجمارك ومصادر أخرى. انهار تحصيل الإيرادات في اليمن بسبب الصراع والتجزئة المؤسسية.",
    category: "fiscal_policy"
  },
  {
    termEn: "Customs Revenue",
    termAr: "إيرادات الجمارك",
    definitionEn: "Government income from import and export duties. A major revenue source contested between Yemeni authorities, particularly at Aden and Hodeidah ports.",
    definitionAr: "دخل الحكومة من رسوم الاستيراد والتصدير. مصدر إيرادات رئيسي متنازع عليه بين السلطات اليمنية، خاصة في ميناءي عدن والحديدة.",
    category: "fiscal_policy"
  },
  {
    termEn: "Oil Revenue",
    termAr: "إيرادات النفط",
    definitionEn: "Government income from petroleum exports and production. Historically Yemen's main revenue source, now severely reduced due to conflict damage to infrastructure.",
    definitionAr: "دخل الحكومة من صادرات وإنتاج النفط. تاريخياً المصدر الرئيسي لإيرادات اليمن، الآن منخفض بشدة بسبب أضرار الصراع على البنية التحتية.",
    category: "fiscal_policy"
  },
  {
    termEn: "Salary Payments",
    termAr: "صرف الرواتب",
    definitionEn: "Government disbursement of wages to public sector employees. Irregular salary payments have been a major crisis, with many civil servants unpaid for extended periods.",
    definitionAr: "صرف الحكومة للأجور لموظفي القطاع العام. كانت عدم انتظام صرف الرواتب أزمة كبرى، مع عدم حصول كثير من الموظفين على رواتبهم لفترات طويلة.",
    category: "fiscal_policy"
  },

  // ============================================================================
  // TRADE & COMMERCE
  // ============================================================================
  {
    termEn: "Balance of Trade",
    termAr: "الميزان التجاري",
    definitionEn: "The difference between a country's exports and imports. Yemen has a chronic trade deficit, importing most essential goods including food and fuel.",
    definitionAr: "الفرق بين صادرات البلد ووارداته. لليمن عجز تجاري مزمن، حيث يستورد معظم السلع الأساسية بما في ذلك الغذاء والوقود.",
    category: "trade"
  },
  {
    termEn: "Import Dependency",
    termAr: "الاعتماد على الواردات",
    definitionEn: "Reliance on foreign goods for essential needs. Yemen imports approximately 90% of its food and nearly all fuel, making it highly vulnerable to supply disruptions.",
    definitionAr: "الاعتماد على السلع الأجنبية للاحتياجات الأساسية. يستورد اليمن حوالي 90% من غذائه وجميع الوقود تقريباً، مما يجعله شديد التعرض لاضطرابات الإمداد.",
    category: "trade"
  },
  {
    termEn: "Port Capacity",
    termAr: "الطاقة الاستيعابية للموانئ",
    definitionEn: "The volume of goods a port can handle. Hodeidah and Aden are Yemen's main ports, with capacity constraints affecting import flows.",
    definitionAr: "حجم البضائع التي يمكن للميناء التعامل معها. الحديدة وعدن هما الميناءان الرئيسيان في اليمن، مع قيود على الطاقة تؤثر على تدفقات الواردات.",
    category: "trade"
  },
  {
    termEn: "Letter of Credit",
    termAr: "خطاب الاعتماد",
    definitionEn: "A bank guarantee for international trade payments. Access to LCs has been constrained for Yemeni importers due to banking system fragmentation and sanctions concerns.",
    definitionAr: "ضمان مصرفي لمدفوعات التجارة الدولية. تقيد وصول المستوردين اليمنيين إلى خطابات الاعتماد بسبب تجزئة النظام المصرفي ومخاوف العقوبات.",
    category: "trade"
  },
  {
    termEn: "Fuel Imports",
    termAr: "واردات الوقود",
    definitionEn: "Petroleum products brought into Yemen from abroad. Critical for transportation, electricity generation, and water pumping. Subject to inspection delays and access restrictions.",
    definitionAr: "المنتجات البترولية المستوردة إلى اليمن من الخارج. حيوية للنقل وتوليد الكهرباء وضخ المياه. تخضع لتأخيرات التفتيش وقيود الوصول.",
    category: "trade"
  },

  // ============================================================================
  // INFLATION & PRICES
  // ============================================================================
  {
    termEn: "Consumer Price Index (CPI)",
    termAr: "مؤشر أسعار المستهلك",
    definitionEn: "A measure tracking changes in the price level of a basket of consumer goods and services. Yemen's CPI has shown significant inflation, particularly for food items.",
    definitionAr: "مقياس يتتبع التغيرات في مستوى أسعار سلة من السلع والخدمات الاستهلاكية. أظهر مؤشر أسعار المستهلك في اليمن تضخماً كبيراً، خاصة للمواد الغذائية.",
    category: "inflation"
  },
  {
    termEn: "Inflation Rate",
    termAr: "معدل التضخم",
    definitionEn: "The percentage increase in the general price level over time. Yemen has experienced high inflation due to currency depreciation, supply disruptions, and conflict.",
    definitionAr: "النسبة المئوية للزيادة في المستوى العام للأسعار بمرور الوقت. شهد اليمن تضخماً مرتفعاً بسبب انخفاض قيمة العملة واضطرابات الإمداد والصراع.",
    category: "inflation"
  },
  {
    termEn: "Food Price Inflation",
    termAr: "تضخم أسعار الغذاء",
    definitionEn: "The rate of increase in food prices. Particularly severe in Yemen due to import dependency, currency depreciation, and supply chain disruptions.",
    definitionAr: "معدل الزيادة في أسعار الغذاء. شديد بشكل خاص في اليمن بسبب الاعتماد على الواردات وانخفاض قيمة العملة واضطرابات سلسلة الإمداد.",
    category: "inflation"
  },
  {
    termEn: "Purchasing Power",
    termAr: "القوة الشرائية",
    definitionEn: "The quantity of goods and services that can be purchased with a unit of currency. Yemeni households' purchasing power has declined dramatically since 2015.",
    definitionAr: "كمية السلع والخدمات التي يمكن شراؤها بوحدة من العملة. انخفضت القوة الشرائية للأسر اليمنية بشكل كبير منذ 2015.",
    category: "inflation"
  },

  // ============================================================================
  // FOOD SECURITY & HUMANITARIAN
  // ============================================================================
  {
    termEn: "Integrated Food Security Phase Classification (IPC)",
    termAr: "التصنيف المرحلي المتكامل للأمن الغذائي",
    definitionEn: "The global standard for food security analysis. Phase 3+ indicates acute food insecurity. Yemen has millions in IPC Phase 3 (Crisis) and Phase 4 (Emergency).",
    definitionAr: "المعيار العالمي لتحليل الأمن الغذائي. المرحلة 3+ تشير إلى انعدام الأمن الغذائي الحاد. لدى اليمن ملايين في المرحلة 3 (أزمة) والمرحلة 4 (طوارئ).",
    category: "food_security"
  },
  {
    termEn: "Food Insecurity",
    termAr: "انعدام الأمن الغذائي",
    definitionEn: "Lack of reliable access to sufficient affordable, nutritious food. Over 17 million Yemenis face food insecurity, making it one of the world's worst humanitarian crises.",
    definitionAr: "عدم الوصول الموثوق إلى غذاء كافٍ وبأسعار معقولة ومغذٍ. يواجه أكثر من 17 مليون يمني انعدام الأمن الغذائي، مما يجعلها واحدة من أسوأ الأزمات الإنسانية في العالم.",
    category: "food_security"
  },
  {
    termEn: "Acute Malnutrition",
    termAr: "سوء التغذية الحاد",
    definitionEn: "A life-threatening condition caused by insufficient nutrient intake. Over 2 million Yemeni children suffer from acute malnutrition, with hundreds of thousands in severe condition.",
    definitionAr: "حالة مهددة للحياة ناجمة عن عدم كفاية تناول المغذيات. يعاني أكثر من 2 مليون طفل يمني من سوء التغذية الحاد، مع مئات الآلاف في حالة شديدة.",
    category: "food_security"
  },
  {
    termEn: "Humanitarian Response Plan (HRP)",
    termAr: "خطة الاستجابة الإنسانية",
    definitionEn: "The UN-coordinated annual humanitarian funding appeal for Yemen operations. The Yemen HRP is one of the largest globally, requiring billions of dollars annually.",
    definitionAr: "نداء التمويل الإنساني السنوي المنسق من الأمم المتحدة لعمليات اليمن. خطة الاستجابة الإنسانية لليمن من أكبر الخطط عالمياً، تتطلب مليارات الدولارات سنوياً.",
    category: "food_security"
  },
  {
    termEn: "Food Basket",
    termAr: "السلة الغذائية",
    definitionEn: "A standardized set of food items used to measure food costs and affordability. The Minimum Food Basket (MFB) cost is tracked monthly across Yemen's governorates.",
    definitionAr: "مجموعة موحدة من المواد الغذائية تستخدم لقياس تكاليف الغذاء والقدرة على تحمل تكاليفه. يتم تتبع تكلفة الحد الأدنى للسلة الغذائية شهرياً عبر محافظات اليمن.",
    category: "food_security"
  },

  // ============================================================================
  // POLITICAL & INSTITUTIONAL
  // ============================================================================
  {
    termEn: "Internationally Recognized Government (IRG)",
    termAr: "الحكومة المعترف بها دولياً",
    definitionEn: "The UN-recognized Yemeni government headquartered in Aden. Controls southern and eastern regions, recognized by the international community and coalition partners.",
    definitionAr: "الحكومة اليمنية المعترف بها من الأمم المتحدة ومقرها عدن. تسيطر على المناطق الجنوبية والشرقية، معترف بها من المجتمع الدولي وشركاء التحالف.",
    category: "political"
  },
  {
    termEn: "De Facto Authorities (DFA)",
    termAr: "سلطات الأمر الواقع",
    definitionEn: "The authorities controlling northern Yemen including Sana'a. Also referred to as Ansar Allah or Houthis. Control the majority of Yemen's population.",
    definitionAr: "السلطات التي تسيطر على شمال اليمن بما في ذلك صنعاء. يشار إليها أيضاً بأنصار الله أو الحوثيين. تسيطر على غالبية سكان اليمن.",
    category: "political"
  },
  {
    termEn: "Presidential Leadership Council (PLC)",
    termAr: "مجلس القيادة الرئاسي",
    definitionEn: "The eight-member council established in April 2022 to lead the IRG, replacing former President Hadi. Includes representatives from various political and military factions.",
    definitionAr: "المجلس المكون من ثمانية أعضاء الذي تأسس في أبريل 2022 لقيادة الحكومة الشرعية، ليحل محل الرئيس السابق هادي. يضم ممثلين من مختلف الفصائل السياسية والعسكرية.",
    category: "political"
  },
  {
    termEn: "Southern Transitional Council (STC)",
    termAr: "المجلس الانتقالي الجنوبي",
    definitionEn: "A separatist political organization seeking southern independence. Controls Aden and parts of southern Yemen, represented in the PLC since 2022.",
    definitionAr: "منظمة سياسية انفصالية تسعى لاستقلال الجنوب. تسيطر على عدن وأجزاء من جنوب اليمن، ممثلة في مجلس القيادة الرئاسي منذ 2022.",
    category: "political"
  },

  // ============================================================================
  // ECONOMIC INDICATORS
  // ============================================================================
  {
    termEn: "Gross Domestic Product (GDP)",
    termAr: "الناتج المحلي الإجمالي",
    definitionEn: "The total monetary value of all goods and services produced within a country. Yemen's GDP has contracted by approximately 50% since 2015 due to conflict.",
    definitionAr: "القيمة النقدية الإجمالية لجميع السلع والخدمات المنتجة داخل البلد. انكمش الناتج المحلي الإجمالي لليمن بنحو 50% منذ 2015 بسبب الصراع.",
    category: "economic_indicators"
  },
  {
    termEn: "GDP Per Capita",
    termAr: "نصيب الفرد من الناتج المحلي",
    definitionEn: "GDP divided by total population, indicating average economic output per person. Yemen's GDP per capita has fallen to among the lowest in the world.",
    definitionAr: "الناتج المحلي الإجمالي مقسوماً على إجمالي السكان، يشير إلى متوسط الناتج الاقتصادي للفرد. انخفض نصيب الفرد من الناتج المحلي في اليمن إلى من بين الأدنى في العالم.",
    category: "economic_indicators"
  },
  {
    termEn: "Poverty Rate",
    termAr: "معدل الفقر",
    definitionEn: "The percentage of population living below the poverty line. Yemen's poverty rate has increased dramatically, with over 80% now living in poverty.",
    definitionAr: "النسبة المئوية للسكان الذين يعيشون تحت خط الفقر. ارتفع معدل الفقر في اليمن بشكل كبير، مع أكثر من 80% يعيشون الآن في فقر.",
    category: "economic_indicators"
  },
  {
    termEn: "Unemployment Rate",
    termAr: "معدل البطالة",
    definitionEn: "The percentage of the labor force without employment. Yemen's unemployment has surged due to economic collapse, with youth unemployment particularly severe.",
    definitionAr: "النسبة المئوية للقوى العاملة بدون عمل. ارتفعت البطالة في اليمن بسبب الانهيار الاقتصادي، مع شدة خاصة في بطالة الشباب.",
    category: "economic_indicators"
  },

  // ============================================================================
  // ENERGY SECTOR
  // ============================================================================
  {
    termEn: "Fuel Subsidy",
    termAr: "دعم الوقود",
    definitionEn: "Government financial support to reduce fuel prices for consumers. Yemen historically had fuel subsidies, now largely eliminated due to fiscal constraints.",
    definitionAr: "الدعم المالي الحكومي لخفض أسعار الوقود للمستهلكين. كان لدى اليمن تاريخياً دعم للوقود، أُلغي الآن إلى حد كبير بسبب القيود المالية.",
    category: "energy"
  },
  {
    termEn: "Electricity Access",
    termAr: "الوصول إلى الكهرباء",
    definitionEn: "The availability of electrical power to households and businesses. Yemen's electricity grid has largely collapsed, with most relying on private generators or solar.",
    definitionAr: "توفر الطاقة الكهربائية للأسر والشركات. انهارت شبكة الكهرباء في اليمن إلى حد كبير، مع اعتماد معظمهم على المولدات الخاصة أو الطاقة الشمسية.",
    category: "energy"
  },
  {
    termEn: "Solar Energy",
    termAr: "الطاقة الشمسية",
    definitionEn: "Power generated from sunlight. Solar panels have become widespread in Yemen as an alternative to unreliable grid electricity, representing a significant adaptation.",
    definitionAr: "الطاقة المولدة من ضوء الشمس. انتشرت الألواح الشمسية على نطاق واسع في اليمن كبديل للكهرباء غير الموثوقة من الشبكة، مما يمثل تكيفاً كبيراً.",
    category: "energy"
  },

  // ============================================================================
  // DATA QUALITY & METHODOLOGY
  // ============================================================================
  {
    termEn: "Confidence Rating",
    termAr: "تصنيف الثقة",
    definitionEn: "YETO's data quality indicator: A (highest confidence, official verified data), B (reliable estimates), C (proxy indicators), D (expert estimates with high uncertainty).",
    definitionAr: "مؤشر جودة البيانات في يتو: أ (أعلى ثقة، بيانات رسمية موثقة)، ب (تقديرات موثوقة)، ج (مؤشرات بديلة)، د (تقديرات خبراء مع عدم يقين عالٍ).",
    category: "methodology"
  },
  {
    termEn: "Data Provenance",
    termAr: "مصدر البيانات",
    definitionEn: "The documented origin and history of data, including source, collection method, and any transformations applied. Essential for transparency and reproducibility.",
    definitionAr: "الأصل والتاريخ الموثق للبيانات، بما في ذلك المصدر وطريقة الجمع وأي تحويلات مطبقة. ضروري للشفافية وقابلية التكرار.",
    category: "methodology"
  },
  {
    termEn: "Regime Tag",
    termAr: "علامة النظام",
    definitionEn: "YETO's classification indicating which authority's jurisdiction data applies to: Aden (IRG), Sana'a (DFA), Mixed, or Unknown. Prevents inappropriate data merging.",
    definitionAr: "تصنيف يتو الذي يشير إلى نطاق سلطة أي جهة تنطبق عليها البيانات: عدن (الحكومة الشرعية)، صنعاء (سلطات الأمر الواقع)، مختلط، أو غير معروف. يمنع دمج البيانات غير المناسب.",
    category: "methodology"
  },
  {
    termEn: "Split-System Principle",
    termAr: "مبدأ النظام المنقسم",
    definitionEn: "YETO's core methodology recognizing Yemen's dual governance reality. Data from different authorities is never merged without explicit consent and clear labeling.",
    definitionAr: "منهجية يتو الأساسية التي تعترف بواقع الحوكمة المزدوجة في اليمن. لا يتم دمج البيانات من سلطات مختلفة أبداً دون موافقة صريحة ووسم واضح.",
    category: "methodology"
  },

  // ============================================================================
  // ORGANIZATIONS & STAKEHOLDERS
  // ============================================================================
  {
    termEn: "World Bank",
    termAr: "البنك الدولي",
    definitionEn: "International financial institution providing loans and grants for development. Major source of Yemen economic data through the Yemen Economic Monitor and other publications.",
    definitionAr: "مؤسسة مالية دولية تقدم قروضاً ومنحاً للتنمية. مصدر رئيسي لبيانات الاقتصاد اليمني من خلال مرصد الاقتصاد اليمني ومنشورات أخرى.",
    category: "organizations"
  },
  {
    termEn: "International Monetary Fund (IMF)",
    termAr: "صندوق النقد الدولي",
    definitionEn: "International organization promoting global monetary cooperation. Provides macroeconomic assessments and technical assistance, though Yemen program has been suspended.",
    definitionAr: "منظمة دولية تعزز التعاون النقدي العالمي. تقدم تقييمات اقتصادية كلية ومساعدة فنية، رغم تعليق برنامج اليمن.",
    category: "organizations"
  },
  {
    termEn: "United Nations Development Programme (UNDP)",
    termAr: "برنامج الأمم المتحدة الإنمائي",
    definitionEn: "UN agency focused on development assistance. Implements various programs in Yemen including livelihoods support and institutional capacity building.",
    definitionAr: "وكالة أممية تركز على المساعدة الإنمائية. تنفذ برامج متنوعة في اليمن بما في ذلك دعم سبل العيش وبناء القدرات المؤسسية.",
    category: "organizations"
  },
  {
    termEn: "World Food Programme (WFP)",
    termAr: "برنامج الغذاء العالمي",
    definitionEn: "UN agency providing food assistance. The largest humanitarian actor in Yemen, providing food aid to millions of food-insecure Yemenis monthly.",
    definitionAr: "وكالة أممية تقدم المساعدات الغذائية. أكبر فاعل إنساني في اليمن، تقدم مساعدات غذائية لملايين اليمنيين الذين يعانون من انعدام الأمن الغذائي شهرياً.",
    category: "organizations"
  },
  {
    termEn: "OCHA",
    termAr: "مكتب تنسيق الشؤون الإنسانية",
    definitionEn: "UN Office for the Coordination of Humanitarian Affairs. Coordinates humanitarian response in Yemen and publishes regular situation reports and funding appeals.",
    definitionAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية. ينسق الاستجابة الإنسانية في اليمن وينشر تقارير الوضع ونداءات التمويل بانتظام.",
    category: "organizations"
  },
  {
    termEn: "HSA Group",
    termAr: "مجموعة هائل سعيد أنعم",
    definitionEn: "Hayel Saeed Anam Group - Yemen's largest business conglomerate with interests in food, manufacturing, banking, and logistics. Major importer and employer.",
    definitionAr: "مجموعة هائل سعيد أنعم - أكبر تكتل تجاري في اليمن مع مصالح في الغذاء والتصنيع والمصارف والخدمات اللوجستية. مستورد وصاحب عمل رئيسي.",
    category: "organizations"
  }
];

async function seedGlossary() {
  console.log('Starting glossary seed...');
  console.log(`Total terms to insert: ${glossaryTerms.length}`);
  
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // First, clear existing terms to avoid duplicates
    console.log('Clearing existing glossary terms...');
    await connection.execute('DELETE FROM glossary_terms');
    
    // Insert all terms
    console.log('Inserting new glossary terms...');
    
    for (const term of glossaryTerms) {
      await connection.execute(
        `INSERT INTO glossary_terms (termEn, termAr, definitionEn, definitionAr, category, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [term.termEn, term.termAr, term.definitionEn, term.definitionAr, term.category]
      );
    }
    
    // Verify insertion
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM glossary_terms');
    console.log(`Successfully inserted ${rows[0].count} glossary terms`);
    
    // Show category breakdown
    const [categories] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM glossary_terms GROUP BY category ORDER BY count DESC'
    );
    console.log('\\nCategory breakdown:');
    categories.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count} terms`);
    });
    
  } catch (error) {
    console.error('Error seeding glossary:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedGlossary().catch(console.error);
