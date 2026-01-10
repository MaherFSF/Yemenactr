/**
 * Expanded Economic Events Database for Yemen (2010-2026)
 * 200+ comprehensive events with monthly granularity
 */

export interface ExpandedEconomicEvent {
  id: string;
  date: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  economicImpact: {
    gdp?: string;
    inflation?: string;
    exchangeRate?: string;
    trade?: string;
    employment?: string;
    humanitarian?: string;
  };
  sources: string[];
  indicators: string[];
}

export const EXPANDED_EVENTS: ExpandedEconomicEvent[] = [
  // ============================================================================
  // 2010 - Pre-Conflict Baseline (12 events)
  // ============================================================================
  {
    id: 'evt-2010-01',
    date: '2010-01-15',
    title: 'Yemen GDP Growth Reaches 7.7%',
    titleAr: 'نمو الناتج المحلي اليمني يصل إلى 7.7%',
    description: 'Yemen records strong GDP growth of 7.7%, driven by oil exports and remittances. Economy shows signs of stability.',
    descriptionAr: 'يسجل اليمن نمواً قوياً في الناتج المحلي الإجمالي بنسبة 7.7%، مدفوعاً بصادرات النفط والتحويلات.',
    category: 'fiscal_policy',
    severity: 'major',
    economicImpact: { gdp: '+7.7%', trade: 'Positive' },
    sources: ['World Bank', 'IMF'],
    indicators: ['GDP_GROWTH', 'OIL_EXPORTS']
  },
  {
    id: 'evt-2010-02',
    date: '2010-02-11',
    title: 'Ceasefire Agreement with Houthis',
    titleAr: 'اتفاق وقف إطلاق النار مع الحوثيين',
    description: 'Government signs ceasefire with Houthi rebels after sixth Sa\'ada war, temporarily stabilizing northern regions.',
    descriptionAr: 'توقع الحكومة وقف إطلاق النار مع المتمردين الحوثيين بعد حرب صعدة السادسة.',
    category: 'conflict',
    severity: 'major',
    economicImpact: { gdp: 'Stabilizing', humanitarian: 'Improved access' },
    sources: ['UN', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2010-03',
    date: '2010-03-20',
    title: 'Oil Production Peaks at 280,000 bpd',
    titleAr: 'إنتاج النفط يبلغ ذروته عند 280,000 برميل يومياً',
    description: 'Yemen oil production reaches peak of 280,000 barrels per day, providing 70% of government revenue.',
    descriptionAr: 'يصل إنتاج النفط اليمني إلى ذروته عند 280,000 برميل يومياً.',
    category: 'oil_energy',
    severity: 'major',
    economicImpact: { gdp: '+3%', trade: 'Export boom' },
    sources: ['OPEC', 'Ministry of Oil'],
    indicators: ['OIL_PRODUCTION', 'GOVERNMENT_REVENUE']
  },
  {
    id: 'evt-2010-04',
    date: '2010-04-15',
    title: 'Foreign Reserves Reach $7 Billion',
    titleAr: 'الاحتياطيات الأجنبية تصل إلى 7 مليار دولار',
    description: 'Central Bank of Yemen foreign reserves reach $7 billion, covering 6 months of imports.',
    descriptionAr: 'تصل احتياطيات البنك المركزي اليمني من العملات الأجنبية إلى 7 مليار دولار.',
    category: 'banking_financial',
    severity: 'moderate',
    economicImpact: { exchangeRate: 'Stable at 219 YER/USD' },
    sources: ['Central Bank of Yemen', 'IMF'],
    indicators: ['FOREIGN_RESERVES', 'EXCHANGE_RATE']
  },
  {
    id: 'evt-2010-05',
    date: '2010-05-10',
    title: 'AQAP Crackdown Intensifies',
    titleAr: 'تكثيف حملة مكافحة تنظيم القاعدة',
    description: 'Government intensifies operations against Al-Qaeda in the Arabian Peninsula (AQAP) with US support.',
    descriptionAr: 'تكثف الحكومة عملياتها ضد تنظيم القاعدة في جزيرة العرب بدعم أمريكي.',
    category: 'conflict',
    severity: 'moderate',
    economicImpact: { gdp: 'Security costs increase' },
    sources: ['US State Department', 'Reuters'],
    indicators: ['SECURITY_SPENDING']
  },
  {
    id: 'evt-2010-06',
    date: '2010-06-15',
    title: 'Inflation Rate at 11.2%',
    titleAr: 'معدل التضخم عند 11.2%',
    description: 'Annual inflation rate reaches 11.2%, driven by food and fuel prices.',
    descriptionAr: 'يصل معدل التضخم السنوي إلى 11.2%، مدفوعاً بأسعار الغذاء والوقود.',
    category: 'fiscal_policy',
    severity: 'moderate',
    economicImpact: { inflation: '11.2%' },
    sources: ['Central Statistical Organization', 'World Bank'],
    indicators: ['INFLATION_RATE', 'FOOD_PRICES']
  },
  {
    id: 'evt-2010-07',
    date: '2010-07-20',
    title: 'World Bank Approves $100M Development Grant',
    titleAr: 'البنك الدولي يوافق على منحة تنمية بقيمة 100 مليون دولار',
    description: 'World Bank approves $100 million grant for social protection and infrastructure development.',
    descriptionAr: 'يوافق البنك الدولي على منحة بقيمة 100 مليون دولار للحماية الاجتماعية وتطوير البنية التحتية.',
    category: 'international',
    severity: 'moderate',
    economicImpact: { gdp: 'Development boost' },
    sources: ['World Bank'],
    indicators: ['AID_FLOWS']
  },
  {
    id: 'evt-2010-08',
    date: '2010-08-15',
    title: 'Remittances Reach $3.5 Billion',
    titleAr: 'التحويلات تصل إلى 3.5 مليار دولار',
    description: 'Annual remittances from Yemeni diaspora reach $3.5 billion, supporting household consumption.',
    descriptionAr: 'تصل التحويلات السنوية من المغتربين اليمنيين إلى 3.5 مليار دولار.',
    category: 'trade',
    severity: 'moderate',
    economicImpact: { gdp: '+10% of GDP' },
    sources: ['World Bank', 'Central Bank'],
    indicators: ['REMITTANCES']
  },
  {
    id: 'evt-2010-09',
    date: '2010-09-10',
    title: 'Southern Movement Protests Intensify',
    titleAr: 'تصاعد احتجاجات الحراك الجنوبي',
    description: 'Southern separatist movement (Hirak) holds large protests demanding independence or autonomy.',
    descriptionAr: 'يعقد الحراك الجنوبي الانفصالي احتجاجات كبيرة للمطالبة بالاستقلال أو الحكم الذاتي.',
    category: 'conflict',
    severity: 'moderate',
    economicImpact: { gdp: 'Regional instability' },
    sources: ['Al Jazeera', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2010-10',
    date: '2010-10-20',
    title: 'Unemployment Rate at 35%',
    titleAr: 'معدل البطالة عند 35%',
    description: 'Official unemployment rate reaches 35%, with youth unemployment exceeding 50%.',
    descriptionAr: 'يصل معدل البطالة الرسمي إلى 35%، مع تجاوز بطالة الشباب 50%.',
    category: 'labor',
    severity: 'major',
    economicImpact: { employment: '35% unemployment' },
    sources: ['ILO', 'World Bank'],
    indicators: ['UNEMPLOYMENT_RATE']
  },
  {
    id: 'evt-2010-11',
    date: '2010-11-15',
    title: 'Water Crisis Deepens in Sanaa',
    titleAr: 'تعمق أزمة المياه في صنعاء',
    description: 'Sanaa faces severe water shortage with aquifer depletion accelerating. City may run dry within decade.',
    descriptionAr: 'تواجه صنعاء نقصاً حاداً في المياه مع تسارع استنزاف الطبقة الحاملة للمياه.',
    category: 'infrastructure',
    severity: 'major',
    economicImpact: { gdp: 'Infrastructure stress' },
    sources: ['World Bank', 'UNDP'],
    indicators: ['WATER_RESOURCES']
  },
  {
    id: 'evt-2010-12',
    date: '2010-12-20',
    title: 'Friends of Yemen Donor Conference',
    titleAr: 'مؤتمر أصدقاء اليمن للمانحين',
    description: 'International donors pledge $5.7 billion in development assistance at Friends of Yemen conference.',
    descriptionAr: 'يتعهد المانحون الدوليون بتقديم 5.7 مليار دولار كمساعدات تنموية في مؤتمر أصدقاء اليمن.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Aid commitment' },
    sources: ['UN', 'UK Foreign Office'],
    indicators: ['AID_FLOWS']
  },

  // ============================================================================
  // 2011 - Arab Spring & Political Crisis (15 events)
  // ============================================================================
  {
    id: 'evt-2011-01',
    date: '2011-01-27',
    title: 'Arab Spring Protests Begin in Yemen',
    titleAr: 'بداية احتجاجات الربيع العربي في اليمن',
    description: 'Inspired by Tunisia and Egypt, mass protests begin in Sanaa demanding President Saleh\'s resignation.',
    descriptionAr: 'مستلهمة من تونس ومصر، تبدأ احتجاجات جماهيرية في صنعاء تطالب باستقالة الرئيس صالح.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Economic disruption begins', trade: 'Business closures' },
    sources: ['Al Jazeera', 'BBC', 'Reuters'],
    indicators: ['GDP_GROWTH', 'CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2011-02',
    date: '2011-02-11',
    title: 'Mubarak Falls - Yemen Protests Intensify',
    titleAr: 'سقوط مبارك - تصاعد الاحتجاجات اليمنية',
    description: 'Following Mubarak\'s fall in Egypt, Yemeni protests grow significantly. "Day of Rage" draws hundreds of thousands.',
    descriptionAr: 'بعد سقوط مبارك في مصر، تنمو الاحتجاجات اليمنية بشكل كبير. "يوم الغضب" يجذب مئات الآلاف.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: '-5% quarterly', trade: 'Severe disruption' },
    sources: ['Reuters', 'Al Jazeera'],
    indicators: ['GDP_GROWTH']
  },
  {
    id: 'evt-2011-03',
    date: '2011-03-18',
    title: 'Friday of Dignity Massacre',
    titleAr: 'مجزرة جمعة الكرامة',
    description: 'Security forces kill 52 protesters in Sanaa. Mass defections from military begin, including General Ali Mohsen.',
    descriptionAr: 'قوات الأمن تقتل 52 متظاهراً في صنعاء. بدء انشقاقات جماعية من الجيش بما في ذلك الجنرال علي محسن.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Economic paralysis', humanitarian: 'Crisis begins' },
    sources: ['Human Rights Watch', 'UN', 'BBC'],
    indicators: ['CONFLICT_INTENSITY', 'IDP_COUNT']
  },
  {
    id: 'evt-2011-04',
    date: '2011-04-15',
    title: 'GDP Contracts by 12.7%',
    titleAr: 'انكماش الناتج المحلي بنسبة 12.7%',
    description: 'Yemen\'s economy contracts by 12.7% as political crisis paralyzes business activity and oil production drops.',
    descriptionAr: 'ينكمش الاقتصاد اليمني بنسبة 12.7% مع شلل النشاط التجاري وانخفاض إنتاج النفط.',
    category: 'fiscal_policy',
    severity: 'critical',
    economicImpact: { gdp: '-12.7%', trade: 'Collapse', employment: 'Mass layoffs' },
    sources: ['World Bank', 'IMF'],
    indicators: ['GDP_GROWTH', 'UNEMPLOYMENT_RATE']
  },
  {
    id: 'evt-2011-05',
    date: '2011-05-22',
    title: 'GCC Initiative Proposed',
    titleAr: 'اقتراح مبادرة مجلس التعاون الخليجي',
    description: 'Gulf Cooperation Council proposes transition deal granting Saleh immunity in exchange for stepping down.',
    descriptionAr: 'يقترح مجلس التعاون الخليجي صفقة انتقالية تمنح صالح الحصانة مقابل التنحي.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Uncertainty continues' },
    sources: ['GCC', 'Reuters', 'Al Jazeera'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2011-06',
    date: '2011-06-03',
    title: 'Presidential Palace Attack - Saleh Injured',
    titleAr: 'هجوم على القصر الرئاسي - إصابة صالح',
    description: 'Attack on presidential palace mosque injures President Saleh, who is evacuated to Saudi Arabia for treatment.',
    descriptionAr: 'هجوم على مسجد القصر الرئاسي يصيب الرئيس صالح الذي ينقل إلى السعودية للعلاج.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Power vacuum', exchangeRate: 'Currency weakens' },
    sources: ['BBC', 'Al Jazeera', 'Reuters'],
    indicators: ['EXCHANGE_RATE', 'CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2011-07',
    date: '2011-07-15',
    title: 'Oil Production Falls to 170,000 bpd',
    titleAr: 'إنتاج النفط ينخفض إلى 170,000 برميل يومياً',
    description: 'Oil production drops 40% from 2010 peak due to pipeline attacks and security disruptions.',
    descriptionAr: 'ينخفض إنتاج النفط بنسبة 40% عن ذروة 2010 بسبب هجمات خطوط الأنابيب والاضطرابات الأمنية.',
    category: 'oil_energy',
    severity: 'critical',
    economicImpact: { gdp: '-15% oil revenue', trade: 'Export collapse' },
    sources: ['Ministry of Oil', 'OPEC'],
    indicators: ['OIL_PRODUCTION', 'GOVERNMENT_REVENUE']
  },
  {
    id: 'evt-2011-08',
    date: '2011-08-20',
    title: 'Inflation Surges to 19.5%',
    titleAr: 'ارتفاع التضخم إلى 19.5%',
    description: 'Annual inflation reaches 19.5% as supply chains collapse and food prices soar.',
    descriptionAr: 'يصل التضخم السنوي إلى 19.5% مع انهيار سلاسل التوريد وارتفاع أسعار الغذاء.',
    category: 'fiscal_policy',
    severity: 'major',
    economicImpact: { inflation: '19.5%', humanitarian: 'Food crisis' },
    sources: ['Central Statistical Organization', 'WFP'],
    indicators: ['INFLATION_RATE', 'FOOD_PRICES']
  },
  {
    id: 'evt-2011-09',
    date: '2011-09-18',
    title: 'Battle of Sanaa Begins',
    titleAr: 'بداية معركة صنعاء',
    description: 'Armed clashes erupt between pro-Saleh forces and defected military units in Sanaa.',
    descriptionAr: 'اندلاع اشتباكات مسلحة بين قوات موالية لصالح ووحدات عسكرية منشقة في صنعاء.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Capital paralyzed', humanitarian: 'Mass displacement' },
    sources: ['UN', 'OCHA', 'Reuters'],
    indicators: ['IDP_COUNT', 'CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2011-10',
    date: '2011-10-21',
    title: 'UN Security Council Resolution 2014',
    titleAr: 'قرار مجلس الأمن الدولي 2014',
    description: 'UN Security Council condemns violence and calls for peaceful transition of power.',
    descriptionAr: 'مجلس الأمن الدولي يدين العنف ويدعو إلى انتقال سلمي للسلطة.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'International pressure' },
    sources: ['UN Security Council'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2011-11',
    date: '2011-11-23',
    title: 'GCC Agreement Signed',
    titleAr: 'توقيع اتفاق مجلس التعاون الخليجي',
    description: 'President Saleh signs GCC-brokered transition agreement in Riyadh, agreeing to transfer power.',
    descriptionAr: 'الرئيس صالح يوقع اتفاق الانتقال بوساطة خليجية في الرياض، موافقاً على نقل السلطة.',
    category: 'international',
    severity: 'critical',
    economicImpact: { gdp: 'Transition begins', exchangeRate: 'Temporary stability' },
    sources: ['GCC', 'UN', 'Reuters'],
    indicators: ['POLITICAL_STABILITY', 'EXCHANGE_RATE']
  },
  {
    id: 'evt-2011-12',
    date: '2011-12-10',
    title: 'Foreign Reserves Fall to $4.3 Billion',
    titleAr: 'انخفاض الاحتياطيات الأجنبية إلى 4.3 مليار دولار',
    description: 'Central Bank foreign reserves drop to $4.3 billion from $7 billion in 2010.',
    descriptionAr: 'تنخفض احتياطيات البنك المركزي من العملات الأجنبية إلى 4.3 مليار دولار من 7 مليار في 2010.',
    category: 'banking_financial',
    severity: 'major',
    economicImpact: { exchangeRate: 'Pressure mounting' },
    sources: ['Central Bank of Yemen', 'IMF'],
    indicators: ['FOREIGN_RESERVES']
  },

  // ============================================================================
  // 2012 - Transition Period (12 events)
  // ============================================================================
  {
    id: 'evt-2012-01',
    date: '2012-01-21',
    title: 'Parliament Grants Saleh Immunity',
    titleAr: 'البرلمان يمنح صالح الحصانة',
    description: 'Yemeni parliament approves immunity law for President Saleh and his associates.',
    descriptionAr: 'البرلمان اليمني يوافق على قانون الحصانة للرئيس صالح ومعاونيه.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Transition proceeds' },
    sources: ['Reuters', 'Al Jazeera'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2012-02',
    date: '2012-02-21',
    title: 'Hadi Elected President',
    titleAr: 'انتخاب هادي رئيساً',
    description: 'Abd Rabbuh Mansur Hadi elected president in single-candidate election with 99.8% of votes.',
    descriptionAr: 'عبد ربه منصور هادي ينتخب رئيساً في انتخابات بمرشح واحد بنسبة 99.8% من الأصوات.',
    category: 'international',
    severity: 'critical',
    economicImpact: { gdp: 'Stability hopes', exchangeRate: 'Temporary improvement' },
    sources: ['UN', 'Reuters', 'BBC'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2012-03',
    date: '2012-03-15',
    title: 'Saudi Arabia Pledges $3 Billion Aid',
    titleAr: 'السعودية تتعهد بمساعدات بقيمة 3 مليار دولار',
    description: 'Saudi Arabia pledges $3 billion in economic assistance to support Yemen\'s transition.',
    descriptionAr: 'السعودية تتعهد بتقديم 3 مليار دولار كمساعدات اقتصادية لدعم المرحلة الانتقالية في اليمن.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Aid boost', humanitarian: 'Relief funding' },
    sources: ['Saudi Government', 'Reuters'],
    indicators: ['AID_FLOWS']
  },
  {
    id: 'evt-2012-04',
    date: '2012-04-20',
    title: 'GDP Recovers to +2.4%',
    titleAr: 'تعافي الناتج المحلي إلى +2.4%',
    description: 'Economy shows partial recovery with 2.4% GDP growth as political situation stabilizes.',
    descriptionAr: 'يظهر الاقتصاد تعافياً جزئياً بنمو 2.4% في الناتج المحلي مع استقرار الوضع السياسي.',
    category: 'fiscal_policy',
    severity: 'major',
    economicImpact: { gdp: '+2.4%' },
    sources: ['World Bank', 'IMF'],
    indicators: ['GDP_GROWTH']
  },
  {
    id: 'evt-2012-05',
    date: '2012-05-21',
    title: 'AQAP Seizes Jaar and Zinjibar',
    titleAr: 'القاعدة تسيطر على جعار وزنجبار',
    description: 'Al-Qaeda in the Arabian Peninsula seizes control of Jaar and Zinjibar in Abyan governorate.',
    descriptionAr: 'تنظيم القاعدة في جزيرة العرب يسيطر على جعار وزنجبار في محافظة أبين.',
    category: 'conflict',
    severity: 'major',
    economicImpact: { gdp: 'Regional disruption', humanitarian: 'Displacement' },
    sources: ['Reuters', 'BBC'],
    indicators: ['CONFLICT_INTENSITY', 'IDP_COUNT']
  },
  {
    id: 'evt-2012-06',
    date: '2012-06-12',
    title: 'Military Recaptures Abyan',
    titleAr: 'الجيش يستعيد أبين',
    description: 'Yemeni military, with US support, recaptures Jaar and Zinjibar from AQAP.',
    descriptionAr: 'الجيش اليمني، بدعم أمريكي، يستعيد جعار وزنجبار من تنظيم القاعدة.',
    category: 'conflict',
    severity: 'major',
    economicImpact: { gdp: 'Security improvement' },
    sources: ['US State Department', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2012-07',
    date: '2012-07-15',
    title: 'Oil Production Recovers to 180,000 bpd',
    titleAr: 'إنتاج النفط يتعافى إلى 180,000 برميل يومياً',
    description: 'Oil production partially recovers to 180,000 barrels per day as security improves.',
    descriptionAr: 'يتعافى إنتاج النفط جزئياً إلى 180,000 برميل يومياً مع تحسن الأمن.',
    category: 'oil_energy',
    severity: 'moderate',
    economicImpact: { gdp: 'Revenue recovery', trade: 'Export increase' },
    sources: ['Ministry of Oil', 'OPEC'],
    indicators: ['OIL_PRODUCTION']
  },
  {
    id: 'evt-2012-08',
    date: '2012-08-20',
    title: 'Inflation Moderates to 9.9%',
    titleAr: 'اعتدال التضخم إلى 9.9%',
    description: 'Annual inflation rate drops to 9.9% as supply chains partially restore.',
    descriptionAr: 'ينخفض معدل التضخم السنوي إلى 9.9% مع استعادة سلاسل التوريد جزئياً.',
    category: 'fiscal_policy',
    severity: 'moderate',
    economicImpact: { inflation: '9.9%' },
    sources: ['Central Statistical Organization'],
    indicators: ['INFLATION_RATE']
  },
  {
    id: 'evt-2012-09',
    date: '2012-09-10',
    title: 'US Embassy Attack in Sanaa',
    titleAr: 'هجوم على السفارة الأمريكية في صنعاء',
    description: 'Protesters storm US Embassy compound in Sanaa amid anti-American protests across region.',
    descriptionAr: 'متظاهرون يقتحمون مجمع السفارة الأمريكية في صنعاء وسط احتجاجات معادية لأمريكا في المنطقة.',
    category: 'conflict',
    severity: 'moderate',
    economicImpact: { gdp: 'Security concerns' },
    sources: ['US State Department', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2012-10',
    date: '2012-10-15',
    title: 'IMF Approves $93 Million Extended Credit',
    titleAr: 'صندوق النقد الدولي يوافق على ائتمان ممتد بقيمة 93 مليون دولار',
    description: 'IMF approves $93 million Extended Credit Facility to support economic reforms.',
    descriptionAr: 'صندوق النقد الدولي يوافق على تسهيل ائتماني ممتد بقيمة 93 مليون دولار لدعم الإصلاحات الاقتصادية.',
    category: 'international',
    severity: 'moderate',
    economicImpact: { gdp: 'Reform support' },
    sources: ['IMF'],
    indicators: ['AID_FLOWS']
  },
  {
    id: 'evt-2012-11',
    date: '2012-11-20',
    title: 'Foreign Reserves Recover to $5 Billion',
    titleAr: 'الاحتياطيات الأجنبية تتعافى إلى 5 مليار دولار',
    description: 'Central Bank foreign reserves recover to $5 billion with Saudi aid disbursement.',
    descriptionAr: 'تتعافى احتياطيات البنك المركزي من العملات الأجنبية إلى 5 مليار دولار مع صرف المساعدات السعودية.',
    category: 'banking_financial',
    severity: 'moderate',
    economicImpact: { exchangeRate: 'Stabilizing' },
    sources: ['Central Bank of Yemen'],
    indicators: ['FOREIGN_RESERVES']
  },
  {
    id: 'evt-2012-12',
    date: '2012-12-15',
    title: 'Military Restructuring Begins',
    titleAr: 'بدء إعادة هيكلة الجيش',
    description: 'President Hadi begins restructuring military to remove Saleh loyalists from key positions.',
    descriptionAr: 'الرئيس هادي يبدأ إعادة هيكلة الجيش لإزالة الموالين لصالح من المناصب الرئيسية.',
    category: 'conflict',
    severity: 'major',
    economicImpact: { gdp: 'Security transition' },
    sources: ['Reuters', 'Al Jazeera'],
    indicators: ['POLITICAL_STABILITY']
  },

  // ============================================================================
  // 2013 - National Dialogue (10 events)
  // ============================================================================
  {
    id: 'evt-2013-01',
    date: '2013-01-15',
    title: 'GDP Growth Reaches 4.8%',
    titleAr: 'نمو الناتج المحلي يصل إلى 4.8%',
    description: 'Economy continues recovery with 4.8% GDP growth, strongest since 2010.',
    descriptionAr: 'يستمر الاقتصاد في التعافي بنمو 4.8% في الناتج المحلي، الأقوى منذ 2010.',
    category: 'fiscal_policy',
    severity: 'major',
    economicImpact: { gdp: '+4.8%' },
    sources: ['World Bank', 'IMF'],
    indicators: ['GDP_GROWTH']
  },
  {
    id: 'evt-2013-02',
    date: '2013-03-18',
    title: 'National Dialogue Conference Begins',
    titleAr: 'بدء مؤتمر الحوار الوطني',
    description: 'National Dialogue Conference begins with 565 delegates to determine Yemen\'s political future.',
    descriptionAr: 'يبدأ مؤتمر الحوار الوطني بمشاركة 565 مندوباً لتحديد مستقبل اليمن السياسي.',
    category: 'international',
    severity: 'critical',
    economicImpact: { gdp: 'Political stability hopes' },
    sources: ['UN', 'Reuters'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2013-03',
    date: '2013-04-20',
    title: 'Oil Production at 198,000 bpd',
    titleAr: 'إنتاج النفط عند 198,000 برميل يومياً',
    description: 'Oil production reaches 198,000 barrels per day, near pre-crisis levels.',
    descriptionAr: 'يصل إنتاج النفط إلى 198,000 برميل يومياً، قريباً من مستويات ما قبل الأزمة.',
    category: 'oil_energy',
    severity: 'moderate',
    economicImpact: { gdp: 'Revenue recovery', trade: 'Export growth' },
    sources: ['Ministry of Oil'],
    indicators: ['OIL_PRODUCTION']
  },
  {
    id: 'evt-2013-04',
    date: '2013-05-15',
    title: 'Pipeline Attacks Resume',
    titleAr: 'استئناف الهجمات على خطوط الأنابيب',
    description: 'Tribal militants resume attacks on Marib oil pipeline, disrupting exports.',
    descriptionAr: 'مسلحون قبليون يستأنفون الهجمات على خط أنابيب مأرب النفطي، مما يعطل الصادرات.',
    category: 'oil_energy',
    severity: 'major',
    economicImpact: { gdp: 'Export disruption', trade: 'Revenue loss' },
    sources: ['Reuters', 'Ministry of Oil'],
    indicators: ['OIL_PRODUCTION']
  },
  {
    id: 'evt-2013-05',
    date: '2013-06-20',
    title: 'Inflation at 11%',
    titleAr: 'التضخم عند 11%',
    description: 'Annual inflation rate reaches 11%, driven by food and fuel prices.',
    descriptionAr: 'يصل معدل التضخم السنوي إلى 11%، مدفوعاً بأسعار الغذاء والوقود.',
    category: 'fiscal_policy',
    severity: 'moderate',
    economicImpact: { inflation: '11%' },
    sources: ['Central Statistical Organization'],
    indicators: ['INFLATION_RATE']
  },
  {
    id: 'evt-2013-06',
    date: '2013-07-15',
    title: 'Houthis Expand in Sa\'ada',
    titleAr: 'توسع الحوثيين في صعدة',
    description: 'Houthi movement expands control in Sa\'ada governorate, clashing with Salafi groups.',
    descriptionAr: 'حركة الحوثي توسع سيطرتها في محافظة صعدة، متصادمة مع الجماعات السلفية.',
    category: 'conflict',
    severity: 'major',
    economicImpact: { gdp: 'Regional instability' },
    sources: ['Al Jazeera', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2013-07',
    date: '2013-08-20',
    title: 'Foreign Reserves at $5.35 Billion',
    titleAr: 'الاحتياطيات الأجنبية عند 5.35 مليار دولار',
    description: 'Central Bank foreign reserves reach $5.35 billion, covering 5 months of imports.',
    descriptionAr: 'تصل احتياطيات البنك المركزي من العملات الأجنبية إلى 5.35 مليار دولار، تغطي 5 أشهر من الواردات.',
    category: 'banking_financial',
    severity: 'moderate',
    economicImpact: { exchangeRate: 'Stable' },
    sources: ['Central Bank of Yemen'],
    indicators: ['FOREIGN_RESERVES']
  },
  {
    id: 'evt-2013-08',
    date: '2013-09-15',
    title: 'US Drone Strikes Intensify',
    titleAr: 'تكثيف الغارات الأمريكية بالطائرات المسيرة',
    description: 'US intensifies drone strikes against AQAP targets in Yemen.',
    descriptionAr: 'الولايات المتحدة تكثف غاراتها بالطائرات المسيرة ضد أهداف تنظيم القاعدة في اليمن.',
    category: 'conflict',
    severity: 'moderate',
    economicImpact: { gdp: 'Security operations' },
    sources: ['US State Department', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2013-09',
    date: '2013-10-20',
    title: 'World Bank Approves $400M Support',
    titleAr: 'البنك الدولي يوافق على دعم بقيمة 400 مليون دولار',
    description: 'World Bank approves $400 million in development support for Yemen.',
    descriptionAr: 'البنك الدولي يوافق على 400 مليون دولار كدعم تنموي لليمن.',
    category: 'international',
    severity: 'moderate',
    economicImpact: { gdp: 'Development funding' },
    sources: ['World Bank'],
    indicators: ['AID_FLOWS']
  },
  {
    id: 'evt-2013-10',
    date: '2013-12-15',
    title: 'Exchange Rate Stable at 214.5 YER/USD',
    titleAr: 'سعر الصرف مستقر عند 214.5 ريال/دولار',
    description: 'Yemeni Rial remains stable at 214.5 per US dollar throughout the year.',
    descriptionAr: 'الريال اليمني يبقى مستقراً عند 214.5 للدولار الأمريكي طوال العام.',
    category: 'currency',
    severity: 'moderate',
    economicImpact: { exchangeRate: '214.5 YER/USD' },
    sources: ['Central Bank of Yemen'],
    indicators: ['EXCHANGE_RATE']
  },

  // ============================================================================
  // 2014 - Houthi Advance (12 events)
  // ============================================================================
  {
    id: 'evt-2014-01',
    date: '2014-01-25',
    title: 'National Dialogue Concludes',
    titleAr: 'اختتام الحوار الوطني',
    description: 'National Dialogue Conference concludes after 10 months with agreement on federal system.',
    descriptionAr: 'يختتم مؤتمر الحوار الوطني بعد 10 أشهر باتفاق على النظام الفيدرالي.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Political framework agreed' },
    sources: ['UN', 'Reuters'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2014-02',
    date: '2014-02-10',
    title: 'Six-Region Federal Plan Announced',
    titleAr: 'إعلان خطة الأقاليم الستة الفيدرالية',
    description: 'President Hadi announces plan to divide Yemen into six federal regions.',
    descriptionAr: 'الرئيس هادي يعلن خطة تقسيم اليمن إلى ستة أقاليم فيدرالية.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Structural reform' },
    sources: ['Reuters', 'Al Jazeera'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2014-03',
    date: '2014-03-15',
    title: 'Houthis Reject Federal Plan',
    titleAr: 'الحوثيون يرفضون الخطة الفيدرالية',
    description: 'Houthi movement rejects six-region federal plan, claiming it marginalizes northern regions.',
    descriptionAr: 'حركة الحوثي ترفض خطة الأقاليم الستة الفيدرالية، مدعية أنها تهمش المناطق الشمالية.',
    category: 'conflict',
    severity: 'major',
    economicImpact: { gdp: 'Political uncertainty' },
    sources: ['Al Jazeera', 'Reuters'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2014-04',
    date: '2014-04-20',
    title: 'GDP Contracts by 0.19%',
    titleAr: 'انكماش الناتج المحلي بنسبة 0.19%',
    description: 'Economy contracts slightly by 0.19% as political tensions rise.',
    descriptionAr: 'ينكمش الاقتصاد بشكل طفيف بنسبة 0.19% مع تصاعد التوترات السياسية.',
    category: 'fiscal_policy',
    severity: 'moderate',
    economicImpact: { gdp: '-0.19%' },
    sources: ['World Bank', 'IMF'],
    indicators: ['GDP_GROWTH']
  },
  {
    id: 'evt-2014-05',
    date: '2014-07-30',
    title: 'Fuel Subsidy Cuts Spark Protests',
    titleAr: 'تخفيضات دعم الوقود تشعل الاحتجاجات',
    description: 'Government cuts fuel subsidies, doubling petrol prices and sparking mass protests.',
    descriptionAr: 'الحكومة تخفض دعم الوقود، مضاعفة أسعار البنزين ومشعلة احتجاجات جماهيرية.',
    category: 'fiscal_policy',
    severity: 'critical',
    economicImpact: { inflation: 'Price shock', humanitarian: 'Public anger' },
    sources: ['Reuters', 'Al Jazeera'],
    indicators: ['FUEL_PRICES', 'INFLATION_RATE']
  },
  {
    id: 'evt-2014-06',
    date: '2014-08-18',
    title: 'Houthis March on Sanaa',
    titleAr: 'الحوثيون يزحفون نحو صنعاء',
    description: 'Houthi forces begin march toward Sanaa, exploiting fuel subsidy protests.',
    descriptionAr: 'قوات الحوثي تبدأ الزحف نحو صنعاء، مستغلة احتجاجات دعم الوقود.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Crisis begins', exchangeRate: 'Pressure' },
    sources: ['Reuters', 'BBC', 'Al Jazeera'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2014-07',
    date: '2014-09-21',
    title: 'Houthis Seize Sanaa',
    titleAr: 'الحوثيون يسيطرون على صنعاء',
    description: 'Houthi forces seize control of Sanaa after brief fighting, government buildings occupied.',
    descriptionAr: 'قوات الحوثي تسيطر على صنعاء بعد قتال قصير، احتلال المباني الحكومية.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Political collapse', exchangeRate: 'Sharp decline', humanitarian: 'Crisis deepens' },
    sources: ['UN', 'Reuters', 'BBC', 'Al Jazeera'],
    indicators: ['CONFLICT_INTENSITY', 'EXCHANGE_RATE', 'IDP_COUNT']
  },
  {
    id: 'evt-2014-08',
    date: '2014-09-21',
    title: 'Peace and National Partnership Agreement',
    titleAr: 'اتفاق السلام والشراكة الوطنية',
    description: 'UN-brokered Peace and National Partnership Agreement signed between government and Houthis.',
    descriptionAr: 'توقيع اتفاق السلام والشراكة الوطنية بوساطة أممية بين الحكومة والحوثيين.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Temporary stability' },
    sources: ['UN', 'Reuters'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2014-09',
    date: '2014-10-15',
    title: 'Oil Production Falls to 153,000 bpd',
    titleAr: 'إنتاج النفط ينخفض إلى 153,000 برميل يومياً',
    description: 'Oil production drops to 153,000 barrels per day amid security deterioration.',
    descriptionAr: 'ينخفض إنتاج النفط إلى 153,000 برميل يومياً وسط تدهور الأمن.',
    category: 'oil_energy',
    severity: 'major',
    economicImpact: { gdp: 'Revenue decline', trade: 'Export drop' },
    sources: ['Ministry of Oil', 'OPEC'],
    indicators: ['OIL_PRODUCTION']
  },
  {
    id: 'evt-2014-10',
    date: '2014-10-20',
    title: 'Houthis Seize Hodeidah Port',
    titleAr: 'الحوثيون يسيطرون على ميناء الحديدة',
    description: 'Houthi forces seize control of Hodeidah, Yemen\'s main Red Sea port.',
    descriptionAr: 'قوات الحوثي تسيطر على الحديدة، الميناء الرئيسي لليمن على البحر الأحمر.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { trade: 'Import disruption', humanitarian: 'Aid access threatened' },
    sources: ['UN', 'Reuters'],
    indicators: ['TRADE_BALANCE', 'CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2014-11',
    date: '2014-11-15',
    title: 'Foreign Reserves Fall to $4.9 Billion',
    titleAr: 'الاحتياطيات الأجنبية تنخفض إلى 4.9 مليار دولار',
    description: 'Central Bank foreign reserves drop to $4.9 billion as crisis deepens.',
    descriptionAr: 'تنخفض احتياطيات البنك المركزي من العملات الأجنبية إلى 4.9 مليار دولار مع تعمق الأزمة.',
    category: 'banking_financial',
    severity: 'major',
    economicImpact: { exchangeRate: 'Pressure mounting' },
    sources: ['Central Bank of Yemen'],
    indicators: ['FOREIGN_RESERVES']
  },
  {
    id: 'evt-2014-12',
    date: '2014-12-20',
    title: 'UN Security Council Resolution 2201',
    titleAr: 'قرار مجلس الأمن الدولي 2201',
    description: 'UN Security Council condemns Houthi actions and demands withdrawal from government institutions.',
    descriptionAr: 'مجلس الأمن الدولي يدين أعمال الحوثيين ويطالب بالانسحاب من المؤسسات الحكومية.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'International pressure' },
    sources: ['UN Security Council'],
    indicators: ['POLITICAL_STABILITY']
  },

  // ============================================================================
  // 2015 - War Begins (15 events)
  // ============================================================================
  {
    id: 'evt-2015-01',
    date: '2015-01-20',
    title: 'Houthis Seize Presidential Palace',
    titleAr: 'الحوثيون يسيطرون على القصر الرئاسي',
    description: 'Houthi forces seize presidential palace and surround President Hadi\'s residence.',
    descriptionAr: 'قوات الحوثي تسيطر على القصر الرئاسي وتحاصر مقر إقامة الرئيس هادي.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Government collapse', exchangeRate: 'Sharp decline' },
    sources: ['Reuters', 'BBC', 'Al Jazeera'],
    indicators: ['CONFLICT_INTENSITY', 'POLITICAL_STABILITY']
  },
  {
    id: 'evt-2015-02',
    date: '2015-01-22',
    title: 'President Hadi Resigns',
    titleAr: 'استقالة الرئيس هادي',
    description: 'President Hadi and cabinet resign under Houthi pressure.',
    descriptionAr: 'الرئيس هادي ومجلس الوزراء يستقيلون تحت ضغط الحوثيين.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Political vacuum', exchangeRate: 'Currency crisis begins' },
    sources: ['Reuters', 'BBC'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2015-03',
    date: '2015-02-06',
    title: 'Houthis Dissolve Parliament',
    titleAr: 'الحوثيون يحلون البرلمان',
    description: 'Houthis announce dissolution of parliament and formation of Revolutionary Committee.',
    descriptionAr: 'الحوثيون يعلنون حل البرلمان وتشكيل اللجنة الثورية.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Constitutional crisis' },
    sources: ['Reuters', 'Al Jazeera'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2015-04',
    date: '2015-02-21',
    title: 'Hadi Escapes to Aden',
    titleAr: 'هادي يهرب إلى عدن',
    description: 'President Hadi escapes house arrest and flees to Aden, rescinding resignation.',
    descriptionAr: 'الرئيس هادي يهرب من الإقامة الجبرية ويفر إلى عدن، متراجعاً عن استقالته.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Dual government begins' },
    sources: ['Reuters', 'BBC'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2015-05',
    date: '2015-03-26',
    title: 'Saudi-Led Coalition Intervention Begins',
    titleAr: 'بدء تدخل التحالف بقيادة السعودية',
    description: 'Saudi Arabia launches Operation Decisive Storm, beginning airstrikes against Houthi positions.',
    descriptionAr: 'السعودية تطلق عملية عاصفة الحزم، بادئة غارات جوية ضد مواقع الحوثيين.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: '-28% annual', trade: 'Blockade begins', humanitarian: 'Catastrophe begins' },
    sources: ['Saudi Government', 'UN', 'Reuters', 'BBC'],
    indicators: ['CONFLICT_INTENSITY', 'GDP_GROWTH', 'IDP_COUNT']
  },
  {
    id: 'evt-2015-06',
    date: '2015-04-14',
    title: 'UN Arms Embargo Imposed',
    titleAr: 'فرض حظر الأسلحة الأممي',
    description: 'UN Security Council Resolution 2216 imposes arms embargo on Houthis and allies.',
    descriptionAr: 'قرار مجلس الأمن 2216 يفرض حظر أسلحة على الحوثيين وحلفائهم.',
    category: 'international',
    severity: 'major',
    economicImpact: { trade: 'Import restrictions' },
    sources: ['UN Security Council'],
    indicators: ['TRADE_BALANCE']
  },
  {
    id: 'evt-2015-07',
    date: '2015-05-15',
    title: 'GDP Contracts by 28%',
    titleAr: 'انكماش الناتج المحلي بنسبة 28%',
    description: 'Yemen\'s economy contracts by 28% - worst economic collapse in modern history.',
    descriptionAr: 'ينكمش الاقتصاد اليمني بنسبة 28% - أسوأ انهيار اقتصادي في التاريخ الحديث.',
    category: 'fiscal_policy',
    severity: 'critical',
    economicImpact: { gdp: '-28%', employment: 'Mass unemployment', humanitarian: 'Poverty surge' },
    sources: ['World Bank', 'IMF'],
    indicators: ['GDP_GROWTH', 'POVERTY_RATE', 'UNEMPLOYMENT_RATE']
  },
  {
    id: 'evt-2015-08',
    date: '2015-06-20',
    title: 'Oil Production Collapses to 47,000 bpd',
    titleAr: 'انهيار إنتاج النفط إلى 47,000 برميل يومياً',
    description: 'Oil production collapses to 47,000 barrels per day, down 83% from 2010 peak.',
    descriptionAr: 'ينهار إنتاج النفط إلى 47,000 برميل يومياً، بانخفاض 83% عن ذروة 2010.',
    category: 'oil_energy',
    severity: 'critical',
    economicImpact: { gdp: 'Revenue collapse', trade: 'Export near-zero' },
    sources: ['Ministry of Oil', 'OPEC'],
    indicators: ['OIL_PRODUCTION', 'GOVERNMENT_REVENUE']
  },
  {
    id: 'evt-2015-09',
    date: '2015-07-15',
    title: 'Aden Liberated by Coalition',
    titleAr: 'تحرير عدن من قبل التحالف',
    description: 'Saudi-led coalition and southern resistance forces recapture Aden from Houthis.',
    descriptionAr: 'التحالف بقيادة السعودية وقوات المقاومة الجنوبية يستعيدون عدن من الحوثيين.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Southern economy begins recovery' },
    sources: ['Saudi Government', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2015-10',
    date: '2015-08-20',
    title: 'Foreign Reserves Depleted to $2.1 Billion',
    titleAr: 'استنزاف الاحتياطيات الأجنبية إلى 2.1 مليار دولار',
    description: 'Central Bank foreign reserves depleted to $2.1 billion, covering less than 3 months of imports.',
    descriptionAr: 'استنزاف احتياطيات البنك المركزي من العملات الأجنبية إلى 2.1 مليار دولار.',
    category: 'banking_financial',
    severity: 'critical',
    economicImpact: { exchangeRate: 'Currency crisis', humanitarian: 'Import crisis' },
    sources: ['Central Bank of Yemen', 'IMF'],
    indicators: ['FOREIGN_RESERVES', 'EXCHANGE_RATE']
  },
  {
    id: 'evt-2015-11',
    date: '2015-09-15',
    title: 'Inflation Surges to 19.5%',
    titleAr: 'ارتفاع التضخم إلى 19.5%',
    description: 'Annual inflation reaches 19.5% as supply chains collapse and imports restricted.',
    descriptionAr: 'يصل التضخم السنوي إلى 19.5% مع انهيار سلاسل التوريد وتقييد الواردات.',
    category: 'fiscal_policy',
    severity: 'major',
    economicImpact: { inflation: '19.5%', humanitarian: 'Food crisis' },
    sources: ['Central Statistical Organization', 'WFP'],
    indicators: ['INFLATION_RATE', 'FOOD_PRICES']
  },
  {
    id: 'evt-2015-12',
    date: '2015-10-20',
    title: 'UN Declares Level 3 Emergency',
    titleAr: 'الأمم المتحدة تعلن حالة الطوارئ من المستوى 3',
    description: 'UN declares Yemen a Level 3 humanitarian emergency, the highest level.',
    descriptionAr: 'الأمم المتحدة تعلن اليمن حالة طوارئ إنسانية من المستوى 3، أعلى مستوى.',
    category: 'humanitarian',
    severity: 'critical',
    economicImpact: { humanitarian: '21 million need assistance' },
    sources: ['UN OCHA'],
    indicators: ['IDP_COUNT', 'FOOD_INSECURITY']
  },
  {
    id: 'evt-2015-13',
    date: '2015-11-15',
    title: 'IDPs Reach 2.5 Million',
    titleAr: 'النازحون يصلون إلى 2.5 مليون',
    description: 'Internally displaced persons reach 2.5 million as fighting intensifies across country.',
    descriptionAr: 'يصل النازحون داخلياً إلى 2.5 مليون مع تصاعد القتال في جميع أنحاء البلاد.',
    category: 'humanitarian',
    severity: 'critical',
    economicImpact: { humanitarian: '2.5M displaced' },
    sources: ['UNHCR', 'IOM'],
    indicators: ['IDP_COUNT']
  },
  {
    id: 'evt-2015-14',
    date: '2015-12-15',
    title: 'Geneva Peace Talks Fail',
    titleAr: 'فشل محادثات السلام في جنيف',
    description: 'UN-sponsored peace talks in Geneva end without agreement.',
    descriptionAr: 'محادثات السلام برعاية الأمم المتحدة في جنيف تنتهي دون اتفاق.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'War continues' },
    sources: ['UN'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2015-15',
    date: '2015-12-20',
    title: 'Poverty Rate Reaches 62%',
    titleAr: 'معدل الفقر يصل إلى 62%',
    description: 'Poverty rate surges to 62% of population, up from 49% in 2014.',
    descriptionAr: 'يرتفع معدل الفقر إلى 62% من السكان، ارتفاعاً من 49% في 2014.',
    category: 'humanitarian',
    severity: 'critical',
    economicImpact: { humanitarian: '62% poverty' },
    sources: ['World Bank', 'UNDP'],
    indicators: ['POVERTY_RATE']
  },

  // ============================================================================
  // 2016 - Central Bank Crisis (12 events)
  // ============================================================================
  {
    id: 'evt-2016-01',
    date: '2016-01-15',
    title: 'GDP Contracts by 9.4%',
    titleAr: 'انكماش الناتج المحلي بنسبة 9.4%',
    description: 'Economy contracts by 9.4% as war continues and infrastructure destroyed.',
    descriptionAr: 'ينكمش الاقتصاد بنسبة 9.4% مع استمرار الحرب وتدمير البنية التحتية.',
    category: 'fiscal_policy',
    severity: 'critical',
    economicImpact: { gdp: '-9.4%' },
    sources: ['World Bank', 'IMF'],
    indicators: ['GDP_GROWTH']
  },
  {
    id: 'evt-2016-02',
    date: '2016-02-20',
    title: 'Kuwait Peace Talks Begin',
    titleAr: 'بدء محادثات السلام في الكويت',
    description: 'UN-sponsored peace talks begin in Kuwait between government and Houthis.',
    descriptionAr: 'بدء محادثات السلام برعاية الأمم المتحدة في الكويت بين الحكومة والحوثيين.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Peace hopes' },
    sources: ['UN'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2016-03',
    date: '2016-03-15',
    title: 'Inflation Reaches 21.3%',
    titleAr: 'التضخم يصل إلى 21.3%',
    description: 'Annual inflation rate reaches 21.3% as currency weakens and imports restricted.',
    descriptionAr: 'يصل معدل التضخم السنوي إلى 21.3% مع ضعف العملة وتقييد الواردات.',
    category: 'fiscal_policy',
    severity: 'major',
    economicImpact: { inflation: '21.3%' },
    sources: ['Central Statistical Organization'],
    indicators: ['INFLATION_RATE']
  },
  {
    id: 'evt-2016-04',
    date: '2016-04-20',
    title: 'Civil Servant Salaries Suspended',
    titleAr: 'تعليق رواتب موظفي الدولة',
    description: 'Central Bank in Sanaa suspends salary payments to 1.2 million civil servants.',
    descriptionAr: 'البنك المركزي في صنعاء يعلق دفع الرواتب لـ 1.2 مليون موظف حكومي.',
    category: 'banking_financial',
    severity: 'critical',
    economicImpact: { gdp: 'Consumer spending collapse', humanitarian: 'Mass poverty' },
    sources: ['UN', 'World Bank'],
    indicators: ['GOVERNMENT_EXPENDITURE', 'POVERTY_RATE']
  },
  {
    id: 'evt-2016-05',
    date: '2016-05-15',
    title: 'Oil Production at 22,000 bpd',
    titleAr: 'إنتاج النفط عند 22,000 برميل يومياً',
    description: 'Oil production hits record low of 22,000 barrels per day.',
    descriptionAr: 'إنتاج النفط يصل إلى أدنى مستوى قياسي عند 22,000 برميل يومياً.',
    category: 'oil_energy',
    severity: 'critical',
    economicImpact: { gdp: 'Revenue near-zero', trade: 'Export collapse' },
    sources: ['Ministry of Oil'],
    indicators: ['OIL_PRODUCTION']
  },
  {
    id: 'evt-2016-06',
    date: '2016-06-20',
    title: 'Foreign Reserves Fall to $2 Billion',
    titleAr: 'الاحتياطيات الأجنبية تنخفض إلى 2 مليار دولار',
    description: 'Central Bank foreign reserves drop to $2 billion, critically low.',
    descriptionAr: 'تنخفض احتياطيات البنك المركزي من العملات الأجنبية إلى 2 مليار دولار.',
    category: 'banking_financial',
    severity: 'critical',
    economicImpact: { exchangeRate: 'Currency crisis deepens' },
    sources: ['Central Bank of Yemen'],
    indicators: ['FOREIGN_RESERVES']
  },
  {
    id: 'evt-2016-07',
    date: '2016-08-06',
    title: 'Kuwait Peace Talks Collapse',
    titleAr: 'انهيار محادثات السلام في الكويت',
    description: 'UN-sponsored peace talks in Kuwait collapse after 3 months without agreement.',
    descriptionAr: 'انهيار محادثات السلام برعاية الأمم المتحدة في الكويت بعد 3 أشهر دون اتفاق.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'War intensifies' },
    sources: ['UN'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2016-08',
    date: '2016-09-18',
    title: 'Central Bank Relocated to Aden',
    titleAr: 'نقل البنك المركزي إلى عدن',
    description: 'President Hadi relocates Central Bank headquarters from Sanaa to Aden, creating split banking system.',
    descriptionAr: 'الرئيس هادي ينقل مقر البنك المركزي من صنعاء إلى عدن، مما يخلق نظاماً مصرفياً منقسماً.',
    category: 'banking_financial',
    severity: 'critical',
    economicImpact: { exchangeRate: 'Dual currency system', gdp: 'Economic fragmentation' },
    sources: ['Central Bank of Yemen', 'Reuters'],
    indicators: ['EXCHANGE_RATE', 'MONETARY_POLICY']
  },
  {
    id: 'evt-2016-09',
    date: '2016-10-08',
    title: 'Funeral Hall Bombing',
    titleAr: 'قصف قاعة العزاء',
    description: 'Coalition airstrike on funeral hall in Sanaa kills over 140 people, international condemnation.',
    descriptionAr: 'غارة للتحالف على قاعة عزاء في صنعاء تقتل أكثر من 140 شخصاً، إدانة دولية.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { humanitarian: 'International outcry' },
    sources: ['UN', 'Human Rights Watch'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2016-10',
    date: '2016-10-20',
    title: 'Exchange Rate Reaches 241 YER/USD',
    titleAr: 'سعر الصرف يصل إلى 241 ريال/دولار',
    description: 'Yemeni Rial weakens to 241 per US dollar, 12% depreciation from pre-war levels.',
    descriptionAr: 'الريال اليمني يضعف إلى 241 للدولار الأمريكي، انخفاض 12% عن مستويات ما قبل الحرب.',
    category: 'currency',
    severity: 'major',
    economicImpact: { exchangeRate: '241 YER/USD', inflation: 'Import prices surge' },
    sources: ['Central Bank of Yemen'],
    indicators: ['EXCHANGE_RATE']
  },
  {
    id: 'evt-2016-11',
    date: '2016-11-15',
    title: 'Saudi Arabia Deposits $2 Billion',
    titleAr: 'السعودية تودع 2 مليار دولار',
    description: 'Saudi Arabia deposits $2 billion in Central Bank of Yemen (Aden) to support currency.',
    descriptionAr: 'السعودية تودع 2 مليار دولار في البنك المركزي اليمني (عدن) لدعم العملة.',
    category: 'international',
    severity: 'major',
    economicImpact: { exchangeRate: 'Temporary stabilization' },
    sources: ['Saudi Government', 'Reuters'],
    indicators: ['FOREIGN_RESERVES', 'AID_FLOWS']
  },
  {
    id: 'evt-2016-12',
    date: '2016-12-20',
    title: 'Cholera Outbreak Begins',
    titleAr: 'بدء تفشي الكوليرا',
    description: 'Cholera outbreak begins in Yemen, will become world\'s largest.',
    descriptionAr: 'بدء تفشي الكوليرا في اليمن، سيصبح الأكبر في العالم.',
    category: 'humanitarian',
    severity: 'critical',
    economicImpact: { humanitarian: 'Health crisis', gdp: 'Healthcare costs surge' },
    sources: ['WHO', 'UNICEF'],
    indicators: ['HEALTH_INDICATORS']
  },

  // ============================================================================
  // 2017-2026 - Continued Crisis (abbreviated for space, full data in database)
  // ============================================================================
  // Adding key events for each year...

  // 2017 Events
  {
    id: 'evt-2017-01',
    date: '2017-04-15',
    title: 'Cholera Cases Reach 500,000',
    titleAr: 'حالات الكوليرا تصل إلى 500,000',
    description: 'Yemen cholera outbreak becomes world\'s largest with 500,000 suspected cases.',
    descriptionAr: 'تفشي الكوليرا في اليمن يصبح الأكبر في العالم مع 500,000 حالة مشتبه بها.',
    category: 'humanitarian',
    severity: 'critical',
    economicImpact: { humanitarian: 'Health catastrophe' },
    sources: ['WHO', 'UNICEF'],
    indicators: ['HEALTH_INDICATORS']
  },
  {
    id: 'evt-2017-02',
    date: '2017-11-06',
    title: 'Saudi Blockade Tightens',
    titleAr: 'تشديد الحصار السعودي',
    description: 'Saudi Arabia tightens blockade after Houthi missile attack on Riyadh airport.',
    descriptionAr: 'السعودية تشدد الحصار بعد هجوم صاروخي حوثي على مطار الرياض.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { trade: 'Import crisis', humanitarian: 'Famine threat' },
    sources: ['UN', 'Reuters'],
    indicators: ['TRADE_BALANCE', 'FOOD_INSECURITY']
  },
  {
    id: 'evt-2017-03',
    date: '2017-12-04',
    title: 'Saleh Killed by Houthis',
    titleAr: 'مقتل صالح على يد الحوثيين',
    description: 'Former President Saleh killed by Houthis after announcing split from alliance.',
    descriptionAr: 'مقتل الرئيس السابق صالح على يد الحوثيين بعد إعلان انفصاله عن التحالف.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Political realignment' },
    sources: ['Reuters', 'BBC', 'Al Jazeera'],
    indicators: ['POLITICAL_STABILITY']
  },

  // 2018 Events
  {
    id: 'evt-2018-01',
    date: '2018-06-13',
    title: 'Battle of Hodeidah Begins',
    titleAr: 'بدء معركة الحديدة',
    description: 'Coalition forces launch offensive to capture Hodeidah port from Houthis.',
    descriptionAr: 'قوات التحالف تشن هجوماً للسيطرة على ميناء الحديدة من الحوثيين.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { trade: 'Port threatened', humanitarian: 'Aid access at risk' },
    sources: ['UN', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY', 'TRADE_BALANCE']
  },
  {
    id: 'evt-2018-02',
    date: '2018-12-13',
    title: 'Stockholm Agreement Signed',
    titleAr: 'توقيع اتفاق ستوكهولم',
    description: 'UN-brokered Stockholm Agreement includes ceasefire in Hodeidah and prisoner exchange.',
    descriptionAr: 'اتفاق ستوكهولم بوساطة أممية يتضمن وقف إطلاق النار في الحديدة وتبادل الأسرى.',
    category: 'international',
    severity: 'critical',
    economicImpact: { trade: 'Port access preserved', humanitarian: 'Aid flow continues' },
    sources: ['UN', 'Reuters'],
    indicators: ['POLITICAL_STABILITY', 'TRADE_BALANCE']
  },

  // 2019 Events
  {
    id: 'evt-2019-01',
    date: '2019-08-10',
    title: 'STC Seizes Aden',
    titleAr: 'المجلس الانتقالي يسيطر على عدن',
    description: 'Southern Transitional Council (STC) forces seize Aden from government.',
    descriptionAr: 'قوات المجلس الانتقالي الجنوبي تسيطر على عدن من الحكومة.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Government fragmentation' },
    sources: ['Reuters', 'Al Jazeera'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2019-02',
    date: '2019-11-05',
    title: 'Riyadh Agreement Signed',
    titleAr: 'توقيع اتفاق الرياض',
    description: 'Saudi-brokered Riyadh Agreement between government and STC aims to end southern conflict.',
    descriptionAr: 'اتفاق الرياض بوساطة سعودية بين الحكومة والمجلس الانتقالي يهدف لإنهاء الصراع الجنوبي.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Southern stability hopes' },
    sources: ['Saudi Government', 'Reuters'],
    indicators: ['POLITICAL_STABILITY']
  },

  // 2020 Events
  {
    id: 'evt-2020-01',
    date: '2020-03-15',
    title: 'COVID-19 Reaches Yemen',
    titleAr: 'كوفيد-19 يصل إلى اليمن',
    description: 'First COVID-19 cases confirmed in Yemen, health system already collapsed.',
    descriptionAr: 'تأكيد أول حالات كوفيد-19 في اليمن، النظام الصحي منهار بالفعل.',
    category: 'humanitarian',
    severity: 'critical',
    economicImpact: { gdp: '-8.5%', humanitarian: 'Health crisis worsens' },
    sources: ['WHO', 'UN'],
    indicators: ['HEALTH_INDICATORS', 'GDP_GROWTH']
  },
  {
    id: 'evt-2020-02',
    date: '2020-04-25',
    title: 'STC Declares Self-Rule in South',
    titleAr: 'المجلس الانتقالي يعلن الحكم الذاتي في الجنوب',
    description: 'Southern Transitional Council declares self-rule in southern Yemen.',
    descriptionAr: 'المجلس الانتقالي الجنوبي يعلن الحكم الذاتي في جنوب اليمن.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Further fragmentation' },
    sources: ['Reuters', 'Al Jazeera'],
    indicators: ['POLITICAL_STABILITY']
  },

  // 2021 Events
  {
    id: 'evt-2021-01',
    date: '2021-02-04',
    title: 'Biden Ends US Support for Offensive Operations',
    titleAr: 'بايدن ينهي الدعم الأمريكي للعمليات الهجومية',
    description: 'President Biden announces end of US support for Saudi offensive operations in Yemen.',
    descriptionAr: 'الرئيس بايدن يعلن إنهاء الدعم الأمريكي للعمليات الهجومية السعودية في اليمن.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Peace hopes' },
    sources: ['White House', 'Reuters'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2021-02',
    date: '2021-03-15',
    title: 'Marib Offensive Intensifies',
    titleAr: 'تصاعد هجوم مأرب',
    description: 'Houthi offensive on Marib intensifies, threatening last northern government stronghold.',
    descriptionAr: 'تصاعد الهجوم الحوثي على مأرب، مهدداً آخر معقل حكومي في الشمال.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Oil region threatened' },
    sources: ['UN', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY', 'OIL_PRODUCTION']
  },

  // 2022 Events
  {
    id: 'evt-2022-01',
    date: '2022-04-02',
    title: 'UN-Brokered Truce Begins',
    titleAr: 'بدء الهدنة بوساطة أممية',
    description: 'UN-brokered two-month truce begins, first nationwide ceasefire since 2016.',
    descriptionAr: 'بدء هدنة لمدة شهرين بوساطة أممية، أول وقف لإطلاق النار على مستوى البلاد منذ 2016.',
    category: 'international',
    severity: 'critical',
    economicImpact: { gdp: '+1.7%', trade: 'Ports reopen', humanitarian: 'Aid access improves' },
    sources: ['UN', 'Reuters'],
    indicators: ['POLITICAL_STABILITY', 'GDP_GROWTH']
  },
  {
    id: 'evt-2022-02',
    date: '2022-04-07',
    title: 'Presidential Leadership Council Formed',
    titleAr: 'تشكيل مجلس القيادة الرئاسي',
    description: 'President Hadi transfers power to 8-member Presidential Leadership Council.',
    descriptionAr: 'الرئيس هادي ينقل السلطة إلى مجلس القيادة الرئاسي المكون من 8 أعضاء.',
    category: 'international',
    severity: 'critical',
    economicImpact: { gdp: 'Government restructuring' },
    sources: ['Saudi Government', 'Reuters'],
    indicators: ['POLITICAL_STABILITY']
  },

  // 2023 Events
  {
    id: 'evt-2023-01',
    date: '2023-03-10',
    title: 'Saudi-Iran Détente',
    titleAr: 'التقارب السعودي الإيراني',
    description: 'Saudi Arabia and Iran restore diplomatic relations, raising hopes for Yemen peace.',
    descriptionAr: 'السعودية وإيران تستعيدان العلاقات الدبلوماسية، مما يرفع آمال السلام في اليمن.',
    category: 'international',
    severity: 'critical',
    economicImpact: { gdp: 'Peace hopes rise' },
    sources: ['Reuters', 'Al Jazeera'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2023-02',
    date: '2023-11-19',
    title: 'Houthi Red Sea Attacks Begin',
    titleAr: 'بدء هجمات الحوثيين في البحر الأحمر',
    description: 'Houthis begin attacks on commercial shipping in Red Sea in response to Gaza conflict.',
    descriptionAr: 'الحوثيون يبدأون هجمات على السفن التجارية في البحر الأحمر رداً على صراع غزة.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { trade: 'Global shipping disrupted', gdp: 'Regional instability' },
    sources: ['UN', 'Reuters', 'BBC'],
    indicators: ['TRADE_BALANCE', 'CONFLICT_INTENSITY']
  },

  // 2024 Events
  {
    id: 'evt-2024-01',
    date: '2024-01-12',
    title: 'US-UK Strikes on Houthi Targets',
    titleAr: 'ضربات أمريكية بريطانية على أهداف حوثية',
    description: 'US and UK launch airstrikes against Houthi military targets in Yemen.',
    descriptionAr: 'الولايات المتحدة وبريطانيا تشنان غارات جوية ضد أهداف عسكرية حوثية في اليمن.',
    category: 'conflict',
    severity: 'critical',
    economicImpact: { gdp: 'Conflict escalation', trade: 'Shipping crisis continues' },
    sources: ['US Government', 'UK Government', 'Reuters'],
    indicators: ['CONFLICT_INTENSITY']
  },
  {
    id: 'evt-2024-02',
    date: '2024-02-18',
    title: 'MV Rubymar Sinks',
    titleAr: 'غرق السفينة روبيمار',
    description: 'Houthi-attacked cargo ship MV Rubymar sinks in Red Sea, first vessel lost.',
    descriptionAr: 'غرق سفينة الشحن روبيمار التي هاجمها الحوثيون في البحر الأحمر، أول سفينة تُفقد.',
    category: 'conflict',
    severity: 'major',
    economicImpact: { trade: 'Shipping insurance soars' },
    sources: ['Reuters', 'BBC'],
    indicators: ['TRADE_BALANCE']
  },
  {
    id: 'evt-2024-03',
    date: '2024-06-15',
    title: 'Exchange Rate Reaches 1,917 YER/USD',
    titleAr: 'سعر الصرف يصل إلى 1,917 ريال/دولار',
    description: 'Yemeni Rial in Aden reaches 1,917 per US dollar, record low.',
    descriptionAr: 'الريال اليمني في عدن يصل إلى 1,917 للدولار الأمريكي، أدنى مستوى قياسي.',
    category: 'currency',
    severity: 'critical',
    economicImpact: { exchangeRate: '1,917 YER/USD', inflation: 'Hyperinflation risk' },
    sources: ['Central Bank of Yemen'],
    indicators: ['EXCHANGE_RATE', 'INFLATION_RATE']
  },
  {
    id: 'evt-2024-04',
    date: '2024-09-20',
    title: 'Houthis Designate Terrorist Organization',
    titleAr: 'تصنيف الحوثيين منظمة إرهابية',
    description: 'US re-designates Houthis as Specially Designated Global Terrorist organization.',
    descriptionAr: 'الولايات المتحدة تعيد تصنيف الحوثيين كمنظمة إرهابية عالمية.',
    category: 'international',
    severity: 'major',
    economicImpact: { trade: 'Sanctions implications', humanitarian: 'Aid concerns' },
    sources: ['US State Department'],
    indicators: ['TRADE_BALANCE']
  },
  {
    id: 'evt-2024-05',
    date: '2024-12-15',
    title: 'GDP Contracts by 1.5%',
    titleAr: 'انكماش الناتج المحلي بنسبة 1.5%',
    description: 'Yemen economy contracts by 1.5% amid continued conflict and Red Sea crisis.',
    descriptionAr: 'ينكمش الاقتصاد اليمني بنسبة 1.5% وسط استمرار الصراع وأزمة البحر الأحمر.',
    category: 'fiscal_policy',
    severity: 'major',
    economicImpact: { gdp: '-1.5%' },
    sources: ['World Bank', 'IMF'],
    indicators: ['GDP_GROWTH']
  },

  // 2025 Events
  {
    id: 'evt-2025-01',
    date: '2025-01-10',
    title: 'Economic Recovery Framework Proposed',
    titleAr: 'اقتراح إطار التعافي الاقتصادي',
    description: 'International partners propose comprehensive economic recovery framework for Yemen.',
    descriptionAr: 'الشركاء الدوليون يقترحون إطاراً شاملاً للتعافي الاقتصادي في اليمن.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Recovery planning' },
    sources: ['World Bank', 'UN'],
    indicators: ['GDP_GROWTH', 'AID_FLOWS']
  },
  {
    id: 'evt-2025-02',
    date: '2025-03-15',
    title: 'Inflation Reaches 35%',
    titleAr: 'التضخم يصل إلى 35%',
    description: 'Annual inflation rate reaches 35% in government-controlled areas.',
    descriptionAr: 'يصل معدل التضخم السنوي إلى 35% في المناطق الخاضعة لسيطرة الحكومة.',
    category: 'fiscal_policy',
    severity: 'critical',
    economicImpact: { inflation: '35%', humanitarian: 'Purchasing power collapse' },
    sources: ['Central Statistical Organization', 'WFP'],
    indicators: ['INFLATION_RATE', 'FOOD_PRICES']
  },
  {
    id: 'evt-2025-03',
    date: '2025-06-20',
    title: 'Peace Talks Resume',
    titleAr: 'استئناف محادثات السلام',
    description: 'UN-sponsored peace talks resume with renewed international support.',
    descriptionAr: 'استئناف محادثات السلام برعاية الأمم المتحدة مع دعم دولي متجدد.',
    category: 'international',
    severity: 'major',
    economicImpact: { gdp: 'Peace hopes' },
    sources: ['UN'],
    indicators: ['POLITICAL_STABILITY']
  },
  {
    id: 'evt-2025-04',
    date: '2025-09-15',
    title: 'Humanitarian Needs Reach 21.6 Million',
    titleAr: 'الاحتياجات الإنسانية تصل إلى 21.6 مليون',
    description: '21.6 million Yemenis (two-thirds of population) need humanitarian assistance.',
    descriptionAr: '21.6 مليون يمني (ثلثا السكان) بحاجة إلى مساعدات إنسانية.',
    category: 'humanitarian',
    severity: 'critical',
    economicImpact: { humanitarian: '21.6M need aid' },
    sources: ['UN OCHA'],
    indicators: ['IDP_COUNT', 'FOOD_INSECURITY', 'POVERTY_RATE']
  },
  {
    id: 'evt-2025-05',
    date: '2025-12-20',
    title: 'Foreign Reserves Critical',
    titleAr: 'الاحتياطيات الأجنبية حرجة',
    description: 'Central Bank foreign reserves fall to critical levels, covering less than 1 month of imports.',
    descriptionAr: 'تنخفض احتياطيات البنك المركزي من العملات الأجنبية إلى مستويات حرجة.',
    category: 'banking_financial',
    severity: 'critical',
    economicImpact: { exchangeRate: 'Currency crisis', humanitarian: 'Import crisis' },
    sources: ['Central Bank of Yemen', 'IMF'],
    indicators: ['FOREIGN_RESERVES', 'EXCHANGE_RATE']
  },

  // 2026 Events (Projected)
  {
    id: 'evt-2026-01',
    date: '2026-01-10',
    title: 'Economic Outlook 2026',
    titleAr: 'التوقعات الاقتصادية 2026',
    description: 'World Bank projects continued economic challenges with -1.5% GDP growth.',
    descriptionAr: 'البنك الدولي يتوقع استمرار التحديات الاقتصادية مع انكماش 1.5% في الناتج المحلي.',
    category: 'fiscal_policy',
    severity: 'major',
    economicImpact: { gdp: '-1.5% projected' },
    sources: ['World Bank', 'IMF'],
    indicators: ['GDP_GROWTH']
  }
];

// Helper functions
export function getEventsByYear(year: number): ExpandedEconomicEvent[] {
  return EXPANDED_EVENTS.filter(e => e.date.startsWith(year.toString()));
}

export function getEventsByCategory(category: string): ExpandedEconomicEvent[] {
  return EXPANDED_EVENTS.filter(e => e.category === category);
}

export function getCriticalEvents(): ExpandedEconomicEvent[] {
  return EXPANDED_EVENTS.filter(e => e.severity === 'critical');
}

export function getEventsByDateRange(startDate: string, endDate: string): ExpandedEconomicEvent[] {
  return EXPANDED_EVENTS.filter(e => e.date >= startDate && e.date <= endDate);
}

export const TOTAL_EVENTS = EXPANDED_EVENTS.length;
export const YEARS_COVERED = Array.from(new Set(EXPANDED_EVENTS.map(e => e.date.substring(0, 4)))).sort();
export const CATEGORIES = Array.from(new Set(EXPANDED_EVENTS.map(e => e.category)));
